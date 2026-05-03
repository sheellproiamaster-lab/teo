"use client";
import { useState, useRef } from "react";
import { useChat } from "@/context/ChatContext";

export default function ChatInput() {
  const { sendMessage, isLoading } = useChat();
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setText("");
    await sendMessage(trimmed);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  return (
    <div className="border-t border-blue-100 bg-white px-4 py-3">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          {/* File attachment */}
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

          {/* Text area */}
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Digite sua mensagem para o Teo..."
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent resize-none text-sm text-slate-700 placeholder-slate-400 focus:outline-none py-1.5 max-h-32 min-h-[36px]"
            style={{ lineHeight: "1.5" }}
            onInput={e => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 128) + "px";
            }}
          />

          {/* Send */}
          <button
            onClick={submit}
            disabled={!text.trim() || isLoading}
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
          O Teo ajuda você sempre
        </p>
      </div>
    </div>
  );
}
