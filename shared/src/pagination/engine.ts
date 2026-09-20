import { DocumentModel, DocumentPage, DocumentSettings } from '../types';
import { calculatePageGeometry, PageGeometry, PX_PER_MM } from '../constants';

export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'bullet_list'
  | 'numbered_list'
  | 'image'
  | 'table'
  | 'quote'
  | 'divider'
  | 'callout'
  | 'signature'
  | 'custom';

export interface ContentBlock {
  id: string;
  type: BlockType;
  html: string;
  rawText: string;
  estimatedHeightPx: number;
  canSplit: boolean;
}

export interface PageModel {
  pageNumber: number;
  blocks: ContentBlock[];
  contentHtml: string;
  availableHeightPx: number;
  usedHeightPx: number;
}

export interface PaginatedDocument {
  geometry: PageGeometry;
  pages: PageModel[];
  totalEstimatedPages: number;
  hasStrippedPlaceholders: boolean;
}

/**
 * Checks if a block is an editor placeholder (e.g. "Start writing on page 2...")
 */
export function isPlaceholderBlock(rawText: string): boolean {
  const normalized = rawText.trim().replace(/\s+/g, ' ');
  if (!normalized) return false;

  const placeholderPatterns = [
    /^Start writing on page \d+\.{0,3}$/i,
    /^Start writing\.{0,3}$/i,
    /^Type '\/' for commands\.{0,3}$/i,
    /^Write something\.{0,3}$/i,
    /^Click here to start writing\.{0,3}$/i,
  ];

  return placeholderPatterns.some((pattern) => pattern.test(normalized));
}

/**
 * Strips HTML tags to get raw readable text for estimation and checks
 */
export function extractRawText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Estimates the rendered pixel height of an atomic block based on document typography and content width
 */
