import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

const getAnthropic = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function tavilySearch(query: string): Promise<string> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: "basic",
      max_results: 3,
      include_answer: true,
    }),
  });
  if (!res.ok) return "Nenhum resultado encontrado.";
  const data = await res.json();
  return data.answer || "Nenhum resultado encontrado.";
}

function needsSearch(message: string): boolean {
  const keywords = [
    "pesquisa", "pesquisar", "busca", "buscar", "procura", "procurar",
    "encontra", "encontrar", "clínica", "clinica", "especialista", "terapeuta",
    "médico", "medico", "hospital", "escola", "preço", "preco", "valor",
    "onde", "qual o melhor", "me indica", "me indicar", "recomenda",
    "novidade", "atualidade", "recente", "hoje", "agora", "notícia"
  ];
  const lower = message.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

function parseOptions(text: string): { content: string; questionCards: { q: string; o: string[] } | null } {
  const match = text.match(/\[OPTIONS\]([\s\S]*?)\[\/OPTIONS\]/);
  if (!match) return { content: text.trim(), questionCards: null };
  try {
    const questionCards = JSON.parse(match[1]);
    const content = text.replace(/\[OPTIONS\][\s\S]*?\[\/OPTIONS\]/, "").trim();
    return { content, questionCards };
  } catch {
    return { content: text.trim(), questionCards: null };
  }
}

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const anthropic = getAnthropic();
    const { messages } = await req.json();

    const history = messages.slice(-10).map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const lastMessage = messages[messages.length - 1]?.content || "";
    const shouldSearch = needsSearch(lastMessage);

    // Força busca imediata se detectar necessidade
    if (shouldSearch) {
      const searchResults = await tavilySearch(lastMessage.slice(0, 200));

      const final = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 750,
        system: SYSTEM_PROMPT,
        messages: [
          ...history.slice(0, -1),
          {
            role: "user",
            content: `${lastMessage}\n\n[Resultado da pesquisa na internet]: ${searchResults}`,
          },
        ],
      });

      const rawText = final.content.find((b) => b.type === "text")?.text ?? "Não consegui buscar essa informação.";
      const { content, questionCards } = parseOptions(rawText);
      return NextResponse.json({ content, searched: true, query: lastMessage.slice(0, 80), questionCards });
    }

    // Resposta normal com ferramenta de busca disponível
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 750,
      system: SYSTEM_PROMPT,
      messages: history,
      tools: [
        {
          name: "search_web",
          description: "Pesquisa informações atualizadas na internet. Use para dados em tempo real: clínicas, especialistas, preços, eventos, notícias, novidades científicas.",
          input_schema: {
            type: "object" as const,
            properties: {
              query: { type: "string", description: "Termo de busca em português" },
            },
            required: ["query"],
          },
        },
      ],
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (toolUse && toolUse.type === "tool_use") {
      const query = (toolUse.input as { query: string }).query;
      const searchResults = await tavilySearch(query);

      const final = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 750,
        system: SYSTEM_PROMPT,
        messages: [
          ...history,
          { role: "assistant", content: response.content },
          {
            role: "user",
            content: [
              {
                type: "tool_result",
                tool_use_id: toolUse.id,
                content: searchResults,
              },
            ],
          },
        ],
      });

      const rawText = final.content.find((b) => b.type === "text")?.text ?? "Não consegui buscar essa informação.";
      const { content, questionCards } = parseOptions(rawText);
      return NextResponse.json({ content, searched: true, query, questionCards });
    }

    const rawText = response.content.find((b) => b.type === "text")?.text ?? "Não entendi. Pode reformular?";
    const { content, questionCards } = parseOptions(rawText);
    return NextResponse.json({ content, questionCards });

  } catch (err) {
    console.error("[chat/route]", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}