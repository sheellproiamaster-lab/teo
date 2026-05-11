import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

export const maxDuration = 60;

function parseBoldRuns(text: string): TextRun[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.filter(Boolean).map(part => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return new TextRun({ text: part.slice(2, -2), bold: true });
    }
    return new TextRun({ text: part });
  });
}

function markdownToDocx(text: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  for (const line of text.split("\n")) {
    const t = line.trim();

    if (t.startsWith("### ")) {
      paragraphs.push(new Paragraph({ text: t.slice(4), heading: HeadingLevel.HEADING_3 }));
    } else if (t.startsWith("## ")) {
      paragraphs.push(new Paragraph({ text: t.slice(3), heading: HeadingLevel.HEADING_2 }));
    } else if (t.startsWith("# ")) {
      paragraphs.push(new Paragraph({ text: t.slice(2), heading: HeadingLevel.HEADING_1 }));
    } else if (t.startsWith("- ")) {
      paragraphs.push(new Paragraph({ text: t.slice(2), bullet: { level: 0 } }));
    } else if (/^\d+\.\s/.test(t)) {
      paragraphs.push(new Paragraph({ text: t.replace(/^\d+\.\s/, ""), bullet: { level: 0 } }));
    } else if (t === "" || t === "---") {
      paragraphs.push(new Paragraph({ text: "" }));
    } else {
      paragraphs.push(new Paragraph({ children: parseBoldRuns(t) }));
    }
  }

  return paragraphs;
}

export async function POST(req: NextRequest) {
  try {
    const { content, title } = await req.json();
    if (!content) return NextResponse.json({ error: "Conteúdo obrigatório" }, { status: 400 });

    const doc = new Document({
      sections: [{ properties: {}, children: markdownToDocx(content) }],
    });

    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(title || "documento")}.docx"`,
      },
    });
  } catch (err) {
    console.error("[generate/word]", err);
    return NextResponse.json({ error: "Erro ao gerar documento" }, { status: 500 });
  }
}
