import { DocumentModel, calculatePageGeometry, paginateDocument, PageModel } from '@docucraft/shared';

function extractFontName(fontFamilyString: string): string {
  if (!fontFamilyString) return 'Inter';
  const first = fontFamilyString.split(',')[0].trim().replace(/['"]/g, '');
  return first || 'Inter';
}

function getGoogleFontUrl(fonts: string[]): string {
  const fontWeights: Record<string, string> = {
    Inter: ':wght@300;400;500;600;700;800',
    Merriweather: ':ital,wght@0,300;0,400;0,700;1,300;1,400',
    Outfit: ':wght@400;500;600;700;800',
    Roboto: ':wght@400;500;700',
    'Playfair Display': ':ital,wght@0,400;0,600;0,700;1,400',
    'JetBrains Mono': ':wght@400;500;700',
  };

  const families = fonts
    .filter((f, idx, arr) => arr.indexOf(f) === idx)
    .map((f) => `family=${encodeURIComponent(f)}${fontWeights[f] || ':wght@400;600;700'}`)
    .join('&');

  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

export function renderDocumentHtml(doc: DocumentModel): { html: string; pageCount: number; usedFonts: string[] } {
  const { settings, title } = doc;
  const { colors, typography, header, footer } = settings;

  // Run the pre-render pagination engine
  const paginated = paginateDocument(doc);
  const { geometry, pages } = paginated;
  const totalPages = pages.length;

  // Identify fonts actually used by the document
  const headingFontName = extractFontName(typography.headingFont);
  const bodyFontName = extractFontName(typography.bodyFont);
  const usedFonts = Array.from(new Set([headingFontName, bodyFontName]));
  const fontLink = getGoogleFontUrl(usedFonts);

  // Header alignment style
  let headerJustify = 'flex-start';
  if (header.align === 'center') headerJustify = 'center';
  if (header.align === 'right') headerJustify = 'flex-end';
  if (header.align === 'split') headerJustify = 'space-between';

  // Footer alignment style
  let footerJustify = 'flex-start';
  if (footer.align === 'center') footerJustify = 'center';
  if (footer.align === 'right') footerJustify = 'flex-end';
  if (footer.align === 'split') footerJustify = 'space-between';

  const pagesHtml = pages
    .map((pageModel: PageModel) => {
      const pageNum = pageModel.pageNumber;
      let pageNumberText = `Page ${pageNum} of ${totalPages}`;
      if (footer.pageNumberFormat === 'PAGE_ONLY') {
        pageNumberText = `Page ${pageNum}`;
      } else if (footer.pageNumberFormat === 'NUMBER_ONLY') {
        pageNumberText = `${pageNum}`;
      }

      const headerContent = header.enabled
        ? `
          <header class="doc-header" style="
            position: absolute;
            top: ${geometry.headerTopMm}mm;
            left: ${geometry.marginLeftMm}mm;
            width: ${geometry.contentWidthMm}mm;
            height: ${geometry.headerHeightMm}mm;
            display: flex;
            align-items: center;
            justify-content: ${headerJustify};
            box-sizing: border-box;
            ${header.borderBottom ? `border-bottom: 1px solid ${colors.secondary || '#E2E8F0'};` : ''}
            font-size: 8.5pt;
            color: ${colors.secondary || '#64748B'};
            text-transform: uppercase;
            letter-spacing: 0.05em;
            z-index: 10;
          ">
            ${
              header.logoUrl
                ? `<img src="${header.logoUrl}" alt="Logo" style="max-height: 22px; margin-right: 12px; object-fit: contain;" />`
                : ''
            }
            ${header.companyName ? `<span class="company-name" style="font-weight: 700; color: ${colors.primary}; margin-right: 12px;">${escapeHtml(header.companyName)}</span>` : ''}
            ${header.documentTitle ? `<span class="doc-title">${escapeHtml(header.documentTitle)}</span>` : ''}
            ${header.customText ? `<span style="margin-left: auto;">${escapeHtml(header.customText)}</span>` : ''}
          </header>
        `
        : '';

      const footerContent = footer.enabled
        ? `
          <footer class="doc-footer" style="
            position: absolute;
            top: ${geometry.footerTopMm}mm;
            left: ${geometry.marginLeftMm}mm;
            width: ${geometry.contentWidthMm}mm;
            height: ${geometry.footerHeightMm}mm;
            display: flex;
            align-items: center;
            justify-content: ${footerJustify};
            box-sizing: border-box;
            ${footer.borderTop ? `border-top: 1px solid ${colors.secondary || '#E2E8F0'};` : ''}
            font-size: 8.5pt;
            color: #64748B;
            z-index: 10;
          ">
            ${footer.customText ? `<span>${escapeHtml(footer.customText)}</span>` : ''}
            ${footer.website ? `<span style="margin-left: 12px;">${escapeHtml(footer.website)}</span>` : ''}
            ${footer.email ? `<span style="margin-left: 12px;">${escapeHtml(footer.email)}</span>` : ''}
            ${footer.showPageNumbers ? `<span class="page-number" style="margin-left: auto; font-weight: 600; color: ${colors.primary};">${pageNumberText}</span>` : ''}
          </footer>
        `
        : '';

      return `
        <div class="doc-page" data-page="${pageNum}" style="
          position: relative;
          width: ${geometry.pageWidthMm}mm;
          height: ${geometry.pageHeightMm}mm;
          min-width: ${geometry.pageWidthMm}mm;
          max-width: ${geometry.pageWidthMm}mm;
          min-height: ${geometry.pageHeightMm}mm;
          max-height: ${geometry.pageHeightMm}mm;
          box-sizing: border-box;
          background-color: ${colors.background || '#FFFFFF'};
          page-break-after: always;
          break-after: page;
          overflow: hidden;
        ">
          ${headerContent}
          <main class="doc-content-area" style="
            position: absolute;
            top: ${geometry.contentTopMm}mm;
            left: ${geometry.marginLeftMm}mm;
            width: ${geometry.contentWidthMm}mm;
            height: ${geometry.contentHeightMm}mm;
            max-height: ${geometry.contentHeightMm}mm;
            box-sizing: border-box;
            overflow: hidden;
            color: ${colors.text || '#1E1E24'};
          ">
            ${pageModel.contentHtml}
          </main>
          ${footerContent}
        </div>
      `;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title || 'Document')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${fontLink}" rel="stylesheet">
  <style>
    @page {
      size: ${geometry.pageWidthMm}mm ${geometry.pageHeightMm}mm;
      margin: 0;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      background-color: ${colors.background || '#FFFFFF'};
      color: ${colors.text || '#1E1E24'};
      font-family: ${typography.bodyFont};
      font-size: ${typography.baseFontSize}pt;
      line-height: ${typography.lineHeight};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .doc-page {
      position: relative;
      width: ${geometry.pageWidthMm}mm;
      height: ${geometry.pageHeightMm}mm;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
    }

    .doc-page:last-child {
      page-break-after: avoid;
      break-after: avoid;
    }

    /* Headings */
    h1, h2, h3, h4, h5, h6 {
      font-family: ${typography.headingFont};
      color: ${colors.primary || '#1E1E24'};
      margin-top: 1.1em;
      margin-bottom: 0.45em;
      line-height: 1.25;
      page-break-after: avoid;
      break-after: avoid;
    }

    h1:first-child, h2:first-child, h3:first-child, p:first-child {
      margin-top: 0;
    }

    h1 { font-size: 2em; font-weight: 800; }
    h2 { font-size: 1.5em; font-weight: 700; }
    h3 { font-size: 1.25em; font-weight: 600; }

    p {
      margin-top: 0;
      margin-bottom: 0.9em;
    }

    /* Lists */
    ul, ol {
      margin-top: 0;
      margin-bottom: 0.9em;
      padding-left: 1.4em;
    }

    li {
      margin-bottom: 0.35em;
    }

    /* Quotes & Callouts */
    blockquote {
      border-left: 4px solid ${colors.secondary || '#FFA259'};
      background: ${colors.surface || '#FFFDF7'};
      margin: 1.1em 0;
      padding: 0.7em 1.1em;
      font-style: italic;
      color: #334155;
      border-radius: 0 4px 4px 0;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.2em 0;
      font-size: 0.9em;
      page-break-inside: avoid;
    }

    th, td {
      padding: 7px 10px;
      border: 1px solid #E2E8F0;
      text-align: left;
    }

    th {
      background-color: ${colors.surface || '#F8FAFC'};
      font-weight: 600;
      color: ${colors.primary};
    }

    /* Images */
    img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      page-break-inside: avoid;
    }

    /* Code */
    code {
      font-family: 'JetBrains Mono', monospace;
      background-color: #F1F5F9;
      padding: 2px 5px;
      border-radius: 4px;
      font-size: 0.88em;
    }

    hr {
      border: none;
      border-top: 1px solid #E2E8F0;
      margin: 1.2em 0;
    }

    mark {
      background-color: #FFEDB9;
      padding: 0 3px;
      border-radius: 2px;
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;

  return { html, pageCount: totalPages, usedFonts };
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
