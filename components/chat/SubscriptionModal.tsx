"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SubscriptionModal({ open, onClose }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const isPro = user?.plan === "pro";

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else showToast("Erro ao abrir pagamento. Tente novamente.");
    } catch {
      showToast("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      const res = await fetch("/api/stripe/cancel", { method: "POST" });
      const data = await res.json();
      if (data.ok) showToast("Assinatura cancelada. Você continua VIP até o fim do período.");
      else showToast("Erro ao cancelar. Tente novamente.");
    } catch {
      showToast("Erro de conexão. Tente novamente.");
    } finally {
      setCancelLoading(false);
    }
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
          {toast && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-blue-600 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg">
              {toast}
            </div>
          )}

          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 80, damping: 14 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Gradient top */}
            <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 px-7 pt-8 pb-10 text-white text-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-5">
                  ✦ {isPro ? "Você é VIP" : "Plano VIP"}
                </div>
                <p className="text-4xl font-black mb-1">R$ 47</p>
                <p className="text-white/70 text-sm mb-5">por mês · cancele quando quiser</p>
                {isPro ? (
                  <h3 className="text-xl font-bold leading-snug">
                    Sua assinatura está <span className="text-cyan-200">ativa!</span><br />
                    Aproveite tudo sem limites.
                  </h3>
                ) : (
                  <h3 className="text-xl font-bold leading-snug">
                    Tenha tudo que o Teo pode te oferecer.<br />
                    <span className="text-cyan-200">Sem limites. Sem esperas.</span>
                  </h3>
                )}
              </div>
            </div>

            {/* White bottom */}
            <div className="bg-white px-7 pb-8 pt-6">

              {/* Plano atual */}
              <div className={`flex items-center justify-between rounded-xl px-4 py-3 mb-5 ${isPro ? "bg-green-50 border border-green-200" : "bg-slate-50 border border-slate-200"}`}>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Plano atual</p>
                  <p className={`text-sm font-bold ${isPro ? "text-green-600" : "text-slate-700"}`}>
                    {isPro ? "⭐ VIP — Ativo" : "Gratuito"}
                  </p>
                </div>
                {isPro && (
                  <span className="text-xs bg-green-100 text-green-600 font-semibold px-2 py-1 rounded-full">Ativo</span>
                )}
              </div>

              <ul className="flex flex-col gap-2.5 mb-7">
                {[
                  "Conversas ilimitadas com o Teo",
                  "Pesquisas em tempo real na internet",
                  "Análises e planos de ação completos",
                  "Organização de rotinas personalizadas",
                  "Acesso a todas as funcionalidades VIP",
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-slate-700 text-sm">
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${isPro ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              {!isPro ? (
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-black text-base py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all duration-200 mb-3 disabled:opacity-60"
                >
                  {loading ? "Aguarde..." : "Assinar plano VIP"}
                </button>
              ) : (
                <button
                  onClick={handleCancel}
                  disabled={cancelLoading}
                  className="w-full border border-red-200 text-red-500 hover:bg-red-50 font-semibold text-sm py-3 rounded-2xl transition-all duration-200 mb-3 disabled:opacity-60"
                >
                  {cancelLoading ? "Cancelando..." : "Cancelar assinatura"}
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full text-slate-400 text-sm hover:text-slate-600 transition-colors py-2"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}