"use client";
import ChatInterface from "@/components/chat/ChatInterface";
import Badge from "@/components/ui/Badge";

export default function ChatPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
        <Badge variant="warning">Coming soon</Badge>
        <span>AI Chat is still being prepared and may not be fully available yet.</span>
      </div>
      <ChatInterface />
    </div>
  );
}
