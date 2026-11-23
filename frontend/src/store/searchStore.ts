import { create } from "zustand";
import { SearchResult, SearchHistory } from "@/types";
import { api } from "@/lib/api";

interface SearchState {
  query: string;
  results: SearchResult[];
  answer: string | null;
  answerError: string | null;
  history: SearchHistory[];
  isSearching: boolean;
  error: string | null;
  selectedDocumentIds: string[];

  setQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  fetchHistory: () => Promise<void>;
  toggleDocumentFilter: (id: string) => void;
  clearResults: () => void;
  clearError: () => void;
}

export const useSearchStore = create<SearchState>()((set, get) => ({
  query: "",
  results: [],
  answer: null,
  answerError: null,
  history: [],
  isSearching: false,
  error: null,
  selectedDocumentIds: [],

  setQuery: (query) => set({ query }),

  search: async (query: string) => {
    try {
      set({ isSearching: true, error: null, query, answer: null, answerError: null });
      const data = await api.post<{ results: SearchResult[]; answer: string | null; answerError: string | null }>("/search", {
        query,
        documentIds: get().selectedDocumentIds.length > 0 ? get().selectedDocumentIds : undefined,
      });
      set({ results: data.results, answer: data.answer, answerError: data.answerError, isSearching: false });
      get().fetchHistory();
    } catch (err: any) {
      set({ error: err?.response?.data?.detail || err.message, isSearching: false, results: [] });
    }
  },

  fetchHistory: async () => {
    try {
      const data = await api.get<SearchHistory[]>("/search/history");
      set({ history: data });
    } catch {}
  },

  toggleDocumentFilter: (id: string) => {
    set((state) => ({
      selectedDocumentIds: state.selectedDocumentIds.includes(id)
        ? state.selectedDocumentIds.filter((docId) => docId !== id)
        : [...state.selectedDocumentIds, id],
    }));
  },

  clearResults: () => set({ results: [], answer: null, answerError: null, query: "" }),
  clearError: () => set({ error: null }),
}));
