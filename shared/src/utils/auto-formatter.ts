/**
 * Intelligent Auto-Formatter
 * Converts raw plain text into rich semantic HTML matching template styling
 */
export function autoFormatPlainText(rawText: string, templateTitle?: string): string {
  if (!rawText || !rawText.trim()) {
    return `<p>Start typing your document...</p>`;
  }

  const lines = rawText.split(/\r?\n/);
  const formattedBlocks: string[] = [];
  let inBulletList = false;
  let inNumberedList = false;
  let isFirstLine = true;

  function closeLists() {
    if (inBulletList) {
      formattedBlocks.push('</ul>');
      inBulletList = false;
    }
    if (inNumberedList) {
      formattedBlocks.push('</ol>');
      inNumberedList = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      closeLists();
      continue;
    }

    // Markdown H1 or explicit first line title detection
    if (trimmed.startsWith('# ')) {
      closeLists();
      const content = trimmed.substring(2).trim();
      formattedBlocks.push(`<h1>${escapeHtml(content)}</h1>`);
      isFirstLine = false;
      continue;
    }

    // Markdown H2
    if (trimmed.startsWith('## ')) {
      closeLists();
      const content = trimmed.substring(3).trim();
      formattedBlocks.push(`<h2>${escapeHtml(content)}</h2>`);
      isFirstLine = false;
      continue;
    }

    // Markdown H3
    if (trimmed.startsWith('### ')) {
      closeLists();
      const content = trimmed.substring(4).trim();
      formattedBlocks.push(`<h3>${escapeHtml(content)}</h3>`);
      isFirstLine = false;
      continue;
    }

    // Bullet point detection (*, -, •)
    const bulletMatch = trimmed.match(/^[\*\-\•]\s+(.*)$/);
    if (bulletMatch) {
      if (inNumberedList) closeLists();
      if (!inBulletList) {
        formattedBlocks.push('<ul>');
        inBulletList = true;
      }
      formattedBlocks.push(`<li>${formatInlineStyles(bulletMatch[1])}</li>`);
      isFirstLine = false;
      continue;
    }

    // Numbered list detection (1. or 1))
    const numberMatch = trimmed.match(/^\d+[\.\)]\s+(.*)$/);
    if (numberMatch) {
      if (inBulletList) closeLists();
      if (!inNumberedList) {
        formattedBlocks.push('<ol>');
        inNumberedList = true;
      }
      formattedBlocks.push(`<li>${formatInlineStyles(numberMatch[1])}</li>`);
      isFirstLine = false;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      closeLists();
      const quote = trimmed.substring(2).trim();
      formattedBlocks.push(`<blockquote>${formatInlineStyles(quote)}</blockquote>`);
      isFirstLine = false;
      continue;
    }

    // Contact info line detection (contains email, phone number, pipe or bullet separated)
    const isContactLine = (
      trimmed.includes('@') ||
      trimmed.match(/\+?\d[\d\s\-\(\)]{7,}\d/) ||
      trimmed.includes('www.') ||
      trimmed.includes('http')
    ) && (trimmed.length < 120 && !trimmed.endsWith('.'));

    if (isContactLine) {
      closeLists();
      formattedBlocks.push(`<p style="color: #64748B; font-size: 0.9em; margin-bottom: 12px;">${formatInlineStyles(trimmed)}</p>`);
      isFirstLine = false;
      continue;
    }

    // First line title heuristic (if short, not ending in period)
    if (isFirstLine && trimmed.length < 70 && !trimmed.endsWith('.')) {
      closeLists();
      formattedBlocks.push(`<h1>${escapeHtml(trimmed)}</h1>`);
      isFirstLine = false;
      continue;
    }

    // Short section heading heuristic (e.g. "Achievements", "1. Executive Summary", "KEY HIGHLIGHTS")
    const isHeadingHeuristic = (
      trimmed.length < 50 &&
      !trimmed.endsWith('.') &&
      !trimmed.includes(',') &&
      (trimmed === trimmed.toUpperCase() || /^[A-Z][a-zA-Z\s0-9]{2,35}$/.test(trimmed))
    );

    if (isHeadingHeuristic) {
      closeLists();
      formattedBlocks.push(`<h2>${escapeHtml(trimmed)}</h2>`);
      isFirstLine = false;
      continue;
    }

    // Normal Paragraph
    closeLists();
    formattedBlocks.push(`<p>${formatInlineStyles(trimmed)}</p>`);
    isFirstLine = false;
  }

  closeLists();
  return formattedBlocks.join('\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatInlineStyles(text: string): string {
  let escaped = escapeHtml(text);
  // Bold **text**
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic *text* or _text_
  escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Code `code`
  escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
  return escaped;
}
