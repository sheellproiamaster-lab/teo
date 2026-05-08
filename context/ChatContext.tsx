"use client";
import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export interface QuestionCards {
  q: string;
  o: string[];
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  searched?: boolean;
  questionCards?: QuestionCards | null;
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
  isBlocked: boolean;
  messagesUsed: number;
  setActiveId: (id: string | null) => void;
  newConversation: () => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  toggleFavorite: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);
const DAILY_LIMIT = 15;

function getUsageKey(userId: string) {
  return `teo_usage_${userId}_${new Date().toDateString()}`;
}

function getCooldownKey(userId: string) {
  return `teo_cooldown_${userId}`;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messagesUsed, setMessagesUsed] = useState(0);
  const conversationsRef = useRef<Conversation[]>([]);
  const isPro = user?.plan === "pro";

  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

  // Carrega uso do dia
  useEffect(() => {
    if (!user) return;
    const key = getUsageKey(user.id);
    const stored = parseInt(localStorage.getItem(key) || "0");
    setMessagesUsed(stored);
  }, [user]);

  // Carrega conversas do Supabase
  useEffect(() => {
    if (!user) { setConversations([]); setActiveId(null); return; }
    const load = async () => {
      const { data: convs } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (!convs) return;

      const full: Conversation[] = await Promise.all(convs.map(async c => {
        const { data: msgs } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: true });

        return {
          id: c.id,
          title: c.title,
          createdAt: c.created_at,
          isFavorite: false,
          messages: (msgs || []).map(m => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: m.created_at,
            questionCards: null,
          })),
        };
      }));

      setConversations(full);
    };
    load();
  }, [user]);

  const isBlocked = !isPro && messagesUsed >= DAILY_LIMIT;

  const active = conversations.find(c => c.id === activeId) ?? null;

  const newConversation = useCallback(() => {
    const id = crypto.randomUUID();
    const conv: Conversation = {
      id, title: "Nova conversa", messages: [],
      createdAt: new Date().toISOString(), isFavorite: false,
    };
    setConversations(prev => [conv, ...prev]);
    setActiveId(id);
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    await supabase.from("conversations").delete().eq("id", id);
    setConversations(prev => prev.filter(c => c.id !== id));
    setActiveId(prev => prev === id ? null : prev);
  }, []);

  const renameConversation = useCallback(async (id: string, title: string) => {
    await supabase.from("conversations").update({ title }).eq("id", id);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title } : c));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!user) return;

    // Verifica limite para usuários gratuitos
    if (!isPro && messagesUsed >= DAILY_LIMIT) {
      // Inicia cooldown de 6 horas se ainda não iniciou
      const cooldownKey = getCooldownKey(user.id);
      const existing = localStorage.getItem(cooldownKey);
      if (!existing) {
        const end = Date.now() + 6 * 60 * 60 * 1000;
        localStorage.setItem(cooldownKey, String(end));
      }
      return;
    }

    setIsLoading(true);

    // Incrementa contador de uso
    if (!isPro) {
      const key = getUsageKey(user.id);
      const newCount = messagesUsed + 1;
      localStorage.setItem(key, String(newCount));
      setMessagesUsed(newCount);
    }

    const userMsg: Message = {
      id: crypto.randomUUID(), role: "user", content,
      timestamp: new Date().toISOString(),
    };

    const targetId: string = activeId ?? crypto.randomUUID();
    const isNew = !activeId;
    const currentConv = conversationsRef.current.find(c => c.id === targetId);
    const apiMessages = [...(currentConv?.messages ?? []), userMsg].map(m => ({ role: m.role, content: m.content }));

    if (isNew || !currentConv) {
      const title = content.slice(0, 45) + (content.length > 45 ? "…" : "");
      await supabase.from("conversations").insert({ id: targetId, user_id: user.id, title });
      setConversations(prev => [{
        id: targetId, title, messages: [userMsg],
        createdAt: new Date().toISOString(), isFavorite: false,
      }, ...prev]);
      if (isNew) setActiveId(targetId);
    } else {
      const autoTitle = currentConv.messages.length === 0 && currentConv.title === "Nova conversa"
        ? content.slice(0, 45) + (content.length > 45 ? "…" : "")
        : currentConv.title;
      if (autoTitle !== currentConv.title) {
        await supabase.from("conversations").update({ title: autoTitle }).eq("id", targetId);
      }
      setConversations(prev => prev.map(c => c.id === targetId ? {
        ...c, title: autoTitle, messages: [...c.messages, userMsg],
      } : c));
    }

    await supabase.from("messages").insert({
      id: userMsg.id, conversation_id: targetId, user_id: user.id,
      role: "user", content, type: "text",
    });

    try {
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
        questionCards: data.questionCards ?? null,
      };

      await supabase.from("messages").insert({
        id: assistantMsg.id, conversation_id: targetId, user_id: user.id,
        role: "assistant", content: assistantMsg.content, type: "text",
      });

      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", targetId);

      setConversations(prev => prev.map(c => c.id === targetId ? {
        ...c, messages: [...c.messages, assistantMsg],
      } : c));
    } catch {
      const errMsg: Message = {
        id: crypto.randomUUID(), role: "assistant",
        content: "Erro de conexão. Verifique sua internet e tente novamente.",
        timestamp: new Date().toISOString(),
      };
      setConversations(prev => prev.map(c => c.id === targetId ? {
        ...c, messages: [...c.messages, errMsg],
      } : c));
    } finally {
      setIsLoading(false);
    }
  }, [activeId, user, isPro, messagesUsed]);

  return (
    <ChatContext.Provider value={{
      conversations, activeId, active, isLoading, isBlocked, messagesUsed,
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