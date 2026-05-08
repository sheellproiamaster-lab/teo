"use client";
import { useState, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";

export default function ChatInput() {
  const { sendMessage, isLoading, isBlocked, messagesUsed } = useChat();
  const { user } = useAuth();
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const isPro = user?.plan === "pro";
  const DAILY_LIMIT = 15;

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || isBlocked) return;
    setText("");
    await sendMessage(trimmed);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  return (
    <div className="border-t border-blue-100 bg-white px-4 py-3">
      <div className="max-w-3xl mx-auto">

        {/* Banner de bloqueio */}
        {isBlocked && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-red-600 font-bold text-sm">Limite diário atingido</p>
              <p className="text-slate-500 text-xs">Você usou {messagesUsed} de {DAILY_LIMIT} mensagens hoje.</p>
            </div>
            <button
              onClick={async () => {
                const res = await fetch("/api/stripe/checkout", { method: "POST" });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
              }}
              className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition-all hover:from-blue-700 hover:to-cyan-600"
            >
              ⭐ Seja VIP
            </button>
          </div>
        )}

        <div className={`flex items-end gap-2 bg-slate-50 border rounded-2xl px-3 py-2 transition-all ${
          isBlocked
            ? "border-red-200 opacity-60 pointer-events-none"
            : "border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"
        }`}>
          <button
            onClick={() => fileRef.current?.click()}
            title="Anexar arquivo"
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-500 flex items-center justify-center transition-colors mb-0.5"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}>
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
          <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx,.txt" />

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder={isBlocked ? "Limite diário atingido..." : "Digite sua mensagem para o Teo..."}
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
            onClick={submit}
            disabled={!text.trim() || isLoading || isBlocked}
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white flex items-center justify-center transition-all mb-0.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-2">
          {isPro ? "⭐ VIP — mensagens ilimitadas" : isBlocked ? "Limite atingido · Aguarde ou assine o VIP" : `${DAILY_LIMIT - messagesUsed} mensagens restantes hoje`}
        </p>
      </div>
    </div>
  );
}