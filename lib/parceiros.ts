export interface Parceiro {
  id: number;
  nome: string;
  funcao: string;
  descricao: string;
  cidade: string;
  atendimento: string;
  whatsapp: string;
  instagram: string;
  avatar: string;
  cor: string;
}

export const PARCEIROS: Parceiro[] = [
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
