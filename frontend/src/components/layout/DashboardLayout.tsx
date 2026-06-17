"use client";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen } = useUIStore();

  return (
    <div className="flex h-screen bg-white dark:bg-surface-900">
      <Sidebar />
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          "lg:ml-[280px]"
        )}
      >
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
