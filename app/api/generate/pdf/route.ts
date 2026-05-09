import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { content, title } = await req.json();

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; color: #0f172a; background: #fff; }

  .capa {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #1d4ed8 100%);
    color: white;
    padding: 0;
    min-height: 140mm;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    position: relative;
    overflow: hidden;
    page-break-after: always;
  }
  .capa-bg-circle1 {
    position: absolute; top: -80px; right: -80px;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: rgba(99,179,237,0.08);
  }
  .capa-bg-circle2 {
    position: absolute; top: 100px; right: 60px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: rgba(99,179,237,0.06);
  }
  .capa-bg-line {
    position: absolute; bottom: 180px; left: 0; right: 0;
    height: 1px; background: rgba(255,255,255,0.08);
  }
  .capa-conteudo {
    padding: 60px 70px 80px;
    position: relative; z-index: 1;
  }
  .capa-tag {
    display: inline-block;
    font-size: 10px; font-weight: 700;
    letter-spacing: 4px; text-transform: uppercase;
    color: rgba(255,255,255,0.5);
    margin-bottom: 24px;
  }
  .capa-titulo {
    font-size: 42px; font-weight: 900;
    line-height: 1.15; letter-spacing: -1px;
    color: #ffffff;
    margin-bottom: 24px;
    max-width: 520px;
  }
  .capa-linha {
    width: 48px; height: 4px;
    background: #3b82f6;
    border-radius: 2px;
    margin-bottom: 32px;
  }
  .capa-subtitulo {
    font-size: 14px; font-weight: 400;
    color: rgba(255,255,255,0.55);
    letter-spacing: 0.5px;
  }

  .corpo { padding: 56px 70px; }

  h1 {
    font-size: 22px; font-weight: 800; color: #0f172a;
    margin: 40px 0 16px;
    padding-bottom: 10px;
    border-bottom: 2px solid #e2e8f0;
    letter-spacing: -0.3px;
  }
  h1:first-child { margin-top: 0; }

  h2 {
    font-size: 16px; font-weight: 700; color: #1d4ed8;
    margin: 28px 0 10px;
    display: flex; align-items: center; gap: 8px;
  }
  h2::before {
    content: '';
    display: inline-block;
    width: 4px; height: 16px;
    background: #3b82f6;
    border-radius: 2px;
    flex-shrink: 0;
  }

  h3 {
    font-size: 14px; font-weight: 600; color: #334155;
    margin: 20px 0 8px;
  }

  p {
    font-size: 13.5px; line-height: 1.9; color: #334155;
    margin-bottom: 14px; font-weight: 400;
  }

  ul { list-style: none; padding: 0; margin-bottom: 16px; }
  ul li {
    font-size: 13.5px; line-height: 1.8; color: #334155;
    margin-bottom: 6px; padding-left: 20px; position: relative;
  }
  ul li::before {
    content: ''; position: absolute; left: 0; top: 9px;
    width: 6px; height: 6px; border-radius: 50%;
    background: #3b82f6;
  }

  ol { padding-left: 20px; margin-bottom: 16px; }
  ol li {
    font-size: 13.5px; line-height: 1.8; color: #334155;
    margin-bottom: 6px; padding-left: 4px;
  }

  strong { color: #0f172a; font-weight: 700; }
  em { color: #475569; font-style: italic; }

  blockquote {
    border-left: 3px solid #3b82f6;
    padding: 14px 20px; background: #f8faff;
    margin: 20px 0; border-radius: 0 8px 8px 0;
    color: #334155; font-size: 13.5px; line-height: 1.8;
  }

  table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
  thead tr { background: #0f172a; }
  th { color: white; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 12px; letter-spacing: 0.5px; }
  td { padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; }
  tr:nth-child(even) td { background: #f8fafc; }
  tr:last-child td { border-bottom: none; }

  .divisor { height: 1px; background: #e2e8f0; margin: 32px 0; }

  .destaque {
    background: linear-gradient(135deg, #eff6ff, #f0f9ff);
    border: 1px solid #bfdbfe; border-radius: 12px;
    padding: 20px 24px; margin: 20px 0;
  }

  @media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .capa { min-height: 100vh; }
    h1, h2, h3 { page-break-after: avoid; }
    p, li { page-break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="capa">
  <div class="capa-bg-circle1"></div>
  <div class="capa-bg-circle2"></div>
  <div class="capa-bg-line"></div>
  <div class="capa-conteudo">
    <div class="capa-tag">Documento</div>
    <div class="capa-titulo">${title || "Documento"}</div>
    <div class="capa-linha"></div>
    <div class="capa-subtitulo">Gerado com inteligência e cuidado</div>
  </div>
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
  let html = text;

  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");
  html = html.replace(/^---$/gm, "<div class='divisor'></div>");

  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/^(\d+)\. (.+)$/gm, "<li data-ol>$2</li>");

  html = html.replace(/(<li data-ol>[\s\S]*?<\/li>\n?)+/g, match => `<ol>${match.replace(/ data-ol/g, "")}</ol>`);
  html = html.replace(/(<li>(?!.*data-ol)[\s\S]*?<\/li>\n?)+/g, match => {
    if (match.includes("<ol>")) return match;
    return `<ul>${match}</ul>`;
  });

  html = html.split("\n\n").map(block => {
    if (/^<(h[123]|ul|ol|blockquote|div|table)/.test(block.trim())) return block;
    if (block.trim() === "") return "";
    return `<p>${block.trim()}</p>`;
  }).join("\n");

  return html;
}