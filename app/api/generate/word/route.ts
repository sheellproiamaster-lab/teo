import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle, ShadingType, AlignmentType, PageBreak } from "docx";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { content, title } = await req.json();
    const lines = (content as string).split("\n");
    const children: Paragraph[] = [];

    // Capa premium
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "" })],
        spacing: { before: 2400, after: 0 },
      }),
      new Paragraph({
        children: [new TextRun({ text: title || "Documento", size: 52, bold: true, color: "0F172A", font: "Calibri" })],
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 200 },
        indent: { left: 600 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "", size: 4 })],
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: "1D4ED8", space: 1 } },
        spacing: { before: 0, after: 400 },
        indent: { left: 600, right: 600 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
          size: 22, color: "64748B", font: "Calibri",
        })],
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 0 },
        indent: { left: 600 },
      }),
      new Paragraph({
        children: [new PageBreak()],
        spacing: { before: 0, after: 0 },
      })
    );

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        children.push(new Paragraph({ children: [new TextRun({ text: "" })], spacing: { after: 160 } }));
        continue;
      }

      if (trimmed.startsWith("### ")) {
        children.push(new Paragraph({
          children: [new TextRun({ text: trimmed.replace("### ", ""), bold: true, size: 26, color: "1E3A5F", font: "Calibri" })],
          spacing: { before: 280, after: 120 },
        }));
      } else if (trimmed.startsWith("## ")) {
        children.push(new Paragraph({
          children: [new TextRun({ text: trimmed.replace("## ", ""), bold: true, size: 30, color: "1D4ED8", font: "Calibri" })],
          spacing: { before: 360, after: 160 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "BFDBFE", space: 1 } },
        }));
      } else if (trimmed.startsWith("# ")) {
        children.push(new Paragraph({
          children: [new TextRun({ text: trimmed.replace("# ", ""), bold: true, size: 36, color: "0F172A", font: "Calibri" })],
          spacing: { before: 480, after: 200 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "1D4ED8", space: 1 } },
        }));
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        children.push(new Paragraph({
          children: [new TextRun({ text: trimmed.replace(/^[-*] /, ""), size: 24, color: "334155", font: "Calibri" })],
          bullet: { level: 0 },
          spacing: { after: 100 },
        }));
      } else if (/^\d+\. /.test(trimmed)) {
        children.push(new Paragraph({
          children: [new TextRun({ text: trimmed.replace(/^\d+\. /, ""), size: 24, color: "334155", font: "Calibri" })],
          numbering: { reference: "default-numbering", level: 0 },
          spacing: { after: 100 },
        }));
      } else if (trimmed.startsWith("> ")) {
        children.push(new Paragraph({
          children: [new TextRun({ text: trimmed.replace("> ", ""), italics: true, size: 24, color: "475569", font: "Calibri" })],
          shading: { type: ShadingType.SOLID, color: "F8FAFF", fill: "F8FAFF" },
          border: { left: { style: BorderStyle.SINGLE, size: 24, color: "3B82F6", space: 1 } },
          indent: { left: 480, right: 480 },
          spacing: { before: 160, after: 160 },
        }));
      } else if (trimmed === "---") {
        children.push(new Paragraph({
          children: [new TextRun({ text: "" })],
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0", space: 1 } },
          spacing: { before: 240, after: 240 },
        }));
      } else {
        const parts = trimmed.split(/(\*\*.*?\*\*)/g);
        const runs = parts.map((part: string) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return new TextRun({ text: part.slice(2, -2), bold: true, size: 24, color: "0F172A", font: "Calibri" });
          }
          return new TextRun({ text: part, size: 24, color: "334155", font: "Calibri" });
        });
        children.push(new Paragraph({
          children: runs,
          spacing: { after: 160 },
          indent: { left: 0 },
        }));
      }
    }

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: "Calibri", size: 24, color: "334155" },
            paragraph: { spacing: { line: 360 } },
          },
        },
      },
      numbering: {
        config: [{
          reference: "default-numbering",
          levels: [{
            level: 0, format: "decimal", text: "%1.",
            alignment: AlignmentType.START,
            style: { paragraph: { indent: { left: 720, hanging: 260 } } },
          }],
        }],
      },
      sections: [{
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children,
      }],
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
    return NextResponse.json({ error: "Erro ao gerar Word" }, { status: 500 });
  }
}