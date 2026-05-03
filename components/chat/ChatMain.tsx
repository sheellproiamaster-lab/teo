"use client";
import { useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import MessageBubble from "./MessageBubble";
import WelcomeScreen from "./WelcomeScreen";
import ChatInput from "./ChatInput";

interface Props {
  onMenuToggle: () => void;
}

export default function ChatMain({ onMenuToggle }: Props) {
  const { active, isLoading } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const messages = active?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-slate-50">
      {/* Top bar */}
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
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-blue-600">Teo</span>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-end gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-5 h-5 text-white/70">
                    <circle cx="50" cy="34" r="19" fill="currentColor" />
                    <path d="M 12 88 Q 12 62 50 62 Q 88 62 88 88 Z" fill="currentColor" />
                  </svg>
                </div>
                <div className="bg-white border border-blue-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 0.2, 0.4].map(d => (
                      <div
                        key={d}
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${d}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <ChatInput />
    </div>
  );
}
