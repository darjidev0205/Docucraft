import { Margins, PageSize } from '../types';

export const BRAND_COLORS = {
  CREAM: '#FFEDB9',
  GOLDEN_YELLOW: '#FFCB56',
  WARM_ORANGE: '#FFA259',
  CORAL: '#FF7E7E',
  DARK_CHARCOAL: '#1E1E24',
  MUTED_TEXT: '#64748B',
  BORDER_NEUTRAL: '#E2E8F0',
  BACKGROUND_SOFT: '#FFFDF7',
  WHITE: '#FFFFFF',
} as const;

export const PAPER_DIMENSIONS: Record<PageSize, { widthMm: number; heightMm: number; widthPx: number; heightPx: number }> = {
  A4: { widthMm: 210, heightMm: 297, widthPx: 794, heightPx: 1123 }, // at 96 DPI
  A5: { widthMm: 148, heightMm: 210, widthPx: 559, heightPx: 794 },
  Letter: { widthMm: 215.9, heightMm: 279.4, widthPx: 816, heightPx: 1056 },
};

export const MARGIN_PRESETS: Record<string, Margins> = {
  normal: { top: 20, right: 20, bottom: 20, left: 20 }, // 20mm
  narrow: { top: 12, right: 12, bottom: 12, left: 12 }, // 12mm
  wide: { top: 28, right: 28, bottom: 28, left: 28 },   // 28mm
  custom: { top: 20, right: 20, bottom: 20, left: 20 },
};

export const AVAILABLE_FONTS = [
  { name: 'Inter (Clean Sans)', value: 'Inter, system-ui, sans-serif' },
  { name: 'Merriweather (Classic Serif)', value: 'Merriweather, Georgia, serif' },
  { name: 'Outfit (Modern Display)', value: 'Outfit, sans-serif' },
  { name: 'Roboto (Standard Sans)', value: 'Roboto, sans-serif' },
  { name: 'Playfair Display (Editorial)', value: '"Playfair Display", Georgia, serif' },
  { name: 'JetBrains Mono (Technical)', value: '"JetBrains Mono", monospace' },
];

export const PX_PER_MM = 96 / 25.4; // 3.779527559 px per mm at 96 DPI

export interface PageGeometry {
  pageSize: PageSize;
  orientation: 'portrait' | 'landscape';
  pageWidthMm: number;
  pageHeightMm: number;
  pageWidthPx: number;
  pageHeightPx: number;
  marginTopMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  marginRightMm: number;
  headerHeightMm: number;
  headerTopMm: number;
  footerHeightMm: number;
  footerTopMm: number;
  contentTopMm: number;
  contentHeightMm: number;
  contentWidthMm: number;
  contentHeightPx: number;
  contentWidthPx: number;
  pxPerMm: number;
}

export function calculatePageGeometry(settings: {
  pageSize: PageSize;
  orientation: 'portrait' | 'landscape';
  margins: Margins;
  header: { enabled: boolean };
  footer: { enabled: boolean };
}): PageGeometry {
  const paper = PAPER_DIMENSIONS[settings.pageSize] || PAPER_DIMENSIONS.A4;
  const isLandscape = settings.orientation === 'landscape';

  const pageWidthMm = isLandscape ? paper.heightMm : paper.widthMm;
  const pageHeightMm = isLandscape ? paper.widthMm : paper.heightMm;

  const marginTopMm = settings.margins.top;
  const marginBottomMm = settings.margins.bottom;
  const marginLeftMm = settings.margins.left;
  const marginRightMm = settings.margins.right;

  // Header and Footer reserved physical heights
  const headerHeightMm = settings.header.enabled ? 14 : 0;
  const footerHeightMm = settings.footer.enabled ? 14 : 0;

  const headerTopMm = marginTopMm;
  const contentTopMm = marginTopMm + headerHeightMm;
  const footerTopMm = pageHeightMm - marginBottomMm - footerHeightMm;

  const contentHeightMm = pageHeightMm - marginTopMm - marginBottomMm - headerHeightMm - footerHeightMm;
  const contentWidthMm = pageWidthMm - marginLeftMm - marginRightMm;

  return {
    pageSize: settings.pageSize,
    orientation: settings.orientation,
    pageWidthMm,
    pageHeightMm,
    pageWidthPx: Math.round(pageWidthMm * PX_PER_MM),
    pageHeightPx: Math.round(pageHeightMm * PX_PER_MM),
    marginTopMm,
    marginBottomMm,
    marginLeftMm,
    marginRightMm,
    headerHeightMm,
    headerTopMm,
    footerHeightMm,
    footerTopMm,
    contentTopMm,
    contentHeightMm,
    contentWidthMm,
    contentHeightPx: Math.round(contentHeightMm * PX_PER_MM),
    contentWidthPx: Math.round(contentWidthMm * PX_PER_MM),
    pxPerMm: PX_PER_MM,
  };
}

