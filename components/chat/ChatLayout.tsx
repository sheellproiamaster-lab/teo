"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";
import ChatSidebar from "./ChatSidebar";
import ChatMain from "./ChatMain";

export default function ChatLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [user, loading, router]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <ChatProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <ChatSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <ChatMain onMenuToggle={() => setSidebarOpen(o => !o)} />
      </div>
    </ChatProvider>
  );
}
