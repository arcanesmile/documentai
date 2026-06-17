import { create } from "zustand";
import { Document } from "@/types";
import { api } from "@/lib/api";

interface DocumentState {
  documents: Document[];
  isLoading: boolean;
  uploading: boolean;
  uploadProgress: number;
  error: string | null;

  fetchDocuments: () => Promise<void>;
  uploadDocument: (file: File) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useDocumentStore = create<DocumentState>()((set, get) => ({
  documents: [],
  isLoading: false,
  uploading: false,
  uploadProgress: 0,
  error: null,

  fetchDocuments: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.get<Document[]>("/documents");
      set({ documents: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  uploadDocument: async (file: File) => {
    try {
      set({ uploading: true, uploadProgress: 0, error: null });
      const formData = new FormData();
      formData.append("file", file);

      const data = await api.upload<Document>("/documents/upload", formData, (progress) => {
        set({ uploadProgress: progress });
      });

      set((state) => ({
        documents: [data, ...state.documents],
        uploading: false,
        uploadProgress: 100,
      }));
    } catch (err: any) {
      set({ error: err.message, uploading: false, uploadProgress: 0 });
    }
  },

  deleteDocument: async (id: string) => {
    try {
      set({ error: null });
      await api.delete(`/documents/${id}`);
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  clearError: () => set({ error: null }),
}));
