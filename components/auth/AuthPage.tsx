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
  const { user, login, register, loading } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) router.replace("/chat");
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    const { ok, error } = await login(loginEmail, loginPass);
    if (ok) router.replace("/chat");
    else { setLoginError(error || "Erro ao entrar"); setLoginLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (regPass.length < 6) { setRegError("Senha deve ter ao menos 6 caracteres"); return; }
    setRegLoading(true);
    const { ok, error } = await register(regName, regEmail, regPass);
    if (ok) router.replace("/chat");
    else { setRegError(error || "Erro ao criar conta"); setRegLoading(false); }
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
        {/* Floating bg pieces */}
        {[15, -20, 40, -35].map((rot, i) => (
          <div key={i} className={`absolute pointer-events-none float-${["a","b","c","d"][i]}`}
            style={{ left: `${[8,82,5,85][i]}%`, top: `${[10,8,75,70][i]}%`, width: 55, height: 55, opacity: 0.2 }}>
            <svg viewBox="-15 -15 130 130" width="100%" height="100%">
              <path d={PUZZLE_PATH} fill="white" style={{ transform: `rotate(${rot}deg)`, transformOrigin: "center" }} />
            </svg>
          </div>
        ))}

        <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm">
          {/* Mini TEO puzzle */}
          <div className="flex items-center gap-2">
            {(["T","E","O"] as const).map(l => (
              <motion.div key={l} variants={letterEnter[l]} initial="hidden" animate="visible"
                transition={{ type:"spring", stiffness:80, damping:14, delay: delays[l] }}>
                <div className="relative w-14 h-14 drop-shadow-lg">
                  <svg viewBox="-15 -15 130 130" width="100%" height="100%">
                    <defs>
                      <linearGradient id={`ag-${l}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.6)" />
                      </linearGradient>
                    </defs>
                    <path d={PUZZLE_PATH} fill={`url(#ag-${l})`} />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-blue-700">{l}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Avatar floating */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="avatar-float"
          >
            <div className="relative w-28 h-28 rounded-full border-4 border-white/50 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-16 h-16 text-white/70">
                  <circle cx="50" cy="34" r="19" fill="currentColor" />
                  <path d="M 12 88 Q 12 62 50 62 Q 88 62 88 88 Z" fill="currentColor" />
                </svg>
              </div>
              <Image src="/teo-avatar.jpeg" alt="Teo" fill className="object-cover" />
            </div>
          </motion.div>

          {/* Rotating feature cards */}
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

      {/* RIGHT — Forms */}
      <div className="md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 bg-white">
        <div className="w-full max-w-md">

          {/* Premium badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 shadow">
              ✦ Acesso Premium
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-blue-900 leading-tight mb-2">
              A melhor decisão começa com{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400">
                informação certa
              </span>
            </h2>
            <p className="text-slate-500 text-sm">
              Entre ou crie sua conta para conversar com o Teo agora mesmo.
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex bg-blue-50 rounded-xl p-1 mb-6">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === "login" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-blue-600"}`}
            >
              Entrar
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === "register" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-blue-600"}`}
            >
              Criar conta
            </button>
          </div>

          {/* Login form */}
          {tab === "login" && (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleLogin}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">E-mail</label>
                <input
                  type="email" required value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition bg-slate-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Senha</label>
                <input
                  type="password" required value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition bg-slate-50"
                />
              </div>
              {loginError && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{loginError}</p>}
              <button
                type="submit" disabled={loginLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-3.5 rounded-xl shadow-md transition-all duration-200 disabled:opacity-60 mt-1"
              >
                {loginLoading ? "Entrando..." : "Entrar"}
              </button>
              <p className="text-center text-sm text-slate-400">
                Não tem conta?{" "}
                <button type="button" onClick={() => setTab("register")} className="text-blue-600 font-semibold hover:underline">
                  Criar conta grátis
                </button>
              </p>
            </motion.form>
          )}

          {/* Register form */}
          {tab === "register" && (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleRegister}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Nome completo</label>
                <input
                  type="text" required value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition bg-slate-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">E-mail</label>
                <input
                  type="email" required value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition bg-slate-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Senha</label>
                <input
                  type="password" required value={regPass}
                  onChange={e => setRegPass(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition bg-slate-50"
                />
              </div>
              {regError && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{regError}</p>}
              <button
                type="submit" disabled={regLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-3.5 rounded-xl shadow-md transition-all duration-200 disabled:opacity-60 mt-1"
              >
                {regLoading ? "Criando conta..." : "Criar conta"}
              </button>
              <p className="text-center text-sm text-slate-400">
                Já tem conta?{" "}
                <button type="button" onClick={() => setTab("login")} className="text-blue-600 font-semibold hover:underline">
                  Entrar
                </button>
              </p>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
}
