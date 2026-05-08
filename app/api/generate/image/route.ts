import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const enrichedPrompt = `${prompt}. 
    Important: Any text visible in the image must be written in Brazilian Portuguese (pt-BR). 
    High quality, professional, detailed, 4K resolution. 
    Style: warm, inclusive, welcoming, modern illustration.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enrichedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural",
    });

    const imageUrl = response.data?.[0]?.url ?? null;
    if (!imageUrl) throw new Error("Nenhuma imagem gerada");

    return NextResponse.json({ url: imageUrl });
  } catch (err) {
    console.error("[generate/image]", err);
    return NextResponse.json({ error: "Erro ao gerar imagem" }, { status: 500 });
  }
}