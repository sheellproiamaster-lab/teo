"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

const DAILY_LIMIT = 15;

export default function UsageModal({ open, onClose }: Props) {
  const { user } = useAuth();
  const { messagesUsed, cooldownRemaining } = useChat();
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const isPro = user?.plan === "pro";

  const remaining = Math.max(0, DAILY_LIMIT - messagesUsed);
  const percent = Math.min(100, (messagesUsed / DAILY_LIMIT) * 100);
  const isBlocked = remaining === 0 && !isPro;

  function formatCooldown(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {}
    finally { setUpgradeLoading(false); }
  };

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
              <p className="text-lg font-black">Uso diário</p>
              <p className="text-white/70 text-sm mt-1">
                {isPro ? "Você tem mensagens ilimitadas ⭐" : `${remaining} de ${DAILY_LIMIT} mensagens restantes`}
              </p>
            </div>

            <div className="bg-white px-6 py-6 flex flex-col gap-4">
              {!isPro && (
                <>
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                      <span>{messagesUsed} usadas</span>
                      <span>{remaining} restantes</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percent >= 100 ? "bg-red-500" : percent >= 70 ? "bg-yellow-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {isBlocked && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
                      <p className="text-red-600 font-bold text-sm mb-1">Limite atingido!</p>
                      {cooldownRemaining > 0 ? (
                        <>
                          <p className="text-slate-500 text-xs mb-2">Novas mensagens disponíveis em:</p>
                          <p className="text-3xl font-black text-red-500 font-mono tracking-widest">
                            {formatCooldown(cooldownRemaining)}
                          </p>
                        </>
                      ) : (
                        <p className="text-slate-500 text-xs">Envie uma mensagem para iniciar o cronômetro.</p>
                      )}
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4 text-center">
                    <p className="text-blue-800 font-bold text-sm mb-1">Quer mensagens ilimitadas?</p>
                    <p className="text-slate-500 text-xs mb-3">Assine o plano VIP e nunca fique sem resposta.</p>
                    <button
                      onClick={handleUpgrade}
                      disabled={upgradeLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-black text-sm py-3 rounded-xl shadow transition-all disabled:opacity-60"
                    >
                      {upgradeLoading ? "Aguarde..." : "⭐ Assinar VIP — R$47/mês"}
                    </button>
                  </div>
                </>
              )}

              {isPro && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                  <p className="text-4xl mb-2">⭐</p>
                  <p className="text-green-700 font-bold text-sm">Plano VIP ativo!</p>
                  <p className="text-slate-500 text-xs mt-1">Você tem mensagens ilimitadas. Aproveite!</p>
                </div>
              )}

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