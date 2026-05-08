import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle, ShadingType, AlignmentType } from "docx";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { content, title } = await req.json();
    const lines = (content as string).split("\n");
    const children: Paragraph[] = [];

    // Capa
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "Documento Oficial", size: 18, color: "FFFFFF", bold: true, allCaps: true })],
        shading: { type: ShadingType.SOLID, color: "1d4ed8", fill: "1d4ed8" },
        spacing: { before: 400, after: 0 },
        indent: { left: 600, right: 600 },
      }),
      new Paragraph({
        children: [new TextRun({ text: title || "Documento", size: 48, bold: true, color: "FFFFFF" })],
        shading: { type: ShadingType.SOLID, color: "1d4ed8", fill: "1d4ed8" },
        spacing: { before: 200, after: 0 },
        indent: { left: 600, right: 600 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
          size: 20, color: "FFFFFF", italics: true,
        })],
        shading: { type: ShadingType.SOLID, color: "0891b2", fill: "0891b2" },
        spacing: { before: 200, after: 800 },
        indent: { left: 600, right: 600 },
        pageBreakBefore: false,
      }),
      new Paragraph({
        children: [new TextRun({ text: "" })],
        pageBreakBefore: true,
      })
    );

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        children.push(new Paragraph({ children: [new TextRun({ text: "" })], spacing: { after: 120 } }));
        continue;
      }

      if (trimmed.startsWith("### ")) {
        children.push(new Paragraph({
          children: [new TextRun({ text: trimmed.replace("### ", ""), bold: true, size: 24, color: "374151" })],
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 240, after: 120 },
        }));
      } else if (trimmed.startsWith("## ")) {
        children.push(new Paragraph({
          children: [new TextRun({ text: trimmed.replace("## ", ""), bold: true, size: 28, color: "1e3a5f" })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 320, after: 160 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "0891b2", space: 1 } },
        }));
      } else if (trimmed.startsWith("# ")) {
        children.push(new Paragraph({
          children: [new TextRun({ text: trimmed.replace("# ", ""), bold: true, size: 32, color: "1d4ed8" })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
          border: { left: { style: BorderStyle.SINGLE, size: 20, color: "0891b2", space: 1 } },
          indent: { left: 200 },
        }));
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        children.push(new Paragraph({
          children: [new TextRun({ text: trimmed.replace(/^[-*] /, ""), size: 22, color: "374151" })],
          bullet: { level: 0 },
          spacing: { after: 80 },
        }));
      } else if (/^\d+\. /.test(trimmed)) {
        children.push(new Paragraph({
          children: [new TextRun({ text: trimmed.replace(/^\d+\. /, ""), size: 22, color: "374151" })],
          numbering: { reference: "default-numbering", level: 0 },
          spacing: { after: 80 },
        }));
      } else if (trimmed.startsWith("> ")) {
        children.push(new Paragraph({
          children: [new TextRun({ text: trimmed.replace("> ", ""), italics: true, size: 22, color: "374151" })],
          shading: { type: ShadingType.SOLID, color: "f0f9ff", fill: "f0f9ff" },
          border: { left: { style: BorderStyle.SINGLE, size: 20, color: "0891b2", space: 1 } },
          indent: { left: 400, right: 400 },
          spacing: { before: 160, after: 160 },
        }));
      } else if (trimmed === "---") {
        children.push(new Paragraph({
          children: [new TextRun({ text: "" })],
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "e0f2fe", space: 1 } },
          spacing: { before: 200, after: 200 },
        }));
      } else {
        const parts = trimmed.split(/(\*\*.*?\*\*)/g);
        const runs = parts.map((part: string) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return new TextRun({ text: part.slice(2, -2), bold: true, size: 22, color: "1d4ed8" });
          }
          return new TextRun({ text: part, size: 22, color: "374151" });
        });
        children.push(new Paragraph({ children: runs, spacing: { after: 120 } }));
      }
    }

    const doc = new Document({
      numbering: {
        config: [{
          reference: "default-numbering",
          levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START, style: { paragraph: { indent: { left: 720, hanging: 260 } } } }],
        }],
      },
      sections: [{ children }],
    });

    const buffer = await Packer.toBuffer(doc);
    const uint8 = new Uint8Array(buffer);

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(title || "documento")}.docx"`,
      },
    });
  } catch (err) {
    console.error("[generate/word]", err);
    return NextResponse.json({ error: "Erro ao gerar Word" }, { status: 500 });
  }
}