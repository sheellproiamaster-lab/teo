import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

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
  body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fdf8f4; }

  .corpo { padding: 48px 64px; }

  h1 {
    display: block;
    background: #2563eb;
    color: #ffffff;
    font-size: 18px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 13px 20px;
    margin: 32px 0 16px;
    border-radius: 4px;
    text-align: center;
  }
  h1:first-child { margin-top: 0; }

  h2 {
    display: block;
    background: #2563eb;
    color: #ffffff;
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 11px 18px;
    margin: 28px 0 12px;
    border-radius: 4px;
    text-align: center;
  }

  h3 {
    display: block;
    background: #2563eb;
    color: #ffffff;
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
    padding: 9px 16px;
    margin: 20px 0 10px;
    border-radius: 4px;
    text-align: center;
  }

  p {
    font-size: 13.5px; line-height: 1.9; color: #1a1a1a;
    margin-bottom: 14px; font-weight: 400;
  }

  ul { list-style: none; padding: 0; margin-bottom: 16px; }
  ul li {
    font-size: 13.5px; line-height: 1.8; color: #1a1a1a;
    margin-bottom: 6px; padding-left: 20px; position: relative;
  }
  ul li::before {
    content: ''; position: absolute; left: 0; top: 9px;
    width: 6px; height: 6px; border-radius: 50%;
    background: #2563eb;
  }

  ol { padding-left: 20px; margin-bottom: 16px; }
  ol li {
    font-size: 13.5px; line-height: 1.8; color: #1a1a1a;
    margin-bottom: 6px; padding-left: 4px;
  }

  strong { color: #1a1a1a; font-weight: 700; }
  em { color: #444; font-style: italic; }

  blockquote {
    border-left: 3px solid #2563eb;
    padding: 14px 20px; background: #eef4ff;
    margin: 20px 0; border-radius: 0 8px 8px 0;
    color: #1a1a1a; font-size: 13.5px; line-height: 1.8;
  }

  table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
  thead tr { background: #2563eb; }
  th { color: white; padding: 12px 16px; text-align: left; font-weight: 700; font-size: 12px; letter-spacing: 0.5px; }
  td { padding: 10px 16px; border-bottom: 1px solid #e8ddd5; color: #1a1a1a; }
  tr:nth-child(even) td { background: #f7f0ea; }
  tr:last-child td { border-bottom: none; }

  .divisor { height: 1px; background: #e8ddd5; margin: 32px 0; }

  @media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    h1, h2, h3 { page-break-after: avoid; }
    p, li { page-break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="corpo">
${convertMarkdownToHtml(content)}
</div>
</body>
</html>`;

    const pdfController = new AbortController();
    const pdfTimeout = setTimeout(() => pdfController.abort(), 55000);

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
        margin: { top: "14mm", bottom: "14mm", left: "0mm", right: "0mm" },
      }),
      signal: pdfController.signal,
    }).finally(() => clearTimeout(pdfTimeout));

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