export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "user" | "admin";
  subscription?: Subscription;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subscription {
  plan: "free" | "pro";
  status: "active" | "canceled" | "past_due" | "trialing";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  usage: Usage;
}

export interface Usage {
  documentsUploaded: number;
  searchesPerformed: number;
  storageUsed: number;
  documentsLimit: number;
  searchesLimit: number;
  storageLimit: number;
}

export interface Document {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  chunks: number;
  indexed: boolean;
  embedding?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  sources?: SearchResult[];
}

export interface SearchResult {
  id: string;
  content: string;
  documentId: string;
  documentName: string;
  similarity: number;
  chunkIndex: number;
}

export interface SearchHistory {
  id: string;
  userId: string;
  query: string;
  results: number;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteAnswer {
  _id: string;
  userId: string;
  question: string;
  answer: string;
  sources: SearchResult[];
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Stats {
  totalDocuments: number;
  totalSearches: number;
  totalUsers: number;
  storageUsed: number;
  activeSubscriptions: number;
  revenue: number;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  highlighted?: boolean;
}
