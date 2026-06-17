import { create } from "zustand";
import { ChatMessage, Conversation } from "@/types";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  isLoading: boolean;
  error: string | null;
  abortController: AbortController | null;

  fetchConversations: () => Promise<void>;
  createConversation: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  stopStreaming: () => void;
  deleteConversation: (id: string) => Promise<void>;
  regenerateLast: () => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

function getAuthHeaders(): Record<string, string> {
  let token: string | null = null;
  if (typeof window !== "undefined") {
    const user = useAuthStore.getState()?.user;
    token = (user as any)?.id ?? null;
  }
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const useChatStore = create<ChatState>()((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isStreaming: false,
  isLoading: false,
  error: null,
  abortController: null,

  fetchConversations: async () => {
    try {
      set({ isLoading: true });
      const data = await api.get<Conversation[]>("/chat/conversations");
      set({ conversations: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createConversation: async () => {
    try {
      set({ isLoading: true });
      const data = await api.post<Conversation>("/chat/conversations", {
        title: "New Chat",
      });
      set((state) => ({
        conversations: [data, ...state.conversations],
        currentConversation: data,
        messages: [],
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  selectConversation: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.get<Conversation>(`/chat/conversations/${id}`);
      set({
        currentConversation: data,
        messages: data.messages || [],
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  stopStreaming: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
      set({ isStreaming: false, abortController: null });
    }
  },

  sendMessage: async (content: string) => {
    const { currentConversation } = get();
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isStreaming: true,
      error: null,
    }));

    const abortController = new AbortController();
    set({ abortController });

    try {
      const headers = getAuthHeaders();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/stream`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            message: content,
            conversationId: currentConversation?._id,
          }),
          signal: abortController.signal,
        }
      );

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(errBody ? `Request failed (${response.status})` : `Request failed (${response.status})`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      let fullContent = "";
      const decoder = new TextDecoder();

      const assistantId = (Date.now() + 1).toString();
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
      }));

      let buffer = "";
      let receivedSources: any[] | undefined;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              set((state) => ({
                messages: state.messages.map((msg) =>
                  msg.id === assistantId
                    ? { ...msg, content: fullContent }
                    : msg
                ),
              }));
            }
            if (parsed.done) {
              receivedSources = parsed.sources;
              const finalConvId = parsed.conversationId;
              if (finalConvId) {
                set((state) => ({
                  currentConversation: state.currentConversation
                    ? { ...state.currentConversation, _id: finalConvId }
                    : null,
                }));
              }
            }
          } catch {}
        }
      }

      set((state) => ({
        isStreaming: false,
        abortController: null,
        messages: state.messages.map((msg) =>
          msg.id === assistantId
            ? { ...msg, sources: receivedSources as any || msg.sources }
            : msg
        ),
      }));

      await get().fetchConversations();
    } catch (err: any) {
      if (err.name === "AbortError") {
        set({ isStreaming: false, abortController: null });
        return;
      }
      set((state) => ({
        isStreaming: false,
        abortController: null,
        messages: state.messages.filter((m) => m.role !== "assistant" || m.content),
        error: err.message,
      }));
    }
  },

  regenerateLast: async () => {
    const { messages } = get();
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;
    set((state) => ({
      messages: state.messages.filter(
        (m) => m.id !== lastUserMsg.id && m.role !== "assistant"
      ),
    }));
    await get().sendMessage(lastUserMsg.content);
  },

  deleteConversation: async (id: string) => {
    try {
      await api.delete(`/chat/conversations/${id}`);
      set((state) => ({
        conversations: state.conversations.filter((c) => c._id !== id),
        currentConversation:
          state.currentConversation?._id === id ? null : state.currentConversation,
        messages:
          state.currentConversation?._id === id ? [] : state.messages,
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  clearMessages: () => set({ messages: [], currentConversation: null }),
  clearError: () => set({ error: null }),
}));
