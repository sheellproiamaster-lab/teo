"use client";
import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export interface QuestionCards {
  q: string;
  o: string[];
}

export interface FileAttachment {
  name: string;
  type: string;
  url: string;
  isImage: boolean;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  searched?: boolean;
  questionCards?: QuestionCards | null;
  attachments?: FileAttachment[];
  imageUrl?: string | null;
  docType?: "pdf" | "word" | null;
  docContent?: string | null;
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
  cooldownRemaining: number;
  messagesUsed: number;
  setActiveId: (id: string | null) => void;
  loadMessages: (convId: string) => Promise<void>;
  newConversation: () => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  toggleFavorite: (id: string) => void;
  sendMessage: (content: string, attachments?: FileAttachment[]) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);
const DAILY_LIMIT = 15;
const COOLDOWN_MS = 6 * 60 * 60 * 1000;

function getUsageKey(userId: string) {
  return `teo_usage_${userId}_${new Date().toDateString()}`;
}

function getCooldownKey(userId: string) {
  return `teo_cooldown_${userId}`;
}

async function uploadFileToStorage(file: FileAttachment): Promise<string> {
  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file }),
    });
    const data = await res.json();
    return data.url || file.url;
  } catch {
    return file.url;
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const [messagesUsed, setMessagesUsed] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const conversationsRef = useRef<Conversation[]>([]);
  const isPro = user?.plan === "pro";

  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

  useEffect(() => {
    if (!user) return;
    const key = getUsageKey(user.id);
    const stored = parseInt(localStorage.getItem(key) || "0");
    setMessagesUsed(stored);

    const cooldownKey = getCooldownKey(user.id);
    const cooldownEnd = parseInt(localStorage.getItem(cooldownKey) || "0");
    if (cooldownEnd > Date.now()) {
      setCooldownRemaining(cooldownEnd - Date.now());
    } else {
      localStorage.removeItem(cooldownKey);
      // Se o limite já foi atingido mas não há cooldown ativo, inicia agora
      if (stored >= DAILY_LIMIT) {
        const end = Date.now() + COOLDOWN_MS;
        localStorage.setItem(cooldownKey, String(end));
        setCooldownRemaining(COOLDOWN_MS);
      }
    }
  }, [user]);

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining(prev => {
        if (prev <= 1000) {
          if (user) {
            const key = getUsageKey(user.id);
            localStorage.setItem(key, "0");
            setMessagesUsed(0);
            localStorage.removeItem(getCooldownKey(user.id));
          }
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining, user]);

  useEffect(() => {
    if (!user) { setConversations([]); setActiveIdState(null); return; }
    const load = async () => {
      const { data: convs } = await supabase
        .from("conversations")
        .select("id, title, created_at, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(20);

      if (!convs) return;

      setConversations(convs.map(c => ({
        id: c.id,
        title: c.title,
        createdAt: c.created_at,
        isFavorite: false,
        messages: [],
      })));
    };
    load();
  }, [user]);

  const loadMessages = useCallback(async (convId: string) => {
    const already = conversationsRef.current.find(c => c.id === convId);
    if (already && already.messages.length > 0) return;

    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(50);

    setConversations(prev => prev.map(c => c.id === convId ? {
      ...c,
      messages: (msgs || []).map(m => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: m.created_at,
        searched: m.metadata?.searched ?? false,
        questionCards: m.metadata?.questionCards ?? null,
        imageUrl: m.image_url ?? null,
        docType: m.document_type ?? null,
        docContent: m.metadata?.docContent ?? null,
        attachments: [],
      })),
    } : c));
  }, []);

  const setActiveId = useCallback((id: string | null) => {
    setActiveIdState(id);
    if (id) loadMessages(id);
  }, [loadMessages]);

  const isBlocked = !isPro && messagesUsed >= DAILY_LIMIT;
  const active = conversations.find(c => c.id === activeId) ?? null;

  const newConversation = useCallback(() => {
    const id = crypto.randomUUID();
    const conv: Conversation = {
      id, title: "Nova conversa", messages: [],
      createdAt: new Date().toISOString(), isFavorite: false,
    };
    setConversations(prev => [conv, ...prev]);
    setActiveIdState(id);
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    await supabase.from("conversations").delete().eq("id", id);
    setConversations(prev => prev.filter(c => c.id !== id));
    setActiveIdState(prev => prev === id ? null : prev);
  }, []);

  const renameConversation = useCallback(async (id: string, title: string) => {
    await supabase.from("conversations").update({ title }).eq("id", id);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title } : c));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
  }, []);

  const sendMessage = useCallback(async (content: string, attachments?: FileAttachment[]) => {
    if (!user) return;
    if (isLoadingRef.current) return;
    if (!isPro && messagesUsed >= DAILY_LIMIT) {
      const cooldownKey = getCooldownKey(user.id);
      const existing = localStorage.getItem(cooldownKey);
      if (!existing) {
        const end = Date.now() + COOLDOWN_MS;
        localStorage.setItem(cooldownKey, String(end));
        setCooldownRemaining(COOLDOWN_MS);
      }
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);

    if (!isPro) {
      const key = getUsageKey(user.id);
      const newCount = messagesUsed + 1;
      localStorage.setItem(key, String(newCount));
      setMessagesUsed(newCount);
      if (newCount >= DAILY_LIMIT) {
        const cooldownKey = getCooldownKey(user.id);
        if (!localStorage.getItem(cooldownKey)) {
          const end = Date.now() + COOLDOWN_MS;
          localStorage.setItem(cooldownKey, String(end));
          setCooldownRemaining(COOLDOWN_MS);
        }
      }
    }

    let uploadedAttachments = attachments || [];
    if (attachments && attachments.length > 0) {
      uploadedAttachments = await Promise.all(
        attachments.map(async att => {
          const publicUrl = await uploadFileToStorage(att);
          return { ...att, url: publicUrl };
        })
      );
    }

    const userMsg: Message = {
      id: crypto.randomUUID(), role: "user", content,
      timestamp: new Date().toISOString(),
      attachments: uploadedAttachments,
    };

    const targetId: string = activeId ?? crypto.randomUUID();
    const isNew = !activeId;
    const currentConv = conversationsRef.current.find(c => c.id === targetId);

    // Limita histórico a 6 mensagens para ser mais rápido
    const apiMessages = [...(currentConv?.messages ?? []), userMsg]
      .slice(-6)
      .map(m => ({
        role: m.role,
        content: m.content,
        attachments: m.attachments || [],
      }));

    if (isNew || !currentConv) {
      const title = content.slice(0, 45) + (content.length > 45 ? "…" : "") || (attachments?.length ? `${attachments.length} arquivo(s)` : "Nova conversa");
      await supabase.from("conversations").insert({ id: targetId, user_id: user.id, title });
      setConversations(prev => [{
        id: targetId, title, messages: [userMsg],
        createdAt: new Date().toISOString(), isFavorite: false,
      }, ...prev]);
      setActiveIdState(targetId);
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
      role: "user", content: content || "arquivo", type: "text",
    });

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90000);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, attachments: uploadedAttachments }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const assistantMsg: Message = {
        id: crypto.randomUUID(), role: "assistant",
        content: data.content || "Ocorreu um erro. Tente novamente.",
        timestamp: new Date().toISOString(),
        searched: data.searched,
        questionCards: data.questionCards ?? null,
        imageUrl: data.imageUrl ?? null,
        docType: data.docType ?? null,
        docContent: data.docContent ?? null,
      };

      await supabase.from("messages").insert({
        id: assistantMsg.id,
        conversation_id: targetId,
        user_id: user.id,
        role: "assistant",
        content: assistantMsg.content,
        type: "text",
        image_url: assistantMsg.imageUrl ?? null,
        document_type: assistantMsg.docType ?? null,
        metadata: {
          searched: assistantMsg.searched ?? false,
          questionCards: assistantMsg.questionCards ?? null,
          docContent: assistantMsg.docContent ?? null,
        },
      });

      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", targetId);

      setConversations(prev => prev.map(c => c.id === targetId ? {
        ...c, messages: [...c.messages, assistantMsg],
      } : c));

    } catch (err: any) {
      const isTimeout = err?.name === "AbortError";
      const errMsg: Message = {
        id: crypto.randomUUID(), role: "assistant",
        content: isTimeout
          ? "Demorei mais que o esperado. Tente novamente com uma mensagem mais curta."
          : "Erro de conexão. Verifique sua internet e tente novamente.",
        timestamp: new Date().toISOString(),
      };
      setConversations(prev => prev.map(c => c.id === targetId ? {
        ...c, messages: [...c.messages, errMsg],
      } : c));
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [activeId, user, isPro, messagesUsed]);

  return (
    <ChatContext.Provider value={{
      conversations, activeId, active, isLoading, isBlocked,
      cooldownRemaining, messagesUsed,
      setActiveId, loadMessages, newConversation, deleteConversation,
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