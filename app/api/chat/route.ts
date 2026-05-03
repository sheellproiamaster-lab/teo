import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const searchTool: OpenAI.Chat.ChatCompletionTool = {
  type: "function",
  function: {
    name: "search_web",
    description:
      "Pesquisa informações atualizadas na internet. Use quando o usuário pedir para pesquisar, buscar, encontrar, procurar informações, ou quando precisar de dados em tempo real como preços, especialistas, clínicas, notícias ou informações recentes sobre TEA e necessidades especiais.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Termo de busca em português",
        },
      },
      required: ["query"],
    },
  },
};

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
      .map((r: { title: string; content: string; url: string }) =>
        `• ${r.title}\n  ${r.content?.slice(0, 300)}`
      )
      .join("\n\n");
    return answer + results || "Nenhum resultado encontrado.";
  } catch {
    return "Erro ao realizar a pesquisa.";
  }
}

export async function POST(req: NextRequest) {
  try {
    const openai = getOpenAI();
    const { messages } = await req.json();

    const first = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      tools: [searchTool],
      tool_choice: "auto",
      max_tokens: 1000,
      temperature: 0.75,
    });

    const choice = first.choices[0].message;

    if (choice.tool_calls?.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const call = choice.tool_calls[0] as any;
      const { query } = JSON.parse(call.function.arguments);
      const searchResult = await tavilySearch(query);

      const second = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
          choice,
          { role: "tool", tool_call_id: call.id, content: searchResult },
        ],
        max_tokens: 1000,
        temperature: 0.75,
      });

      return NextResponse.json({
        content: second.choices[0].message.content,
        searched: true,
        query,
      });
    }

    return NextResponse.json({ content: choice.content });
  } catch (err) {
    console.error("[chat/route]", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}
