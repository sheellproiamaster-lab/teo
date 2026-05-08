"use client";
import { useState, useRef } from "react";
import { useChat, type FileAttachment } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";

const MAX_FILES = 5;

export default function ChatInput({ isWelcome, inputRef }: { isWelcome?: boolean; inputRef?: React.RefObject<HTMLTextAreaElement | null> }) {
  const { sendMessage, isLoading, isBlocked, messagesUsed } = useChat();
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const localRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = inputRef ?? localRef;
  const [isRecording, setIsRecording] = useState(false);
  const isPro = user?.plan === "pro";
  const DAILY_LIMIT = 15;

  const handleMic = async () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Seu navegador não suporta reconhecimento de voz.");
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsRecording(true);
    recognition.start();
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setText(transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
  };

  const handleFiles = async (selected: FileList | null) => {
    if (!selected) return;
    const arr = Array.from(selected).slice(0, MAX_FILES - files.length);
    const newFiles: FileAttachment[] = await Promise.all(arr.map(async file => {
      const isImage = file.type.startsWith("image/");
      const url = await new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      return { name: file.name, type: file.type, url, isImage };
    }));
    setFiles(prev => [...prev, ...newFiles].slice(0, MAX_FILES));
  };

  const removeFile = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const submit = async () => {
    const trimmed = text.trim();
    if ((!trimmed && files.length === 0) || isLoading || isBlocked) return;
    setText("");
    setFiles([]);
    await sendMessage(trimmed, files);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  return (
    <div className="border-t border-blue-100 bg-white px-4 py-3">
      <div className="max-w-3xl mx-auto">

        {/* Banner bloqueio */}
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

        <div className={`relative flex flex-col bg-slate-50 border rounded-2xl px-3 py-2 transition-all ${
          isBlocked
            ? "border-red-200 opacity-60 pointer-events-none"
            : "border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"
        }`}>

          {/* Miniaturas dos arquivos */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 pt-1">
              {files.map((f, i) => (
                <div key={i} className="relative group">
                  {f.isImage ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-blue-200 shadow-sm relative">
                      <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => removeFile(i)} className="text-white text-lg font-bold">×</button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-blue-200 bg-white shadow-sm flex flex-col items-center justify-center gap-1 relative">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-[9px] text-slate-500 font-medium text-center px-1 leading-tight truncate w-full text-center">{f.name.length > 10 ? f.name.slice(0, 8) + "..." : f.name}</span>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <button onClick={() => removeFile(i)} className="text-white text-lg font-bold">×</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="flex items-end gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={files.length >= MAX_FILES}
              title="Anexar arquivo"
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-500 flex items-center justify-center transition-colors mb-0.5 disabled:opacity-40"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}>
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={e => handleFiles(e.target.files)}
            />

            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKey}
              placeholder={isBlocked ? "Limite diário atingido..." : isWelcome ? "" : "Digite sua mensagem para o Teo..."}
              rows={1}
              disabled={isLoading || isBlocked}
              onClick={() => { if (isWelcome) textareaRef.current?.focus(); }}
              className="flex-1 bg-transparent resize-none text-sm text-slate-700 placeholder-slate-400 focus:outline-none py-1.5 max-h-32 min-h-[36px]"
              style={{ lineHeight: "1.5" }}
              onInput={e => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 128) + "px";
              }}
            />

            <button
              onClick={handleMic}
              disabled={isLoading || isBlocked || isRecording}
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all mb-0.5 ${isRecording ? "bg-red-500 text-white animate-pulse" : "bg-blue-50 hover:bg-blue-100 text-blue-500"}`}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
              </svg>
            </button>

            <button
              onClick={submit}
              disabled={(!text.trim() && files.length === 0) || isLoading || isBlocked}
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

          {/* Placeholder laranja só na tela inicial */}
          {isWelcome && !text && files.length === 0 && (
            <div
              className="absolute inset-0 flex items-center px-14 pointer-events-none rounded-2xl"
            >
              <span
                className="text-sm font-bold pointer-events-auto cursor-text"
                style={{ color: "#f97316" }}
                onClick={() => textareaRef.current?.focus()}
              >
                Tem outro assunto? Digite aqui →
              </span>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-2">
          {isPro ? "⭐ VIP — mensagens ilimitadas" : isBlocked ? "Limite atingido · Aguarde ou assine o VIP" : `${DAILY_LIMIT - messagesUsed} mensagens restantes hoje`}
        </p>
      </div>
    </div>
  );
}