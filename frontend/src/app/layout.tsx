import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "@/components/ui/Toast";
import AuthProvider from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "realAI - AI-Powered Semantic Search Engine",
  description:
    "Upload documents and ask questions in natural language. realAI uses RAG technology to search and understand your documents with AI.",
  keywords: ["AI search", "semantic search", "RAG", "document search", "AI chatbot"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var m = localStorage.getItem('darkMode');
                  if (m === 'false') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <AuthProvider>
          <ToastProvider />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
