"use client";
import { motion } from "framer-motion";

const PUZZLE_PATH =
  "M 0 0 L 35 0 C 35 -12 55 -12 55 0 L 100 0 L 100 35 C 112 35 112 55 100 55 L 100 100 L 65 100 C 65 112 45 112 45 100 L 0 100 L 0 65 C -12 65 -12 45 0 45 Z";

export default function Footer() {
  return (
    <footer className="relative bg-blue-950 text-white overflow-hidden py-14 px-6">
      {/* Decorative puzzle */}
      <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none">
        <svg viewBox="-15 -15 130 130" width="160" height="160">
          <path d={PUZZLE_PATH} fill="white" />
        </svg>
      </div>
      <div className="absolute top-0 left-0 opacity-5 pointer-events-none">
        <svg viewBox="-15 -15 130 130" width="120" height="120" style={{ transform: "rotate(90deg)" }}>
          <path d={PUZZLE_PATH} fill="white" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-4xl font-black text-white mb-2">Teo</p>
          <p className="text-blue-300 text-sm mb-8 max-w-md mx-auto">
            Inteligência e afeto para quem cuida de quem ama
          </p>

          {/* Autism ribbon */}
          <div className="flex justify-center gap-2 mb-8">
            {["#e40303","#ff8c00","#ffed00","#008026","#004dff","#750787"].map((c, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-sm rotate-45 opacity-80"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <p className="text-blue-400 text-sm">
            © {new Date().getFullYear()} Teo · Feito com amor para famílias especiais
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
