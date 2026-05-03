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

    const history = messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: history,
      tools: [
        {
          name: "search_web",
          description: "Pesquisa informações atualizadas na internet. Use para dados em tempo real: pessoas, clínicas, preços, eventos, notícias.",
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

    // Claude quer buscar
    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (toolUse && toolUse.type === "tool_use") {
      const query = (toolUse.input as { query: string }).query;
      const searchResults = await tavilySearch(query);

      // Manda resultado de volta pro Claude responder
      const final = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
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

    // Resposta direta sem busca
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