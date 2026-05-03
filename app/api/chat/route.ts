import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

// GPT-4o-mini: executor do dia a dia
const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Claude (Anthropic) reservado para tarefas avançadas/VIP — importar quando necessário

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
    return "Erro ao realizar a pesquisa.";
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

    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // GPT-4o-mini como cérebro principal
    const first = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      temperature: 0.7,
      messages: openaiMessages,
      tools,
      tool_choice: "auto",
    });

    const firstMessage = first.choices[0].message;
    const toolCall = firstMessage.tool_calls?.[0];

    if (toolCall) {
      const { query } = JSON.parse(toolCall.function.arguments) as { query: string };

      const rawResults = await tavilySearch(query);

      // Segunda chamada sem tools para forçar resposta em texto
      const second = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          ...openaiMessages,
          firstMessage,
          {
            role: "tool",
            tool_call_id: toolCall.id,
            content: rawResults,
          },
        ],
      });

      const rawText = second.choices[0].message.content || "Ocorreu um erro. Tente novamente.";
      const { content, questionCards } = parseOptions(rawText);

      return NextResponse.json({ content, searched: true, query, questionCards });
    }

    const rawText = firstMessage.content || "Ocorreu um erro. Tente novamente.";
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