export function estimateBlockHeight(
  type: BlockType,
  html: string,
  rawText: string,
  contentWidthPx: number,
  typography: DocumentSettings['typography']
): number {
  const baseFontSizePt = typography.baseFontSize || 10.5;
  const baseFontSizePx = baseFontSizePt * (96 / 72); // pt to px at 96 DPI
  const lineHeight = typography.lineHeight || 1.6;
  const bodyLineHeightPx = baseFontSizePx * lineHeight;

  // Average character width for proportional sans-serif fonts
  const avgCharWidthPx = baseFontSizePx * 0.52;
  const charsPerLine = Math.max(20, Math.floor(contentWidthPx / avgCharWidthPx));

  switch (type) {
    case 'heading': {
      let headingFontSizePx = baseFontSizePx * 1.5;
      let headingMarginPx = 30;

      if (/<h1/i.test(html)) {
        headingFontSizePx = baseFontSizePx * 2.0;
        headingMarginPx = 40;
      } else if (/<h2/i.test(html)) {
        headingFontSizePx = baseFontSizePx * 1.5;
        headingMarginPx = 32;
      } else if (/<h3/i.test(html)) {
        headingFontSizePx = baseFontSizePx * 1.25;
        headingMarginPx = 26;
      } else {
        headingFontSizePx = baseFontSizePx * 1.1;
        headingMarginPx = 20;
      }

      const headingCharsPerLine = Math.max(15, Math.floor(contentWidthPx / (headingFontSizePx * 0.55)));
      const lines = Math.max(1, Math.ceil(rawText.length / headingCharsPerLine));
      return Math.round(lines * (headingFontSizePx * 1.25) + headingMarginPx);
    }

    case 'paragraph': {
      if (!rawText.trim()) {
        return Math.round(bodyLineHeightPx);
      }
      const lines = Math.max(1, Math.ceil(rawText.length / charsPerLine));
      const paragraphMarginPx = Math.round(bodyLineHeightPx * 0.75);
      return Math.round(lines * bodyLineHeightPx + paragraphMarginPx);
    }

    case 'bullet_list':
    case 'numbered_list': {
      const items = (html.match(/<li[^>]*>/gi) || []).length || 1;
      const listMarginPx = 24;
      const itemMarginPx = 6;
      const itemLines = Math.max(items, Math.ceil(rawText.length / (charsPerLine * 0.9)));
      return Math.round(itemLines * bodyLineHeightPx + items * itemMarginPx + listMarginPx);
    }

    case 'table': {
      const rows = (html.match(/<tr[^>]*>/gi) || []).length || 2;
      const rowHeightPx = 36;
      const tableMarginPx = 28;
      return Math.round(rows * rowHeightPx + tableMarginPx);
    }

    case 'quote': {
      const lines = Math.max(1, Math.ceil(rawText.length / (charsPerLine * 0.88)));
      const quotePaddingMarginPx = 44;
      return Math.round(lines * bodyLineHeightPx + quotePaddingMarginPx);
    }

    case 'image': {
      // Check for explicit height attribute or style
      const heightAttr = html.match(/height=["']?(\d+)["']?/i);
      if (heightAttr && heightAttr[1]) {
        return parseInt(heightAttr[1], 10) + 24;
      }
      const styleHeight = html.match(/height:\s*(\d+)px/i);
      if (styleHeight && styleHeight[1]) {
        return parseInt(styleHeight[1], 10) + 24;
      }
      // Default standard image height
      return 220;
    }

    case 'divider':
      return 30;

    case 'signature':
      return 100;

    case 'callout':
      return 85;

    case 'custom':
    default: {
      const lines = Math.max(1, Math.ceil(rawText.length / charsPerLine));
      return Math.round(lines * bodyLineHeightPx + 20);
    }
  }
}

/**
 * Splits HTML content into atomic blocks
 */
export function extractContentBlocks(
  html: string,
  contentWidthPx: number,
  typography: DocumentSettings['typography']
): ContentBlock[] {
  if (!html || !html.trim()) return [];

  // Match top-level blocks
  const blockRegex =
    /(<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>|<table[^>]*>[\s\S]*?<\/table>|<ul[^>]*>[\s\S]*?<\/ul>|<ol[^>]*>[\s\S]*?<\/ol>|<blockquote[^>]*>[\s\S]*?<\/blockquote>|<figure[^>]*>[\s\S]*?<\/figure>|<div[^>]*class="[^"]*(callout|signature)[^"]*"[^>]*>[\s\S]*?<\/div>|<img[^>]*\/?>|<hr[^>]*\/?>|<p[^>]*>[\s\S]*?<\/p>)/gi;

  const rawBlocks: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(html)) !== null) {
    // Check if there was non-whitespace content before this match
    if (match.index > lastIndex) {
      const interstitial = html.substring(lastIndex, match.index).trim();
      if (interstitial && !/^(&nbsp;|\s|<br\s*\/?>)+$/.test(interstitial)) {
        rawBlocks.push(`<p>${interstitial}</p>`);
      }
    }
    rawBlocks.push(match[0]);
    lastIndex = match.index + match[0].length;
  }

  // Trailing content
  if (lastIndex < html.length) {
    const trailing = html.substring(lastIndex).trim();
    if (trailing && !/^(&nbsp;|\s|<br\s*\/?>)+$/.test(trailing)) {
      rawBlocks.push(`<p>${trailing}</p>`);
    }
  }

  // If no blocks matched via regex, wrap entire html in a block
  if (rawBlocks.length === 0 && html.trim()) {
    rawBlocks.push(html.trim());
  }

  const blocks: ContentBlock[] = [];

  for (let i = 0; i < rawBlocks.length; i++) {
    const rawHtml = rawBlocks[i];
    const rawText = extractRawText(rawHtml);

    // Determine type
    let type: BlockType = 'paragraph';
    let canSplit = false;

    if (/<h[1-6]/i.test(rawHtml)) {
      type = 'heading';
      canSplit = false;
    } else if (/<table/i.test(rawHtml)) {
      type = 'table';
      canSplit = true;
    } else if (/<ul/i.test(rawHtml)) {
      type = 'bullet_list';
      canSplit = true;
    } else if (/<ol/i.test(rawHtml)) {
      type = 'numbered_list';
      canSplit = true;
    } else if (/<blockquote/i.test(rawHtml)) {
      type = 'quote';
      canSplit = false;
    } else if (/<figure|<img/i.test(rawHtml)) {
      type = 'image';
      canSplit = false;
    } else if (/<hr/i.test(rawHtml)) {
      type = 'divider';
      canSplit = false;
    } else if (/callout/i.test(rawHtml)) {
      type = 'callout';
      canSplit = false;
    } else if (/signature/i.test(rawHtml)) {
      type = 'signature';
      canSplit = false;
    } else if (/<p/i.test(rawHtml)) {
      type = 'paragraph';
      canSplit = true; // long paragraphs can split cleanly across pages
    } else {
      type = 'custom';
      canSplit = false;
    }

    const estimatedHeightPx = estimateBlockHeight(type, rawHtml, rawText, contentWidthPx, typography);

    blocks.push({
      id: `block-${i}-${Date.now()}`,
      type,
      html: rawHtml,
      rawText,
      estimatedHeightPx,
      canSplit,
    });
  }

  return blocks;
}

