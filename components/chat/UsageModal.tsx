"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

const DAILY_LIMIT = 15;

export default function UsageModal({ open, onClose }: Props) {
  const { user } = useAuth();
  const [used, setUsed] = useState(0);
  const [resetIn, setResetIn] = useState<string | null>(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const isPro = user?.plan === "pro";

  useEffect(() => {
    if (!open) return;
    const key = `teo_usage_${user?.id}_${new Date().toDateString()}`;
    const stored = parseInt(localStorage.getItem(key) || "0");
    setUsed(stored);

    // Verifica se tem cooldown ativo
    const cooldownKey = `teo_cooldown_${user?.id}`;
    const cooldownEnd = localStorage.getItem(cooldownKey);
    if (cooldownEnd) {
      const end = parseInt(cooldownEnd);
      const now = Date.now();
      if (now < end) {
        const remaining = end - now;
        updateCountdown(remaining);
      }
    }
  }, [open, user?.id]);

  const updateCountdown = (remaining: number) => {
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    setResetIn(`${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`);

    if (remaining > 0) {
      setTimeout(() => updateCountdown(remaining - 1000), 1000);
    } else {
      setResetIn(null);
    }
  };

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // erro silencioso
    } finally {
      setUpgradeLoading(false);
    }
  };

  const remaining = Math.max(0, DAILY_LIMIT - used);
  const percent = Math.min(100, (used / DAILY_LIMIT) * 100);
  const isBlocked = remaining === 0 && !isPro;

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

            <div className="bg-white dark:bg-slate-900 px-6 py-6 flex flex-col gap-4">
              {!isPro && (
                <>
                  {/* Barra de progresso */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                      <span>{used} usadas</span>
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

                  {/* Bloqueado com timer */}
                  {isBlocked && resetIn && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
                      <p className="text-red-600 font-bold text-sm mb-1">Limite atingido!</p>
                      <p className="text-slate-500 text-xs mb-2">Novas mensagens disponíveis em:</p>
                      <p className="text-2xl font-black text-red-500 font-mono">{resetIn}</p>
                    </div>
                  )}

                  {/* Upgrade */}
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