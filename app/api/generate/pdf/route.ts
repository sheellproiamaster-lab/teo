import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

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
  .cover { background: linear-gradient(135deg, #1d4ed8 0%, #0891b2 100%); color: white; padding: 60px 50px; min-height: 180px; display: flex; flex-direction: column; justify-content: center; }
  .cover-badge { font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; opacity: 0.8; margin-bottom: 16px; }
  .cover-title { font-size: 28px; font-weight: 900; line-height: 1.3; margin-bottom: 12px; }
  .cover-date { font-size: 12px; opacity: 0.7; margin-top: 8px; }
  .cover-line { width: 50px; height: 3px; background: rgba(255,255,255,0.5); border-radius: 2px; margin: 16px 0; }
  .body { padding: 40px 50px; }
  h1 { font-size: 20px; font-weight: 800; color: #1d4ed8; margin: 28px 0 12px; border-left: 4px solid #0891b2; padding-left: 12px; }
  h2 { font-size: 16px; font-weight: 700; color: #1e3a5f; margin: 20px 0 8px; }
  h3 { font-size: 14px; font-weight: 600; color: #374151; margin: 16px 0 6px; }
  p { font-size: 13px; line-height: 1.8; color: #374151; margin-bottom: 12px; }
  ul, ol { padding-left: 20px; margin-bottom: 12px; }
  li { font-size: 13px; line-height: 1.8; color: #374151; margin-bottom: 4px; }
  strong { color: #1d4ed8; font-weight: 700; }
  .footer { margin-top: 40px; padding: 20px 50px; border-top: 2px solid #e0f2fe; display: flex; justify-content: space-between; align-items: center; }
  .footer-brand { font-size: 11px; font-weight: 800; color: #1d4ed8; letter-spacing: 1px; }
  .footer-page { font-size: 11px; color: #94a3b8; }
  blockquote { border-left: 3px solid #0891b2; padding: 12px 16px; background: #f0f9ff; margin: 16px 0; border-radius: 0 8px 8px 0; font-style: italic; color: #374151; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }
  th { background: #1d4ed8; color: white; padding: 10px 12px; text-align: left; font-weight: 700; }
  td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #374151; }
  tr:nth-child(even) td { background: #f8fafc; }
  .divider { height: 1px; background: #e0f2fe; margin: 24px 0; }
</style>
</head>
<body>
<div class="cover">
  <div class="cover-badge">✦ Documento gerado pelo Teo</div>
  <div class="cover-title">${title || "Documento"}</div>
  <div class="cover-line"></div>
  <div class="cover-date">Gerado em ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</div>
</div>
<div class="body">
${convertMarkdownToHtml(content)}
</div>
<div class="footer">
  <div class="footer-brand">TEO ✦</div>
  <div class="footer-page">Seu parceiro para famílias especiais</div>
</div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Document-Title": encodeURIComponent(title || "documento"),
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
    .replace(/^---$/gm, "<div class='divider'></div>")
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
    .replace(/(divider">)<\/div><\/p>/g, "$1</div>");
}