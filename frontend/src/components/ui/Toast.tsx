"use client";
import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#1e293b",
          color: "#f1f5f9",
          border: "1px solid rgba(51, 65, 85, 0.5)",
          borderRadius: "12px",
          fontSize: "14px",
        },
        success: {
          iconTheme: {
            primary: "#10b981",
            secondary: "#f1f5f9",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#f1f5f9",
          },
        },
      }}
    />
  );
}
