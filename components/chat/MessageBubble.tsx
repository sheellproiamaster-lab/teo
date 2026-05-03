"use client";
import Image from "next/image";
import type { Message } from "@/context/ChatContext";

export default function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex items-end gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
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
        {/* Search badge */}
        {msg.searched && (
          <span className="text-xs text-blue-500 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5 w-fit">
            🔍 Pesquisado na internet
          </span>
        )}

        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-br-sm shadow-md"
              : "bg-white border border-blue-100 text-slate-700 rounded-bl-sm shadow-sm"
          }`}
        >
          {msg.content}
        </div>

        <span className="text-xs text-slate-400 px-1">
          {new Date(msg.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}
