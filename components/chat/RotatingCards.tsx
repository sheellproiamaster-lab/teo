"use client";
import { useEffect, useState } from "react";

const cards = [
  { icon: "🩺", title: "Consultas e orientações", desc: "Análises, planos de ação e orientações completas para sua família." },
  { icon: "📅", title: "Organização de rotinas", desc: "Rotinas estruturadas e adaptadas para cada necessidade especial." },
  { icon: "✅", title: "Gestão de tarefas", desc: "Listas, lembretes e planos que promovem autonomia e desenvolvimento." },
  { icon: "🔍", title: "Pesquisa e estratégia", desc: "Encontra os melhores especialistas e oferece a melhor estratégia." },
  { icon: "📚", title: "Educação e inclusão", desc: "Estratégias para inclusão escolar e social com efetividade." },
  { icon: "🔗", title: "Conexão com especialistas", desc: "Orienta na busca por terapeutas, fonoaudiólogos e psicólogos." },
];

export default function RotatingCards() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(p => (p + 1) % cards.length);
        setVisible(true);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const card = cards[current];

  return (
    <div className="w-full max-w-xs">
      <div
        style={{
          transition: "opacity 0.5s ease, transform 0.5s ease",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
        }}
        className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl p-5 text-white shadow-lg"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
            {card.icon}
          </div>
          <h4 className="font-bold text-base leading-tight">{card.title}</h4>
        </div>
        <p className="text-white/80 text-sm leading-relaxed">{card.desc}</p>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-3">
        {cards.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 20 : 6,
              height: 6,
              backgroundColor: i === current ? "white" : "rgba(255,255,255,0.35)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
