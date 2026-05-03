"use client";
import { motion } from "framer-motion";

const PUZZLE_PATH =
  "M 0 0 L 35 0 C 35 -12 55 -12 55 0 L 100 0 L 100 35 C 112 35 112 55 100 55 L 100 100 L 65 100 C 65 112 45 112 45 100 L 0 100 L 0 65 C -12 65 -12 45 0 45 Z";

const pillars = [
  { icon: "🫂", label: "Acolher" },
  { icon: "🧭", label: "Orientar" },
  { icon: "🤝", label: "Apoiar" },
  { icon: "💡", label: "Solucionar" },
];

export default function PresentationSection() {
  return (
    <section id="sobre" className="relative py-24 px-6 overflow-hidden bg-white">
      {/* Decorative puzzle piece background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-8 -left-8 opacity-5 float-a">
          <svg viewBox="-15 -15 130 130" width="200" height="200">
            <path d={PUZZLE_PATH} fill="#0077b6" />
          </svg>
        </div>
        <div className="absolute -bottom-8 -right-8 opacity-5 float-d">
          <svg viewBox="-15 -15 130 130" width="200" height="200" style={{ transform: "rotate(180deg)" }}>
            <path d={PUZZLE_PATH} fill="#0096c7" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-5 py-2 mb-6">
            <span className="text-blue-500 text-sm font-semibold uppercase tracking-widest">Quem é o Teo</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-blue-900 leading-tight mb-6">
            Uma IA criada com{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400">
              propósito e cuidado
            </span>
          </h2>

          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-12">
            O Teo nasceu do coração do espectro. Inspirado no <strong className="text-blue-700">TEA</strong> —
            Transtorno do Espectro Autista — ele é uma inteligência artificial desenvolvida especialmente
            para <strong className="text-blue-700">famílias com filhos e filhas especiais</strong>.
            Não como uma ferramenta fria, mas como um companheiro que entende, orienta e transforma o dia a dia.
          </p>
        </motion.div>

        {/* 4 pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {pillars.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5, type: "spring", stiffness: 80 }}
              className="relative group"
            >
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-6 flex flex-col items-center gap-3 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
                <span className="text-4xl">{p.icon}</span>
                <span className="text-blue-800 font-bold text-lg">{p.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Divider with autism symbol */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-16 flex items-center justify-center gap-4"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-200" />
          <div className="flex gap-2">
            {["#e40303","#ff8c00","#ffed00","#008026","#004dff","#750787"].map((c, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-sm rotate-45"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-200" />
        </motion.div>
      </div>
    </section>
  );
}
