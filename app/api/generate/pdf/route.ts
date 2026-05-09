import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { content, title } = await req.json();

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; background: #fff; }
  .capa { background: linear-gradient(135deg, #1d4ed8 0%, #0891b2 100%); color: white; padding: 80px 60px; min-height: 220px; display: flex; flex-direction: column; justify-content: center; }
  .capa-label { font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; opacity: 0.75; margin-bottom: 20px; }
  .capa-titulo { font-size: 32px; font-weight: 900; line-height: 1.3; margin-bottom: 16px; }
  .capa-linha { width: 60px; height: 3px; background: rgba(255,255,255,0.5); border-radius: 2px; margin: 16px 0; }
  .capa-data { font-size: 13px; opacity: 0.65; }
  .corpo { padding: 50px 60px; }
  h1 { font-size: 20px; font-weight: 800; color: #1d4ed8; margin: 32px 0 14px; border-left: 4px solid #0891b2; padding-left: 14px; }
  h2 { font-size: 17px; font-weight: 700; color: #1e3a5f; margin: 24px 0 10px; }
  h3 { font-size: 14px; font-weight: 600; color: #374151; margin: 18px 0 8px; }
  p { font-size: 13px; line-height: 1.9; color: #374151; margin-bottom: 14px; }
  ul, ol { padding-left: 22px; margin-bottom: 14px; }
  li { font-size: 13px; line-height: 1.9; color: #374151; margin-bottom: 5px; }
  strong { color: #1d4ed8; font-weight: 700; }
  blockquote { border-left: 3px solid #0891b2; padding: 12px 18px; background: #f0f9ff; margin: 18px 0; border-radius: 0 8px 8px 0; font-style: italic; color: #374151; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 12px; }
  th { background: #1d4ed8; color: white; padding: 10px 14px; text-align: left; font-weight: 700; }
  td { padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #374151; }
  tr:nth-child(even) td { background: #f8fafc; }
  .divisor { height: 1px; background: #e0f2fe; margin: 28px 0; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .capa { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
<div class="capa">
  <div class="capa-label">Documento Oficial</div>
  <div class="capa-titulo">${title || "Documento"}</div>
  <div class="capa-linha"></div>
  <div class="capa-data">${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</div>
</div>
<div class="corpo">
${convertMarkdownToHtml(content)}
</div>
</body>
</html>`;

    const response = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${Buffer.from(`api:${process.env.PDFSHIFT_API_KEY}`).toString("base64")}`,
      },
      body: JSON.stringify({
        source: html,
        landscape: false,
        use_print: true,
        format: "A4",
        margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[pdfshift error]", err);
      return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 });
    }

    const pdfBuffer = await response.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(title || "documento")}.pdf"`,
      },
    });
  } catch (err) {
    console.error("[generate/pdf]", err);
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 });
  }
}

function convertMarkdownToHtml(text: string): string {
  return text
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^---$/gm, "<div class='divisor'></div>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
    .replace(/(<li>.*<\/li>(\n|$))+/g, match => `<ul>${match}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hublp])/gm, "<p>")
    .replace(/(?<![>])$/gm, "</p>")
    .replace(/<p><\/p>/g, "")
    .replace(/<p>(<h[123]>)/g, "$1")
    .replace(/(<\/h[123]>)<\/p>/g, "$1")
    .replace(/<p>(<ul>)/g, "$1")
    .replace(/(<\/ul>)<\/p>/g, "$1")
    .replace(/<p>(<div)/g, "$1")
    .replace(/(divisor">)<\/div><\/p>/g, "$1</div>");
}