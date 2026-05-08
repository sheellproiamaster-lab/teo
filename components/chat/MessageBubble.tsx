"use client";
import { useState } from "react";
import Image from "next/image";
import type { Message } from "@/context/ChatContext";
import { useChat } from "@/context/ChatContext";

export default function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const { sendMessage } = useChat();
  const [showOtro, setShowOtro] = useState(false);
  const [otroText, setOtroText] = useState("");

  const handleOption = (option: string) => sendMessage(option);

  const handleOtroSubmit = () => {
    if (!otroText.trim()) return;
    sendMessage(otroText.trim());
    setShowOtro(false);
    setOtroText("");
  };

  return (
    <div className={`flex items-end gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar Teo */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border-2 border-blue-200 bg-blue-100 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-5 h-5 text-white/70">
              <circle cx="50" cy="34" r="19" fill="currentColor" />
              <path d="M 12 88 Q 12 62 50 62 Q 88 62 88 88 Z" fill="currentColor" />
            </svg>
          </div>
          <Image src="/teo-avatar.jpeg" alt="Teo" fill className="object-cover" />
        </div>
      )}

      <div className={`max-w-[80%] md:max-w-[65%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {/* Badge pesquisa */}
        {msg.searched && (
          <span className="text-xs text-blue-500 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5 w-fit">
            🔍 Pesquisado na internet
          </span>
        )}

        {/* Anexos do usuário */}
        {isUser && msg.attachments && msg.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1 justify-end">
            {msg.attachments.map((f, i) => (
              f.isImage ? (
                <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border-2 border-blue-300 shadow-md">
                  <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div key={i} className="w-20 h-20 rounded-xl border-2 border-blue-300 bg-white shadow-md flex flex-col items-center justify-center gap-1 px-1">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[9px] text-slate-500 font-medium text-center leading-tight w-full truncate px-1">{f.name.length > 10 ? f.name.slice(0, 8) + "..." : f.name}</span>
                </div>
              )
            ))}
          </div>
        )}

        {/* Balão de mensagem */}
        {(msg.content || !isUser) && (
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-br-sm shadow-md"
              : "bg-white border border-blue-100 text-slate-700 rounded-bl-sm shadow-sm"
          }`}>
            {msg.content}
          </div>
        )}

        {/* Cards de opções */}
        {!isUser && msg.questionCards && (
          <div className="mt-2 w-full max-w-xs">
            <p className="text-xs font-semibold text-blue-600 mb-2">{msg.questionCards.q}</p>
            <div className="flex flex-wrap gap-2">
              {msg.questionCards.o.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleOption(option)}
                  className="text-xs text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-400 rounded-xl px-3 py-2 transition-colors font-medium text-left"
                >
                  {option}
                </button>
              ))}

              {!showOtro ? (
                <button
                  onClick={() => setShowOtro(true)}
                  className="text-xs text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl px-3 py-2 transition-colors"
                >
                  ✏️ Outro
                </button>
              ) : (
                <div className="w-full flex gap-2 mt-1">
                  <input
                    autoFocus
                    value={otroText}
                    onChange={e => setOtroText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleOtroSubmit(); if (e.key === "Escape") setShowOtro(false); }}
                    placeholder="Digite sua resposta..."
                    className="flex-1 text-xs bg-white border border-blue-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={handleOtroSubmit}
                    className="text-xs bg-blue-600 text-white rounded-xl px-3 py-2 hover:bg-blue-700 transition-colors"
                  >
                    Enviar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <span className="text-xs text-slate-400 px-1">
          {new Date(msg.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}