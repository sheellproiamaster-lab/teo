import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 800,
      temperature: 0.7,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
    });

    const rawText = response.choices[0].message.content ?? "Não entendi. Pode reformular?";
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