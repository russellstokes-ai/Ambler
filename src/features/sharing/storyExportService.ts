import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Storybook } from '../../types';

export async function exportStorybookPdf(storybook: Storybook): Promise<string> {
  const pdf = buildSimplePdf(storybook);
  const safeName = sanitizeFilename(storybook.title || 'ambler-story');
  const uri = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory}${safeName}.pdf`;
  await FileSystem.writeAsStringAsync(uri, pdf, { encoding: FileSystem.EncodingType.UTF8 });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Export Ambler story' });
  }
  return uri;
}

export function buildPrintableStoryHtml(storybook: Storybook): string {
  const pages = storybook.pages.map((page, index) => {
    const insights = Array.isArray(page.data.insights)
      ? (page.data.insights as Array<{ label?: string; value?: string }>).slice(0, 8)
      : [];
    const stats = insights.map((item) => `<li><strong>${escapeHtml(String(item.value ?? ''))}</strong> ${escapeHtml(String(item.label ?? ''))}</li>`).join('');
    return `<section class="page"><div class="kicker">${index + 1} / ${storybook.pages.length} · ${escapeHtml(page.type.replaceAll('_', ' '))}</div><h2>${escapeHtml(page.title)}</h2>${page.subtitle ? `<p>${escapeHtml(page.subtitle)}</p>` : ''}${stats ? `<ul>${stats}</ul>` : ''}</section>`;
  }).join('');

  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(storybook.title)}</title><style>
  @page{size:A4;margin:18mm}*{box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#18122B;margin:0;background:#fff}.cover,.page{min-height:245mm;page-break-after:always;display:flex;flex-direction:column;justify-content:center;padding:18mm}.cover{background:linear-gradient(135deg,#18122B,#5B2CFF);color:white}.brand,.kicker{font-size:10px;letter-spacing:2px;font-weight:800;text-transform:uppercase;opacity:.65}h1{font-size:48px;line-height:1.02;margin:18px 0}h2{font-size:36px;line-height:1.08;margin:12px 0}p{font-size:18px;line-height:1.55;color:#746B8C;max-width:150mm}ul{list-style:none;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:28px}li{padding:14px;border:1px solid #E8E1F8;border-radius:14px}li strong{display:block;font-size:22px}.footer{font-size:9px;letter-spacing:1.6px;margin-top:auto;opacity:.5}</style></head><body><section class="cover"><div class="brand">AMBLER · STORY EDITION</div><h1>${escapeHtml(storybook.title)}</h1><div class="footer">Capture · Build · Relive</div></section>${pages}</body></html>`;
}

function buildSimplePdf(storybook: Storybook): string {
  const pageData = storybook.pages.map((page, index) => {
    const lines = [
      'AMBLER',
      storybook.title,
      `${index + 1} / ${storybook.pages.length}`,
      page.title,
      page.subtitle ?? '',
      ...extractPageLines(page.data),
    ].filter(Boolean).map(asciiPdfText);
    return lines.slice(0, 18);
  });

  const objects = new Map<number, string>();
  const pageObjectIds: number[] = [];
  objects.set(1, '<< /Type /Catalog /Pages 2 0 R >>');
  objects.set(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  pageData.forEach((lines, index) => {
    const pageId = 4 + index * 2;
    const contentId = pageId + 1;
    pageObjectIds.push(pageId);
    const commands: string[] = ['BT', '/F1 11 Tf', '56 790 Td'];
    lines.forEach((line, lineIndex) => {
      if (lineIndex === 0) commands.push('/F1 10 Tf');
      if (lineIndex === 1) commands.push('/F1 24 Tf');
      if (lineIndex === 3) commands.push('/F1 18 Tf');
      if (lineIndex === 4) commands.push('/F1 11 Tf');
      if (lineIndex > 0) commands.push(`0 -${lineIndex === 1 ? 34 : lineIndex === 3 ? 42 : 22} Td`);
      commands.push(`(${escapePdf(line)}) Tj`);
    });
    commands.push('ET');
    const stream = commands.join('\n');
    objects.set(contentId, `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    objects.set(pageId, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`);
  });

  objects.set(2, `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjectIds.length} >>`);

  const maxId = Math.max(...objects.keys());
  let pdf = '%PDF-1.4\n';
  const offsets = new Array(maxId + 1).fill(0);
  for (let id = 1; id <= maxId; id += 1) {
    const body = objects.get(id) ?? '<< >>';
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${body}\nendobj\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${maxId + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= maxId; id += 1) pdf += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${maxId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

function extractPageLines(data: Record<string, unknown>): string[] {
  const result: string[] = [];
  const insights = Array.isArray(data.insights) ? data.insights as Array<{ label?: unknown; value?: unknown }> : [];
  for (const insight of insights.slice(0, 8)) {
    if (insight.value != null || insight.label != null) result.push(`${String(insight.value ?? '')} — ${String(insight.label ?? '')}`);
  }
  const captions = Array.isArray(data.captions) ? data.captions as Array<{ name?: unknown; text?: unknown }> : [];
  for (const caption of captions.slice(0, 5)) result.push(`${String(caption.name ?? 'Guest')}: ${String(caption.text ?? '')}`);
  return result;
}

function asciiPdfText(value: string): string {
  return value.normalize('NFKD').replace(/[^\x20-\x7E]/g, '').slice(0, 100);
}
function escapePdf(value: string): string { return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'); }
function sanitizeFilename(value: string): string { return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'ambler-story'; }
function escapeHtml(value: string): string { return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] ?? char)); }
