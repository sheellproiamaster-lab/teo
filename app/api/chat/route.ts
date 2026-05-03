import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

const getAnthropic = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const tools: Anthropic.Tool[] = [
  {
    name: "search_web",
    description:
      "Pesquisa informações atualizadas na internet. Use quando precisar de dados em tempo real: especialistas, clínicas, preços, eventos recentes, notícias ou qualquer informação que possa estar desatualizada.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Termo de busca em português" },
      },
      required: ["query"],
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

async function summarizeWithGPT(rawResults: string): Promise<string> {
  try {
    const openai = getOpenAI();
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente de pesquisa. Resuma os resultados de busca abaixo de forma clara, objetiva e em português. Mantenha apenas as informações mais relevantes e úteis.",
        },
        { role: "user", content: rawResults },
      ],
      max_tokens: 400,
      temperature: 0.3,
    });
    return res.choices[0].message.content || rawResults;
  } catch {
    return rawResults;
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
    const anthropic = getAnthropic();
    const { messages } = await req.json();

    const anthropicMessages: Anthropic.MessageParam[] = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })
    );

    // Claude as main brain
    const first = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: anthropicMessages,
      tools,
    });

    const toolUseBlock = first.content.find((b) => b.type === "tool_use");

    if (toolUseBlock && toolUseBlock.type === "tool_use") {
      const { query } = toolUseBlock.input as { query: string };

      // Tavily searches → GPT summarizes → Claude responds
      const rawResults = await tavilySearch(query);
      const summarized = await summarizeWithGPT(rawResults);

      const second = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [
          ...anthropicMessages,
          { role: "assistant", content: first.content },
          {
            role: "user",
            content: [
              {
                type: "tool_result",
                tool_use_id: toolUseBlock.id,
                content: summarized,
              },
            ],
          },
        ],
        tools,
      });

      const textBlock = second.content.find((b) => b.type === "text");
      const rawText = textBlock?.type === "text" ? textBlock.text : "Ocorreu um erro. Tente novamente.";
      const { content, questionCards } = parseOptions(rawText);

      return NextResponse.json({ content, searched: true, query, questionCards });
    }

    const textBlock = first.content.find((b) => b.type === "text");
    const rawText = textBlock?.type === "text" ? textBlock.text : "Ocorreu um erro. Tente novamente.";
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
