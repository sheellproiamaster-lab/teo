"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import RotatingCards from "@/components/chat/RotatingCards";

const PUZZLE_PATH =
  "M 0 0 L 35 0 C 35 -12 55 -12 55 0 L 100 0 L 100 35 C 112 35 112 55 100 55 L 100 100 L 65 100 C 65 112 45 112 45 100 L 0 100 L 0 65 C -12 65 -12 45 0 45 Z";

const letterEnter = {
  T: { hidden: { x: -120, opacity: 0, scale: 0.5 }, visible: { x: 0, opacity: 1, scale: 1 } },
  E: { hidden: { y: -120, opacity: 0, scale: 0.5 }, visible: { y: 0, opacity: 1, scale: 1 } },
  O: { hidden: { x: 120, opacity: 0, scale: 0.5 }, visible: { x: 0, opacity: 1, scale: 1 } },
};
const delays = { T: 0.2, E: 0.5, O: 0.8 };

export default function AuthPage() {
  const router = useRouter();
  const { user, loading, loginWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/chat");
  }, [user, loading, router]);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await loginWithGoogle();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* LEFT — Blue side */}
      <div className="relative md:w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 flex flex-col items-center justify-center p-8 md:p-12 overflow-hidden min-h-[50vh] md:min-h-screen">
        {[15, -20, 40, -35].map((rot, i) => (
          <div key={i} className={`absolute pointer-events-none float-${["a","b","c","d"][i]}`}
            style={{ left: `${[8,82,5,85][i]}%`, top: `${[10,8,75,70][i]}%`, width: 55, height: 55, opacity: 0.2 }}>
            <svg viewBox="-15 -15 130 130" width="100%" height="100%">
              <path d={PUZZLE_PATH} fill="white" style={{ transform: `rotate(${rot}deg)`, transformOrigin: "center" }} />
            </svg>
          </div>
        ))}

        <div className="relative z-10 flex flex-col items-center gap-5 w-full max-w-sm">
          <div className="flex items-center gap-3">
            {(["T","E","O"] as const).map(l => (
              <motion.div key={l} variants={letterEnter[l]} initial="hidden" animate="visible"
                transition={{ type:"spring", stiffness:80, damping:14, delay: delays[l] }}>
                <div className="relative w-20 h-20 drop-shadow-xl">
                  <svg viewBox="-15 -15 130 130" width="100%" height="100%">
                    <defs>
                      <linearGradient id={`ag-${l}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.65)" />
                      </linearGradient>
                    </defs>
                    <path d={PUZZLE_PATH} fill={`url(#ag-${l})`} />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-3xl font-black text-blue-700">{l}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="text-center"
          >
            <p className="text-5xl font-black text-white tracking-tight drop-shadow-lg leading-none">Teo</p>
            <p className="text-white/70 text-sm font-medium mt-1 tracking-wide">Seu parceiro para famílias especiais</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -22, 0] }}
            transition={{
              opacity: { delay: 1.1, duration: 0.6 },
              scale: { delay: 1.1, duration: 0.6 },
              y: { delay: 1.8, duration: 2.8, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <div className="relative">
              <div className="absolute -inset-3 rounded-full border-2 border-dashed border-white/30 spin-slow pointer-events-none" />
              <div className="relative w-44 h-44 rounded-full border-4 border-white/60 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-24 h-24 text-white/70">
                    <circle cx="50" cy="34" r="19" fill="currentColor" />
                    <path d="M 12 88 Q 12 62 50 62 Q 88 62 88 88 Z" fill="currentColor" />
                  </svg>
                </div>
                <Image src="/teo-avatar.jpeg" alt="Teo" fill className="object-cover" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="w-full"
          >
            <RotatingCards />
          </motion.div>
        </div>
      </div>

      {/* RIGHT — Login */}
      <div className="md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 bg-white">
        <div className="w-full max-w-md">

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4 shadow">
              ✦ Tenha a melhor experiência a partir de agora
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-blue-900 leading-tight mb-2">
              A melhor decisão começa com{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400">
                informação certa
              </span>
            </h2>
            <p className="text-slate-500 text-sm">
              Entre com sua conta Google para conversar com o Teo agora mesmo.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3.5 rounded-xl shadow-sm transition-all duration-200 disabled:opacity-60"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {googleLoading ? "Redirecionando..." : "Entrar com Google"}
            </button>

            <p className="text-center text-xs text-slate-400 mt-2">
              Ao entrar, você concorda com nossos termos de uso e política de privacidade.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}