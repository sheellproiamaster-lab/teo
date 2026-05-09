"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import type { Message } from "@/context/ChatContext";
import { useChat } from "@/context/ChatContext";

function detectDocument(content: string): { hasDoc: boolean; type: "pdf" | "word" | null; title: string } {
  const pdfMatch = content.match(/\[GERAR_DOCUMENTO:pdf\]/i);
  const wordMatch = content.match(/\[GERAR_DOCUMENTO:word\]/i);
  const titleMatch = content.match(/^#+ (.+)$/m);
  const title = titleMatch ? titleMatch[1] : "Documento";
  if (pdfMatch) return { hasDoc: true, type: "pdf", title };
  if (wordMatch) return { hasDoc: true, type: "word", title };
  return { hasDoc: false, type: null, title };
}

function cleanContent(content: string): string {
  return content
    .replace(/\[GERAR_DOCUMENTO:pdf\]/gi, "")
    .replace(/\[GERAR_DOCUMENTO:word\]/gi, "")
    .replace(/\[INICIO_DOCUMENTO\][\s\S]*?\[FIM_DOCUMENTO\]/g, "")
    .trim();
}

function extractDocContent(content: string, msgDocContent?: string | null): string {
  if (msgDocContent) return msgDocContent;
  const match = content.match(/\[INICIO_DOCUMENTO\]([\s\S]*?)\[FIM_DOCUMENTO\]/);
  if (match) return match[1].trim();
  return cleanContent(content);
}

export default function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const { sendMessage } = useChat();
  const [showOtro, setShowOtro] = useState(false);
  const [otroText, setOtroText] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [wordLoading, setWordLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { hasDoc, type: docTypeFromContent, title } = detectDocument(msg.content);
  const hasDocFinal = hasDoc || !!msg.docType;
  const cleanedContent = cleanContent(msg.content);
  const docType = msg.docType || docTypeFromContent;

  const handleOption = (option: string) => sendMessage(option);

  const handleOtroSubmit = () => {
    if (!otroText.trim()) return;
    sendMessage(otroText.trim());
    setShowOtro(false);
    setOtroText("");
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const res = await fetch("/api/generate/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: extractDocContent(msg.content, msg.docContent), title }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "documento"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Erro ao gerar PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadWord = async () => {
    setWordLoading(true);
    try {
      const res = await fetch("/api/generate/word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: extractDocContent(msg.content, msg.docContent), title }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "documento"}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Erro ao gerar Word.");
    } finally {
      setWordLoading(false);
    }
  };

  const handleSpeak = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    try {
      setIsPlaying(true);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanedContent }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setIsPlaying(false); URL.revokeObjectURL(url); };
      audio.onerror = () => { setIsPlaying(false); URL.revokeObjectURL(url); };
      await audio.play();
    } catch {
      setIsPlaying(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!msg.imageUrl) return;
    try {
      const res = await fetch(msg.imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "teo-imagem.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      const a = document.createElement("a");
      a.href = msg.imageUrl;
      a.download = "teo-imagem.png";
      a.target = "_blank";
      a.click();
    }
  };

  return (
    <div className={`flex items-end gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
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
        {!isUser && (
          <button
            onClick={handleSpeak}
            title={isPlaying ? "Parar" : "Ouvir resposta"}
            className={`self-start flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all w-fit ${
              isPlaying
                ? "bg-blue-600 text-white"
                : "bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100"
            }`}
          >
            {isPlaying ? (
              <>
                <div className="flex gap-0.5 items-center h-3">
                  {[0, 0.15, 0.3].map(d => (
                    <div key={d} className="w-0.5 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
                Parar
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
                Ouvir
              </>
            )}
          </button>
        )}

        {msg.searched && (
          <span className="text-xs text-blue-500 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5 w-fit">
            🔍 Pesquisado na internet
          </span>
        )}

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

        {(cleanedContent || !isUser) && (
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-br-sm shadow-md"
              : "bg-white border border-blue-100 text-slate-700 rounded-bl-sm shadow-sm"
          }`}>
            {cleanedContent}
          </div>
        )}

        {!isUser && msg.imageUrl && (
          <div className="mt-2 flex flex-col gap-2">
            <div className="rounded-2xl overflow-hidden border-2 border-blue-200 shadow-lg max-w-xs">
              <img src={msg.imageUrl} alt="Imagem gerada pelo Teo" className="w-full h-auto object-cover" />
            </div>
            <button
              onClick={handleDownloadImage}
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition-all w-fit"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Baixar imagem
            </button>
          </div>
        )}

        {!isUser && hasDocFinal && (
          <div className="flex gap-2 mt-1">
            {(docType === "pdf" || !docType) && (
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition-all disabled:opacity-60"
              >
                {pdfLoading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17v-1h8v1H8zm0-3v-1h8v1H8zm0-3V10h5v1H8z"/>
                  </svg>
                )}
                Baixar PDF
              </button>
            )}
            {(docType === "word" || !docType) && (
              <button
                onClick={handleDownloadWord}
                disabled={wordLoading}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition-all disabled:opacity-60"
              >
                {wordLoading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM7 15l2-6h1.5l1.5 4.5L14 9h1.5l2 6H16l-1.25-4L13.5 15h-1l-1.25-4L10 15H7z"/>
                  </svg>
                )}
                Baixar Word
              </button>
            )}
          </div>
        )}

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