/**
 * Splits a long paragraph at sentence boundaries if it cannot fit in remaining page space
 */
export function splitParagraphBlock(
  block: ContentBlock,
  availableHeightPx: number,
  contentWidthPx: number,
  typography: DocumentSettings['typography']
): [ContentBlock, ContentBlock] | null {
  const sentences = block.rawText.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g);
  if (!sentences || sentences.length <= 1) return null;

  const baseFontSizePx = (typography.baseFontSize || 10.5) * (96 / 72);
  const bodyLineHeightPx = baseFontSizePx * (typography.lineHeight || 1.6);

  // Require at least 2 lines to fit and at least 2 lines to carry over
  const minFittingHeight = bodyLineHeightPx * 2;
  if (availableHeightPx < minFittingHeight) return null;

  let part1Sentences: string[] = [];
  let part2Sentences: string[] = [];
  let accumulatedText = '';

  for (let i = 0; i < sentences.length; i++) {
    const testText = accumulatedText + sentences[i];
    const testHeight = estimateBlockHeight('paragraph', '', testText, contentWidthPx, typography);

    if (testHeight <= availableHeightPx && i < sentences.length - 1) {
      part1Sentences.push(sentences[i]);
      accumulatedText = testText;
    } else {
      part2Sentences = sentences.slice(i);
      break;
    }
  }

  if (part1Sentences.length === 0 || part2Sentences.length === 0) return null;

  const text1 = part1Sentences.join(' ').trim();
  const text2 = part2Sentences.join(' ').trim();

  const block1: ContentBlock = {
    id: `${block.id}-part1`,
    type: 'paragraph',
    html: `<p>${text1}</p>`,
    rawText: text1,
    estimatedHeightPx: estimateBlockHeight('paragraph', '', text1, contentWidthPx, typography),
    canSplit: false,
  };

  const block2: ContentBlock = {
    id: `${block.id}-part2`,
    type: 'paragraph',
    html: `<p>${text2}</p>`,
    rawText: text2,
    estimatedHeightPx: estimateBlockHeight('paragraph', '', text2, contentWidthPx, typography),
    canSplit: true,
  };

  return [block1, block2];
}

/**
 * Master pagination function.
 * Calculates exact geometry, extracts atomic blocks, paginates without overflow,
 * strips placeholders, and creates discrete PageModel items.
 */
