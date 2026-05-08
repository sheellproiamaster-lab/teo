"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ThemeModal({ open, onClose }: Props) {
  const { theme, setTheme } = useTheme();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(2,18,60,0.7)", backdropFilter: "blur(6px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 80, damping: 14 }}
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 px-7 pt-7 pb-6 text-white text-center">
              <p className="text-lg font-black">Aparência</p>
              <p className="text-white/70 text-sm mt-1">Escolha como o Teo deve aparecer para você</p>
            </div>

            <div className="bg-white dark:bg-slate-900 px-6 py-6 flex flex-col gap-4">
              {/* Claro */}
              <button
                onClick={() => { setTheme("light"); onClose(); }}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  theme === "light"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center text-2xl shadow">
                  ☀️
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800 text-sm">Modo Claro</p>
                  <p className="text-slate-500 text-xs">Fundo branco, visual limpo</p>
                </div>
                {theme === "light" && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="white">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                )}
              </button>

              {/* Escuro */}
              <button
                onClick={() => { setTheme("dark"); onClose(); }}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  theme === "dark"
                    ? "border-blue-400 bg-slate-800"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-2xl shadow">
                  🌙
                </div>
                <div className="text-left">
                  <p className={`font-bold text-sm ${theme === "dark" ? "text-white" : "text-slate-800"}`}>Modo Escuro</p>
                  <p className={`text-xs ${theme === "dark" ? "text-slate-300" : "text-slate-500"}`}>Escuro premium, letras bem legíveis</p>
                </div>
                {theme === "dark" && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="white">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                )}
              </button>

              <button onClick={onClose} className="text-slate-400 text-sm hover:text-slate-600 transition-colors py-2 text-center">
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}