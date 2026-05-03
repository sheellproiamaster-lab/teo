"use client";
import { motion } from "framer-motion";

const features = [
  {
    icon: "🩺",
    title: "Consultas e orientações",
    desc: "Tire dúvidas sobre diagnósticos, terapias, medicamentos e caminhos clínicos. O Teo explica com clareza e empatia.",
  },
  {
    icon: "📅",
    title: "Organização de rotinas",
    desc: "Monte rotinas estruturadas e adaptadas para as necessidades específicas do seu filho ou filha especial.",
  },
  {
    icon: "✅",
    title: "Gestão de tarefas",
    desc: "Crie listas de tarefas, lembretes e planos de atividades que ajudam na autonomia e no desenvolvimento diário.",
  },
  {
    icon: "💙",
    title: "Suporte emocional",
    desc: "Acolhimento para os momentos difíceis. O Teo ouve, compreende e oferece suporte emocional à família toda.",
  },
  {
    icon: "📚",
    title: "Educação e inclusão",
    desc: "Recursos, estratégias e adaptações para o ambiente escolar e social, promovendo inclusão com efetividade.",
  },
  {
    icon: "🔗",
    title: "Conexão com especialistas",
    desc: "Orientação sobre como buscar e selecionar profissionais: terapeutas, fonoaudiólogos, psicólogos e mais.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="funcionalidades" className="py-24 px-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-200 rounded-full px-5 py-2 mb-5">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">O que o Teo faz</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-blue-900 leading-tight">
            Tudo que sua família precisa,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400">
              em um só lugar
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, type: "spring", stiffness: 80 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white border border-blue-100 rounded-2xl p-7 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-default group"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-center mt-16"
        >
          <p className="text-slate-500 mb-6 text-lg">
            Pronto para transformar o dia a dia da sua família?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg shadow-blue-200 transition-all duration-200"
          >
            Comece agora com o Teo
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
