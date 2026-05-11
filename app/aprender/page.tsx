"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useChat, ChatProvider } from "@/context/ChatContext";
import Image from "next/image";
import MessageBubble from "@/components/chat/MessageBubble";

const LEARN_PROMPTS = [
  "Me ensine como funciona o cérebro TEA, passo a passo",
  "Quero aprender técnicas de comunicação alternativa na prática",
  "Me ensine estratégias reais para crises de regulação emocional",
  "Quero aprender sobre TDAH: como funciona e o que realmente ajuda",
  "Me ajuda a aprender como montar uma rotina eficaz para meu filho",
  "Quero aprender meus direitos na inclusão escolar e como agir",
  "Me ensine ABA de forma simples e aplicável no dia a dia",
  "Quero aprender sobre altas habilidades e superdotação",
];

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

function AprenderContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { sendMessage, active, newConversation, isLoading, isBlocked, messagesUsed, cooldownRemaining } = useChat();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const DAILY_LIMIT = 15;

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      newConversation();
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length, isLoading]);

  const submit = async (content: string) => {
    if (!content.trim() || isLoading || isBlocked) return;
    setText("");
    await sendMessage(`[Modo Aprenda com o Teo] ${content}`);
  };

  const messages = active?.messages ?? [];

  function formatCooldown(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-4 py-4 text-white flex items-center gap-3 shadow-lg">
        <button onClick={() => router.back()} className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/40 relative flex-shrink-0">
          <Image src="/teo-avatar.jpeg" alt="Teo" fill className="object-cover" />
        </div>
        <div className="flex-1">
          <p className="font-black text-sm">Aprenda com o Teo</p>
          <p className="text-white/70 text-xs">Seu professor particular</p>
        </div>
        <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-semibold">
          {DAILY_LIMIT - messagesUsed} msgs
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="text-center">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-blue-200 shadow-xl mx-auto mb-3">
                <Image src="/teo-avatar.jpeg" alt="Teo" fill className="object-cover" />
              </div>
              <h2 className="text-blue-900 font-black text-xl mb-2">O que você quer aprender?</h2>
              <p className="text-slate-500 text-sm">Escolha um tema ou digite sua dúvida</p>
            </div>
            <div className="w-full max-w-lg flex flex-col gap-2">
              {LEARN_PROMPTS.map((prompt, i) => (
                <button key={i} onClick={() => submit(prompt)} className="w-full text-left bg-white border border-blue-100 hover:border-blue-300 hover:bg-blue-50 rounded-2xl px-4 py-3 text-sm text-blue-800 font-medium transition-all shadow-sm flex items-center gap-3">
                  <span className="text-blue-400 flex-shrink-0">→</span>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={{
                ...msg,
                content: msg.content.replace("[Modo Aprenda com o Teo] ", ""),
              }} />
            ))}
            {isLoading && <TeoTyping />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t border-blue-100 bg-white px-4 py-3">
        <div className="max-w-3xl mx-auto">
          {isBlocked && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-center">
              <p className="text-red-600 font-bold text-sm">Limite diário atingido</p>
              {cooldownRemaining > 0 ? (
                <p className="text-slate-500 text-xs font-mono">Libera em: {formatCooldown(cooldownRemaining)}</p>
              ) : (
                <p className="text-slate-500 text-xs">Volte em 6 horas ou assine o VIP</p>
              )}
            </div>
          )}
          <div className={`flex items-end gap-2 bg-slate-50 border rounded-2xl px-3 py-2 transition-all ${isBlocked ? "border-red-200 opacity-60 pointer-events-none" : "border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"}`}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(text); } }}
              placeholder="Digite sua dúvida ou o que quer aprender..."
              rows={1}
              disabled={isLoading || isBlocked}
              className="flex-1 bg-transparent resize-none text-sm text-slate-700 placeholder-slate-400 focus:outline-none py-1.5 max-h-32 min-h-[36px]"
              style={{ lineHeight: "1.5" }}
              onInput={e => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 128) + "px";
              }}
            />
            <button
              onClick={() => submit(text)}
              disabled={!text.trim() || isLoading || isBlocked}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center transition-all mb-0.5 disabled:opacity-40 shadow-sm"
            >
              {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">
            {isBlocked ? "Limite atingido · Assine o VIP" : `${DAILY_LIMIT - messagesUsed} mensagens restantes hoje`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AprenderPage() {
  return (
    <ChatProvider>
      <AprenderContent />
    </ChatProvider>
  );
}