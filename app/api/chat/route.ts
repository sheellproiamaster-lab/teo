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

async function generateImage(prompt: string): Promise<string | null> {
  try {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const enrichedPrompt = `${prompt}. Important: Any text visible in the image must be written in Brazilian Portuguese (pt-BR). High quality, professional, detailed, 4K resolution. Style: warm, inclusive, welcoming, modern illustration.`;
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enrichedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural",
    });
    return response.data?.[0]?.url ?? null;
  } catch (err) {
    console.error("[generateImage]", err);
    return null;
  }
}

function needsSearch(message: string): boolean {
  const keywords = [
    "pesquisa", "pesquisar", "busca", "buscar", "procura", "procurar",
    "encontra", "encontrar", "clínica", "clinica", "especialista", "terapeuta",
    "médico", "medico", "hospital", "preço", "preco", "valor",
    "onde", "qual o melhor", "me indica", "me indicar", "recomenda",
    "novidade", "atualidade", "recente", "notícia"
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

function parseImageRequest(text: string): { content: string; imagePrompt: string | null } {
  const match = text.match(/\[GERAR_IMAGEM:([\s\S]*?)\]/);
  if (!match) return { content: text.trim(), imagePrompt: null };
  const imagePrompt = match[1].trim();
  const content = text.replace(/\[GERAR_IMAGEM:[\s\S]*?\]/, "").trim();
  return { content, imagePrompt };
}

function parseDocumentRequest(text: string): { content: string; docContent: string; docType: "pdf" | "word" | null } {
  const pdfMatch = text.match(/\[GERAR_DOCUMENTO:pdf\]/i);
  const wordMatch = text.match(/\[GERAR_DOCUMENTO:word\]/i);
  const docMatch = text.match(/\[INICIO_DOCUMENTO\]([\s\S]*?)\[FIM_DOCUMENTO\]/);

  const docContent = docMatch ? docMatch[1].trim() : "";
  const content = text
    .replace(/\[GERAR_DOCUMENTO:pdf\]/gi, "")
    .replace(/\[GERAR_DOCUMENTO:word\]/gi, "")
    .replace(/\[INICIO_DOCUMENTO\][\s\S]*?\[FIM_DOCUMENTO\]/g, "")
    .trim();

  if (pdfMatch) return { content, docContent, docType: "pdf" };
  if (wordMatch) return { content, docContent, docType: "word" };
  return { content, docContent: "", docType: null };
}

interface Attachment {
  name: string;
  type: string;
  url: string;
  isImage: boolean;
}

async function extractFileText(attachment: Attachment): Promise<string> {
  const base64 = attachment.url.split(",")[1];
  if (!base64) return "";
  const buffer = Buffer.from(base64, "base64");

  if (attachment.name.endsWith(".docx") || attachment.name.endsWith(".doc")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return `[Documento Word: ${attachment.name}]\n${result.value}`;
  }

  if (attachment.name.endsWith(".xlsx") || attachment.name.endsWith(".xls")) {
    const XLSX = await import("xlsx");
    const wb = XLSX.read(buffer, { type: "buffer" });
    const text = wb.SheetNames.map(name => {
      const ws = wb.Sheets[name];
      return `Planilha ${name}:\n${XLSX.utils.sheet_to_csv(ws)}`;
    }).join("\n\n");
    return `[Planilha: ${attachment.name}]\n${text}`;
  }

  if (attachment.type === "text/plain" || attachment.name.endsWith(".txt") || attachment.name.endsWith(".md")) {
    return `[Arquivo de texto: ${attachment.name}]\n${buffer.toString("utf-8")}`;
  }

  return "";
}

function buildMessageContent(text: string, attachments: Attachment[]): Anthropic.MessageParam["content"] {
  if (!attachments || attachments.length === 0) return text || " ";

  const contentParts: Anthropic.ContentBlockParam[] = [];

  for (const att of attachments) {
    if (att.isImage && att.url.startsWith("data:")) {
      const base64 = att.url.split(",")[1];
      const mediaType = att.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
      contentParts.push({ type: "image", source: { type: "base64", media_type: mediaType, data: base64 } });
    }
  }

  for (const att of attachments) {
    if (!att.isImage && att.type === "application/pdf" && att.url.startsWith("data:")) {
      const base64 = att.url.split(",")[1];
      contentParts.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } } as Anthropic.ContentBlockParam);
    }
  }

  if (text) contentParts.push({ type: "text", text });

  return contentParts.length > 0 ? contentParts : (text || " ");
}

