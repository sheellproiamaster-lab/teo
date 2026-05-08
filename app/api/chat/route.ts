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

interface Attachment {
  name: string;
  type: string;
  url: string; // base64 data URL
  isImage: boolean;
}

async function extractFileText(attachment: Attachment): Promise<string> {
  // Extrai base64 puro do data URL
  const base64 = attachment.url.split(",")[1];
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
  if (!attachments || attachments.length === 0) {
    return text || " ";
  }

  const contentParts: Anthropic.ContentBlockParam[] = [];

  // Adiciona imagens
  for (const att of attachments) {
    if (att.isImage) {
      const base64 = att.url.split(",")[1];
      const mediaType = att.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
      contentParts.push({
        type: "image",
        source: { type: "base64", media_type: mediaType, data: base64 },
      });
    }
  }

  // Adiciona texto principal + conteúdo extraído de documentos
  let fullText = text || "";
  for (const att of attachments) {
    if (!att.isImage && att.type === "application/pdf") {
      const base64 = att.url.split(",")[1];
      contentParts.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: base64 },
      } as Anthropic.ContentBlockParam);
    }
  }

  if (fullText) {
    contentParts.push({ type: "text", text: fullText });
  }

  return contentParts.length > 0 ? contentParts : (text || " ");
}

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const anthropic = getAnthropic();
    const { messages, attachments } = await req.json();

    const lastMessage = messages[messages.length - 1]?.content || "";
    const currentAttachments: Attachment[] = attachments || [];

    // Extrai texto de documentos não-imagem e não-PDF
    const extractedTexts: string[] = [];
    for (const att of currentAttachments) {
      if (!att.isImage && att.type !== "application/pdf") {
        const extracted = await extractFileText(att);
        if (extracted) extractedTexts.push(extracted);
      }
    }

    // Monta histórico sem attachments (só texto)
    const history = messages.slice(-10).map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Monta a última mensagem com attachments
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
        max_tokens: 750,
        system: SYSTEM_PROMPT,
        messages: [
          ...historyWithAttachments.slice(0, -1),
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

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 750,
      system: SYSTEM_PROMPT,
      messages: historyWithAttachments,
      tools: currentAttachments.length === 0 ? [
        {
          name: "search_web",
          description: "Pesquisa informações atualizadas na internet.",
          input_schema: {
            type: "object" as const,
            properties: {
              query: { type: "string", description: "Termo de busca em português" },
            },
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
        max_tokens: 750,
        system: SYSTEM_PROMPT,
        messages: [
          ...historyWithAttachments,
          { role: "assistant", content: response.content },
          {
            role: "user",
            content: [{ type: "tool_result", tool_use_id: toolUse.id, content: searchResults }],
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
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}