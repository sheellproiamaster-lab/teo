"use client";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import MessageBubble from "./MessageBubble";
import WelcomeScreen from "./WelcomeScreen";
import ChatInput from "./ChatInput";
import Image from "next/image";

interface Props {
  onMenuToggle: () => void;
}

function TeoTyping() {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? "" : d + ".");
    }, 400);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex items-end gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border-2 border-blue-200 relative">
        <Image src="/teo-avatar.jpeg" alt="Teo" fill className="object-cover" />
      </div>
      <div className="bg-white border border-blue-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <p className="text-sm text-blue-500 font-medium">Teo está executando{dots}</p>
      </div>
    </div>
  );
}

export default function ChatMain({ onMenuToggle }: Props) {
  const { active, isLoading } = useChat();
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messages = active?.messages ?? [];
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const isPro = user?.plan === "pro";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setToast("Erro ao abrir pagamento. Tente novamente.");
    } catch {
      setToast("Erro de conexão. Tente novamente.");
    } finally {
      setUpgradeLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-slate-50">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-blue-100 shadow-sm">
        <button
          onClick={onMenuToggle}
          className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
          Menu
        </button>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-lg font-black text-blue-600">Teo</span>
        </div>

        {!isPro ? (
          <button
            onClick={handleUpgrade}
            disabled={upgradeLoading}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-all disabled:opacity-60"
          >
            ⭐ {upgradeLoading ? "Aguarde..." : "Seja VIP — R$47/mês"}
          </button>
        ) : (
          <span className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
            ⭐ VIP
          </span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <WelcomeScreen inputRef={inputRef} />
        ) : (
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {isLoading && <TeoTyping />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <ChatInput isWelcome={messages.length === 0} inputRef={inputRef} />
    </div>
  );
}