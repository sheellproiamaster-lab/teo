"use client";
import { motion } from "framer-motion";
import TeoAvatar from "./TeoAvatar";

const PUZZLE_PATH =
  "M 0 0 L 35 0 C 35 -12 55 -12 55 0 L 100 0 L 100 35 C 112 35 112 55 100 55 L 100 100 L 65 100 C 65 112 45 112 45 100 L 0 100 L 0 65 C -12 65 -12 45 0 45 Z";

const bgPieces = [
  { id: 0, color: "rgba(0,119,182,0.13)", left: "4%",  top: "12%",  rot: 15,  size: 72, cls: "float-a" },
  { id: 1, color: "rgba(0,180,216,0.11)", left: "87%", top: "10%",  rot: -25, size: 56, cls: "float-b" },
  { id: 2, color: "rgba(144,224,239,0.2)",left: "10%", top: "70%",  rot: 50,  size: 52, cls: "float-c" },
  { id: 3, color: "rgba(0,150,199,0.14)", left: "80%", top: "65%",  rot: -40, size: 66, cls: "float-d" },
  { id: 4, color: "rgba(0,119,182,0.1)",  left: "48%", top: "5%",   rot: 65,  size: 46, cls: "float-e" },
  { id: 5, color: "rgba(2,62,138,0.11)",  left: "92%", top: "40%",  rot: -15, size: 60, cls: "float-f" },
  { id: 6, color: "rgba(0,180,216,0.16)", left: "1%",  top: "42%",  rot: 30,  size: 50, cls: "float-g" },
  { id: 7, color: "rgba(173,232,244,0.22)",left:"44%", top: "86%",  rot: -55, size: 58, cls: "float-h" },
];

const letterEnter = {
  T: { hidden: { x: -260, y: -40, rotate: -25, opacity: 0, scale: 0.4 }, visible: { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 } },
  E: { hidden: { x: 0, y: -280, rotate: 20, opacity: 0, scale: 0.4 },    visible: { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 } },
  O: { hidden: { x: 260, y: -40, rotate: 25, opacity: 0, scale: 0.4 },   visible: { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 } },
};

const delays = { T: 0.4, E: 0.85, O: 1.25 };

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-10">
      {/* Floating background puzzle pieces */}
      {bgPieces.map((p) => (
        <div
          key={p.id}
          className={`absolute pointer-events-none ${p.cls}`}
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
        >
          <svg viewBox="-15 -15 130 130" width="100%" height="100%" style={{ transform: `rotate(${p.rot}deg)` }}>
            <path d={PUZZLE_PATH} fill={p.color} />
          </svg>
        </div>
      ))}

      {/* Decorative autism infinity symbols */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute top-24 right-8 md:right-20 glow-pulse"
      >
        <AutismInfinity size={72} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 2.3, duration: 1 }}
        className="absolute top-24 left-8 md:left-20 glow-pulse"
      >
        <AutismInfinity size={52} />
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 gap-6">

        {/* Puzzle letter animation — TEO */}
        <div className="flex items-center justify-center gap-3 md:gap-4">
          {(["T", "E", "O"] as const).map((letter) => (
            <motion.div
              key={letter}
              variants={letterEnter[letter]}
              initial="hidden"
              animate="visible"
              transition={{
                type: "spring",
                stiffness: 75,
                damping: 13,
                delay: delays[letter],
              }}
            >
              <PuzzleLetter letter={letter} />
            </motion.div>
          ))}
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 0.7 }}
          className="text-xl md:text-2xl font-medium text-blue-700 max-w-lg leading-relaxed"
        >
          Inteligência e afeto para quem cuida de quem ama
        </motion.p>

        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.75, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 2.3, duration: 0.8, type: "spring", stiffness: 70 }}
        >
          <TeoAvatar />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.2, duration: 1 }}
        className="absolute bottom-6 flex flex-col items-center gap-2"
      >
        <span className="text-blue-400 text-sm font-medium">Conheça o Teo</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="w-5 h-8 border-2 border-blue-300 rounded-full flex items-start justify-center pt-1"
        >
          <div className="w-1.5 h-2.5 bg-blue-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function PuzzleLetter({ letter }: { letter: string }) {
  const PUZZLE_PATH =
    "M 0 0 L 35 0 C 35 -12 55 -12 55 0 L 100 0 L 100 35 C 112 35 112 55 100 55 L 100 100 L 65 100 C 65 112 45 112 45 100 L 0 100 L 0 65 C -12 65 -12 45 0 45 Z";

  return (
    <div className="relative w-24 h-24 md:w-36 md:h-36 lg:w-44 lg:h-44 drop-shadow-xl">
      <svg viewBox="-15 -15 130 130" width="100%" height="100%">
        <defs>
          <linearGradient id={`grad-${letter}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0077b6" />
            <stop offset="50%" stopColor="#0096c7" />
            <stop offset="100%" stopColor="#00b4d8" />
          </linearGradient>
          <filter id={`shadow-${letter}`}>
            <feDropShadow dx="3" dy="4" stdDeviation="4" floodColor="rgba(0,60,120,0.3)" />
          </filter>
        </defs>
        <path
          d={PUZZLE_PATH}
          fill={`url(#grad-${letter})`}
          filter={`url(#shadow-${letter})`}
        />
        <path d={PUZZLE_PATH} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-4xl md:text-6xl lg:text-7xl font-black text-white select-none"
        style={{ textShadow: "0 2px 8px rgba(0,40,100,0.4)" }}>
        {letter}
      </span>
    </div>
  );
}

function AutismInfinity({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 0.55} viewBox="0 0 200 110" className="opacity-40">
      <defs>
        <linearGradient id="inf" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#e40303" />
          <stop offset="17%"  stopColor="#ff8c00" />
          <stop offset="34%"  stopColor="#ffed00" />
          <stop offset="51%"  stopColor="#008026" />
          <stop offset="68%"  stopColor="#004dff" />
          <stop offset="100%" stopColor="#750787" />
        </linearGradient>
      </defs>
      <path
        d="M 55 55 C 55 33, 75 18, 95 28 C 115 38, 112 72, 132 82 C 152 92, 170 76, 170 55 C 170 34, 152 18, 132 28 C 112 38, 115 72, 95 82 C 75 92, 55 77, 55 55 Z"
        fill="none"
        stroke="url(#inf)"
        strokeWidth="11"
        strokeLinecap="round"
      />
    </svg>
  );
}
