"use client";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SubscriptionModal({ open, onClose }: Props) {
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
            className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Gradient top */}
            <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 px-7 pt-8 pb-10 text-white text-center relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-5">
                  ✦ Plano VIP
                </div>
                <p className="text-4xl font-black mb-1">R$ 47</p>
                <p className="text-white/70 text-sm mb-5">por mês · cancele quando quiser</p>
                <h3 className="text-xl font-bold leading-snug">
                  Tenha tudo que o Teo pode te oferecer.<br />
                  <span className="text-cyan-200">Sem limites. Sem esperas.</span>
                </h3>
              </div>
            </div>

            {/* White bottom */}
            <div className="bg-white px-7 pb-8 pt-6">
              <ul className="flex flex-col gap-2.5 mb-7">
                {[
                  "Conversas ilimitadas com o Teo",
                  "Pesquisas em tempo real na internet",
                  "Análises e planos de ação completos",
                  "Organização de rotinas personalizadas",
                  "Acesso a todas as funcionalidades VIP",
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-slate-700 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-black text-base py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all duration-200 mb-3">
                Assinar plano VIP
              </button>
              <button
                onClick={onClose}
                className="w-full text-slate-400 text-sm hover:text-slate-600 transition-colors py-2"
              >
                Agora não
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