async function processResponse(rawText: string): Promise<{
  content: string;
  docContent: string;
  questionCards: { q: string; o: string[] } | null;
  imageUrl?: string;
  docType?: "pdf" | "word" | null;
}> {
  const { content: withoutOptions, questionCards } = parseOptions(rawText);
  const { content: withoutImage, imagePrompt } = parseImageRequest(withoutOptions);
  const { content, docContent, docType } = parseDocumentRequest(withoutImage);

  if (imagePrompt) {
    const imageUrl = await generateImage(imagePrompt);
    return { content, docContent, questionCards, imageUrl: imageUrl || undefined, docType };
  }

  return { content, docContent, questionCards, docType };
}

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const anthropic = getAnthropic();
    const { messages, attachments } = await req.json();

    const lastMessage = messages[messages.length - 1]?.content || "";
    const currentAttachments: Attachment[] = attachments || [];

    const extractedTexts: string[] = [];
    for (const att of currentAttachments) {
      if (!att.isImage && att.type !== "application/pdf") {
        const extracted = await extractFileText(att);
        if (extracted) extractedTexts.push(extracted);
      }
    }

    const history = messages.slice(-10).map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const lastContent = buildMessageContent(
      lastMessage + (extractedTexts.length > 0 ? "\n\n" + extractedTexts.join("\n\n") : ""),
      currentAttachments
    );

    const historyWithAttachments = [
      ...history.slice(0, -1),
      { role: "user" as const, content: lastContent },
    ];

    const shouldSearch = needsSearch(lastMessage) && currentAttachments.length === 0;

    if (shouldSearch) {
      const searchResults = await tavilySearch(lastMessage.slice(0, 200));
      const final = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: [
          ...historyWithAttachments.slice(0, -1),
          { role: "user", content: `${lastMessage}\n\n[Resultado da pesquisa na internet]: ${searchResults}` },
        ],
      });
      const rawText = final.content.find((b) => b.type === "text")?.text ?? "Não consegui buscar essa informação.";
      const result = await processResponse(rawText);
      return NextResponse.json({ ...result, searched: true, query: lastMessage.slice(0, 80) });
    }

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: historyWithAttachments,
      tools: currentAttachments.length === 0 ? [
        {
          name: "search_web",
          description: "Pesquisa informações atualizadas na internet.",
          input_schema: {
            type: "object" as const,
            properties: { query: { type: "string", description: "Termo de busca em português" } },
            required: ["query"],
          },
        },
      ] : [],
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (toolUse && toolUse.type === "tool_use") {
      const query = (toolUse.input as { query: string }).query;
      const searchResults = await tavilySearch(query);
      const final = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: [
          ...historyWithAttachments,
          { role: "assistant", content: response.content },
          { role: "user", content: [{ type: "tool_result", tool_use_id: toolUse.id, content: searchResults }] },
        ],
      });
      const rawText = final.content.find((b) => b.type === "text")?.text ?? "Não consegui buscar essa informação.";
      const result = await processResponse(rawText);
      return NextResponse.json({ ...result, searched: true, query });
    }

    const rawText = response.content.find((b) => b.type === "text")?.text ?? "Não entendi. Pode reformular?";
    const result = await processResponse(rawText);
    return NextResponse.json(result);

  } catch (err) {
    console.error("[chat/route]", err);
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}