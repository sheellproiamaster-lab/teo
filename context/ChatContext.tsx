"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  searched?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  isFavorite: boolean;
}

interface ChatContextType {
  conversations: Conversation[];
  activeId: string | null;
  active: Conversation | null;
  isLoading: boolean;
  setActiveId: (id: string | null) => void;
  newConversation: () => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  toggleFavorite: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

const STORAGE_KEY = "teo_conversations";

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setConversations(JSON.parse(stored));
    } catch {}
  }, []);

  const persist = useCallback((convs: Conversation[]) => {
    setConversations(convs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
  }, []);

  const active = conversations.find(c => c.id === activeId) ?? null;

  const newConversation = useCallback(() => {
    const id = crypto.randomUUID();
    const conv: Conversation = {
      id, title: "Nova conversa", messages: [],
      createdAt: new Date().toISOString(), isFavorite: false,
    };
    setConversations(prev => {
      const updated = [conv, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    setActiveId(id);
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    setActiveId(prev => prev === id ? null : prev);
  }, []);

  const renameConversation = useCallback((id: string, title: string) => {
    setConversations(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, title } : c);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setConversations(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);

    const userMsg: Message = {
      id: crypto.randomUUID(), role: "user", content,
      timestamp: new Date().toISOString(),
    };

    let targetId: string;

    setConversations(prev => {
      const existing = activeId ? prev.find(c => c.id === activeId) : null;
      if (existing) {
        targetId = existing.id;
        return prev.map(c => c.id === targetId ? {
          ...c,
          messages: [...c.messages, userMsg],
          title: c.messages.length === 0 ? content.slice(0, 45) : c.title,
        } : c);
      } else {
        targetId = crypto.randomUUID();
        const newConv: Conversation = {
          id: targetId,
          title: content.slice(0, 45) + (content.length > 45 ? "…" : ""),
          messages: [userMsg],
          createdAt: new Date().toISOString(),
          isFavorite: false,
        };
        setActiveId(targetId);
        return [newConv, ...prev];
      }
    });

    // slight delay to let state settle
    await new Promise(r => setTimeout(r, 50));

    try {
      let apiMessages: { role: string; content: string }[] = [];
      setConversations(prev => {
        const conv = prev.find(c => c.id === targetId!);
        if (conv) apiMessages = conv.messages.map(m => ({ role: m.role, content: m.content }));
        return prev;
      });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        id: crypto.randomUUID(), role: "assistant",
        content: data.content || "Ocorreu um erro. Tente novamente.",
        timestamp: new Date().toISOString(),
        searched: data.searched,
      };

      setConversations(prev => {
        const updated = prev.map(c => c.id === targetId! ? { ...c, messages: [...c.messages, assistantMsg] } : c);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch {
      const errMsg: Message = {
        id: crypto.randomUUID(), role: "assistant",
        content: "Erro de conexão. Verifique sua internet e tente novamente.",
        timestamp: new Date().toISOString(),
      };
      setConversations(prev => {
        const updated = prev.map(c => c.id === targetId! ? { ...c, messages: [...c.messages, errMsg] } : c);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeId]);

  return (
    <ChatContext.Provider value={{
      conversations, activeId, active, isLoading,
      setActiveId, newConversation, deleteConversation,
      renameConversation, toggleFavorite, sendMessage,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat fora do ChatProvider");
  return ctx;
}
