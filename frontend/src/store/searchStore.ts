import { create } from "zustand";
import { SearchResult, SearchHistory } from "@/types";
import { api } from "@/lib/api";

interface SearchState {
  query: string;
  results: SearchResult[];
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
  history: [],
  isSearching: false,
  error: null,
  selectedDocumentIds: [],

  setQuery: (query) => set({ query }),

  search: async (query: string) => {
    try {
      set({ isSearching: true, error: null, query });
      const data = await api.post<{ results: SearchResult[] }>("/search", {
        query,
        documentIds: get().selectedDocumentIds.length > 0 ? get().selectedDocumentIds : undefined,
      });
      set({ results: data.results, isSearching: false });
    } catch (err: any) {
      set({ error: err.message, isSearching: false });
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

  clearResults: () => set({ results: [], query: "" }),
  clearError: () => set({ error: null }),
}));
