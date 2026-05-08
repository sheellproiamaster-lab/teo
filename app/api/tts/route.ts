import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Texto vazio" }, { status: 400 });
    }

    // Limita o texto para economizar tokens
    const limitedText = text.slice(0, 1000);

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "echo",
      input: limitedText,
      speed: 1.0,
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (err) {
    console.error("[tts]", err);
    return NextResponse.json({ error: "Erro ao gerar voz" }, { status: 500 });
  }
}