export function paginateDocument(doc: DocumentModel): PaginatedDocument {
  const geometry = calculatePageGeometry(doc.settings);
  const availableHeightPx = geometry.contentHeightPx;
  const contentWidthPx = geometry.contentWidthPx;
  const typography = doc.settings.typography;

  let hasStrippedPlaceholders = false;

  // Step 1: Collect non-placeholder blocks across all editor pages
  interface PageBlockCollection {
    pageNumber: number;
    blocks: ContentBlock[];
    wasPurePlaceholder: boolean;
  }

  const collections: PageBlockCollection[] = doc.pages.map((page, index) => {
    const allBlocks = extractContentBlocks(page.contentHtml, contentWidthPx, typography);
    const validBlocks: ContentBlock[] = [];
    let pageHasPlaceholder = false;

    for (const b of allBlocks) {
      if (isPlaceholderBlock(b.rawText)) {
        hasStrippedPlaceholders = true;
        pageHasPlaceholder = true;
      } else {
        validBlocks.push(b);
      }
    }

    return {
      pageNumber: index + 1,
      blocks: validBlocks,
      wasPurePlaceholder: pageHasPlaceholder && validBlocks.length === 0,
    };
  });

  // Step 2: Handle trailing empty/placeholder pages
  // "If an actually empty page is not intentionally required by the document structure, do not generate an unnecessary blank PDF page."
  let filteredCollections = [...collections];
  while (filteredCollections.length > 1) {
    const last = filteredCollections[filteredCollections.length - 1];
    if (last.wasPurePlaceholder || (last.blocks.length === 0 && !last.wasPurePlaceholder && filteredCollections.length > 1)) {
      // Trailing empty/placeholder page removed
      filteredCollections.pop();
    } else {
      break;
    }
  }

  // If document was completely empty, preserve at least 1 page
  if (filteredCollections.length === 0) {
    filteredCollections = [{ pageNumber: 1, blocks: [], wasPurePlaceholder: false }];
  }

  // Step 3: Block distribution & pagination into PageModels
  const pageModels: PageModel[] = [];

  for (let cIdx = 0; cIdx < filteredCollections.length; cIdx++) {
    const collection = filteredCollections[cIdx];
    let remainingBlocks = [...collection.blocks];

    // If an intentional empty page exists
    if (remainingBlocks.length === 0) {
      pageModels.push({
        pageNumber: pageModels.length + 1,
        blocks: [],
        contentHtml: '',
        availableHeightPx,
        usedHeightPx: 0,
      });
      continue;
    }

    let currentPageBlocks: ContentBlock[] = [];
    let currentUsedHeight = 0;

    while (remainingBlocks.length > 0) {
      const block = remainingBlocks.shift()!;

      // Check if block fits in current page
      if (currentUsedHeight + block.estimatedHeightPx <= availableHeightPx) {
        currentPageBlocks.push(block);
        currentUsedHeight += block.estimatedHeightPx;
      } else {
        // Block does NOT fit in remaining space
        const spaceLeft = availableHeightPx - currentUsedHeight;

        // If it's a long paragraph that can be cleanly split
        if (block.canSplit && block.type === 'paragraph' && spaceLeft > 60) {
          const split = splitParagraphBlock(block, spaceLeft, contentWidthPx, typography);
          if (split) {
            currentPageBlocks.push(split[0]);
            currentUsedHeight += split[0].estimatedHeightPx;

            // Commit current page model
            pageModels.push({
              pageNumber: pageModels.length + 1,
              blocks: currentPageBlocks,
              contentHtml: currentPageBlocks.map((b) => b.html).join('\n'),
              availableHeightPx,
              usedHeightPx: currentUsedHeight,
            });

            // Start new page with second part
            currentPageBlocks = [];
            currentUsedHeight = 0;
            remainingBlocks.unshift(split[1]);
            continue;
          }
        }

        // If current page already has content, move entire block to next page!
        if (currentPageBlocks.length > 0) {
          pageModels.push({
            pageNumber: pageModels.length + 1,
            blocks: currentPageBlocks,
            contentHtml: currentPageBlocks.map((b) => b.html).join('\n'),
            availableHeightPx,
            usedHeightPx: currentUsedHeight,
          });

          currentPageBlocks = [];
          currentUsedHeight = 0;
          remainingBlocks.unshift(block);
        } else {
          // Block is larger than an entire empty page!
          // Put it on its own page to avoid infinite loop
          currentPageBlocks.push(block);
          currentUsedHeight = block.estimatedHeightPx;

          pageModels.push({
            pageNumber: pageModels.length + 1,
            blocks: currentPageBlocks,
            contentHtml: currentPageBlocks.map((b) => b.html).join('\n'),
            availableHeightPx,
            usedHeightPx: currentUsedHeight,
          });

          currentPageBlocks = [];
          currentUsedHeight = 0;
        }
      }
    }

    // Flush any remaining blocks in this collection
    if (currentPageBlocks.length > 0) {
      pageModels.push({
        pageNumber: pageModels.length + 1,
        blocks: currentPageBlocks,
        contentHtml: currentPageBlocks.map((b) => b.html).join('\n'),
        availableHeightPx,
        usedHeightPx: currentUsedHeight,
      });
    }
  }

  // Renumber page models sequentially 1..N
  pageModels.forEach((p, idx) => {
    p.pageNumber = idx + 1;
  });

  return {
    geometry,
    pages: pageModels,
    totalEstimatedPages: pageModels.length,
    hasStrippedPlaceholders,
  };
}
