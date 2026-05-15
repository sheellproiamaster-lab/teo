"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ParceiroModal from "@/components/chat/ParceiroModal";

const PARCEIROS = [
  {
    id: 1,
    nome: "Michel Macedo",
    funcao: "Neuropsicopedagogo",
    descricao: "Neuroeducador especialista em inclusão, transtornos de aprendizagem, psicomotricidade e desenvolvimento cognitivo, atua com crianças, jovens e adultos.",
    cidade: "Planaltina, DF",
    atendimento: "Presencial em Planaltina, DF e Online para todo o Brasil",
    whatsapp: "5561993096532",
    instagram: "https://www.instagram.com/michel_macedo_holding?igsh=Y3I1bW9yZmI0Znk2",
    avatar: "MM",
    cor: "from-blue-600 to-cyan-500",
  },
  {
    id: 2,
    nome: "Amanda Mendes",
    funcao: "Nutricionista",
    descricao: "Nutrição Infantil Especializada, Nutrição Clínica e Aspectos Endocrinológicos, Nutrição Comportamental, Nutrição Esportiva e Treinamento Físico.",
    cidade: "Cidade Ocidental, GO",
    atendimento: "Online",
    whatsapp: "5561999259569",
    instagram: "https://www.instagram.com/mandanutri?igsh=YXM3Y2l1dDAzczR1",
    avatar: "AM",
    cor: "from-green-500 to-emerald-400",
  },
  {
    id: 3,
    nome: "Xavier e Rodrigues Advogados",
    funcao: "Escritório de Advocacia",
    descricao: "Atuamos de forma especializada nas áreas de Direito Previdenciário, Inclusão Social e garantia de direitos da pessoa com deficiência, auxiliando famílias na busca por benefícios, tratamentos, acesso à saúde, educação inclusiva e demais direitos fundamentais. Nosso compromisso vai além do atendimento jurídico: buscamos caminhar ao lado das famílias, oferecendo suporte técnico, escuta sensível e atuação comprometida com a dignidade e a inclusão.",
    cidade: "Planaltina, GO",
    atendimento: "Presencial em Planaltina, GO e Online para todo o Brasil",
    whatsapp: "5561992980926",
    instagram: "https://www.instagram.com/xaviererodrigues.adv?igsh=dGdrcWExYXVpa3A2",
    avatar: "XR",
    cor: "from-indigo-700 to-purple-600",
  },
  {
    id: 4,
    nome: "Leiliane Lopes",
    funcao: "Psicóloga",
    descricao: "Neuropsicóloga e psicóloga clínica, atuando com escuta acolhedora, olhar técnico e compromisso ético em cada atendimento. Trabalho com avaliação neuropsicológica e acompanhamento psicológico de crianças, adolescentes e adultos, auxiliando na compreensão do funcionamento cognitivo, emocional e comportamental de forma individualizada e humanizada. Atuação baseada na empatia, singularidade e leveza, proporcionando um espaço seguro para o desenvolvimento, autoconhecimento e qualidade de vida.",
    cidade: "Planaltina, GO",
    atendimento: "Presencial em Planaltina, GO e Online para todo o Brasil",
    whatsapp: "5561996208881",
    instagram: "https://www.instagram.com/leiliane_lopespsico?igsh=MTJwZHJvYmVsNmxsYQ==",
    avatar: "LL",
    cor: "from-violet-600 to-purple-400",
  },
  {
    id: 5,
    nome: "Elaine Jane",
    funcao: "Psicanalista",
    descricao: "Atua ajudando pessoas a compreender emoções, traumas, conflitos e comportamentos, promovendo autoconhecimento e equilíbrio emocional. Com uma escuta profunda e humanizada, oferece um espaço seguro para que cada pessoa possa se reconhecer, se transformar e encontrar mais leveza no dia a dia.",
    cidade: "Planaltina, GO",
    atendimento: "Presencial em Planaltina, GO e Online para todo o Brasil",
    whatsapp: "5561991715988",
    instagram: "https://www.instagram.com/elainejane_psicanalista?igsh=MWd4bmVuMTZzeW1hdg==",
    avatar: "EJ",
    cor: "from-rose-500 to-pink-400",
  },
];

type Parceiro = typeof PARCEIROS[0];

export default function ParceirosPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Parceiro | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-6 py-8 text-white">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/80 hover:text-white text-sm mb-6 transition-colors">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">🤝</div>
          <div>
            <h1 className="text-2xl font-black">Parceiros Especialistas</h1>
            <p className="text-white/70 text-sm">Profissionais verificados pelo Teo</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600/10 to-cyan-500/10 border border-blue-200 rounded-2xl px-4 py-3 mb-6 flex items-center gap-3">
          <span className="text-2xl">✦</span>
          <p className="text-blue-800 text-sm font-medium leading-snug">
            Estes profissionais são parceiros verificados do Teo, comprometidos com a inclusão e o desenvolvimento de famílias especiais.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {PARCEIROS.map(p => (
            <button key={p.id} onClick={() => setSelected(p)} className="w-full text-left bg-white border border-blue-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.cor} flex items-center justify-center text-white font-black text-lg shadow-lg flex-shrink-0`}>
                  {p.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-blue-900 text-base">{p.nome}</p>
                  <p className="text-blue-600 text-sm font-semibold">{p.funcao}</p>
                  <p className="text-slate-500 text-xs mt-0.5 truncate">{p.cidade}</p>
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 font-medium">✓ Verificado</span>
                {p.atendimento.toLowerCase().includes("online") && (
                  <span className="text-xs bg-cyan-50 text-cyan-700 border border-cyan-100 rounded-full px-3 py-1 font-medium">🌐 Online</span>
                )}
                {p.atendimento.toLowerCase().includes("presencial") && (
                  <span className="text-xs bg-green-50 text-green-700 border border-green-100 rounded-full px-3 py-1 font-medium">📍 Presencial</span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 bg-gradient-to-br from-blue-700 to-cyan-500 rounded-3xl p-6 text-white text-center">
          <p className="text-lg font-black mb-1">Quer ser um parceiro Teo?</p>
          <p className="text-white/70 text-sm mb-4">Junte-se à nossa rede de especialistas e alcance famílias que precisam de você.</p>
          <a href="https://wa.me/5561993090708?text=Olá! Tenho interesse em ser parceiro do Teo." target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-blue-700 font-black text-sm px-5 py-2.5 rounded-xl shadow transition-all hover:bg-blue-50">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.549 4.103 1.508 5.837L.057 23.547a.75.75 0 00.921.921l5.71-1.451A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.49-5.18-1.348l-.37-.214-3.838.976.992-3.727-.234-.384A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            Entrar em contato
          </a>
        </div>
      </div>

      {selected && <ParceiroModal parceiro={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}