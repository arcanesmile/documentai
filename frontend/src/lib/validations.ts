import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(500),
  documentIds: z.array(z.string()).optional(),
});

export const chatSchema = z.object({
  message: z.string().min(1, "Message is required").max(2000),
  conversationId: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type ChatInput = z.infer<typeof chatSchema>;
