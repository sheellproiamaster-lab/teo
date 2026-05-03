import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

// GPT-4o-mini: executor do dia a dia — Claude reservado para tarefas avançadas/VIP
const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_web",
      description:
        "Pesquisa informações atualizadas na internet. Use quando precisar de dados em tempo real: especialistas, clínicas, preços, eventos recentes, notícias ou qualquer informação que possa estar desatualizada.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Termo de busca em português" },
        },
        required: ["query"],
      },
    },
  },
];

async function tavilySearch(query: string): Promise<string> {
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: "basic",
        max_results: 5,
        include_answer: true,
      }),
    });
    const data = await res.json();
    const answer = data.answer ? `Resumo: ${data.answer}\n\n` : "";
    const results = (data.results || [])
      .map((r: { title: string; content: string }) =>
        `• ${r.title}\n  ${r.content?.slice(0, 300)}`
      )
      .join("\n\n");
    return answer + results || "Nenhum resultado encontrado.";
  } catch {
    return "Nenhum resultado encontrado.";
  }
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

export async function POST(req: NextRequest) {
  try {
    const openai = getOpenAI();
    const { messages } = await req.json();

    const history: OpenAI.Chat.ChatCompletionMessageParam[] = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })
    );

    // Passo 1: GPT decide se precisa buscar
    const decision = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 100,
      temperature: 0,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
      ],
      tools,
      tool_choice: "auto",
    });

    const decisionMessage = decision.choices[0].message;
    const toolCall = decisionMessage.tool_calls?.[0];

    // Se precisa buscar: pesquisa direto e responde em uma chamada limpa
    if (toolCall) {
      const { query } = JSON.parse(toolCall.function.arguments) as { query: string };
      const searchResults = await tavilySearch(query);

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 800,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `${SYSTEM_PROMPT}\n\nResultados de busca para "${query}":\n${searchResults}`,
          },
          ...history,
        ],
      });

      const rawText = response.choices[0].message.content ?? "Não consegui buscar essa informação agora.";
      const { content, questionCards } = parseOptions(rawText);
      return NextResponse.json({ content, searched: true, query, questionCards });
    }

    // Sem busca: responde direto
    if (decisionMessage.content) {
      const { content, questionCards } = parseOptions(decisionMessage.content);
      return NextResponse.json({ content, questionCards });
    }

    // Fallback: chamada limpa sem tools
    const fallback = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 800,
      temperature: 0.7,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
    });

    const rawText = fallback.choices[0].message.content ?? "Não entendi. Pode reformular?";
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
