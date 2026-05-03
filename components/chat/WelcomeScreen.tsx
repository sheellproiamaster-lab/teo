"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useChat } from "@/context/ChatContext";

const suggestions = [
  "Como organizar a rotina do meu filho?",
  "Quais terapias são indicadas para TEA?",
  "Como preparar meu filho para a escola?",
];

export default function WelcomeScreen() {
  const { sendMessage } = useChat();

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-10 text-center">
      {/* Avatar flutuando */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="mb-6"
      >
        <div className="relative">
          <div className="absolute -inset-3 rounded-full border-2 border-dashed border-blue-200 spin-slow pointer-events-none" />
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-3 border-blue-300 shadow-xl bg-blue-100">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-14 h-14 text-white/70">
                <circle cx="50" cy="34" r="19" fill="currentColor" />
                <path d="M 12 88 Q 12 62 50 62 Q 88 62 88 88 Z" fill="currentColor" />
              </svg>
            </div>
            <Image src="/teo-avatar.jpeg" alt="Teo" fill className="object-cover" />
          </div>
        </div>
      </motion.div>

      {/* Card de boas-vindas */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative w-full max-w-sm bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl px-6 py-5 shadow-lg"
      >
        <p className="text-blue-900 font-bold text-lg leading-snug">
          Converse com o Teo sobre tudo que você precisar
        </p>
        <p className="text-slate-500 text-sm mt-2">
          Estou aqui para apoiar sua família a cada passo. Pergunte, pesquise, planeje.
        </p>
      </motion.div>

      {/* Sugestões clicáveis */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-6 flex flex-wrap justify-center gap-2 max-w-sm"
      >
        {suggestions.map(s => (
          <button
            key={s}
            onClick={() => sendMessage(s)}
            className="text-xs text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 hover:border-blue-300 rounded-full px-3 py-1.5 transition-colors cursor-pointer"
          >
            {s}
          </button>
        ))}
      </motion.div>
    </div>
  );
}
