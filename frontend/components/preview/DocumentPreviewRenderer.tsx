'use client';

import React, { useMemo } from 'react';
import { DocumentModel, calculatePageGeometry, paginateDocument, PageModel } from '@docucraft/shared';

interface DocumentPreviewRendererProps {
  document: DocumentModel;
  scale?: number;
  className?: string;
  showPageShadow?: boolean;
}

export function DocumentPreviewRenderer({
  document,
  scale = 1,
  className = '',
  showPageShadow = true,
}: DocumentPreviewRendererProps) {
  const { settings, title } = document;
  const { colors, typography, header, footer } = settings;

  // Single source of truth: shared pagination engine & geometry calculation
  const { geometry, pages } = useMemo(() => {
    return paginateDocument(document);
  }, [document]);

  // Header alignment style
  let headerJustify = 'justify-start';
  if (header.align === 'center') headerJustify = 'justify-center';
  if (header.align === 'right') headerJustify = 'justify-end';
  if (header.align === 'split') headerJustify = 'justify-between';

  // Footer alignment style
  let footerJustify = 'justify-start';
  if (footer.align === 'center') footerJustify = 'justify-center';
  if (footer.align === 'right') footerJustify = 'justify-end';
  if (footer.align === 'split') footerJustify = 'justify-between';

  const totalPages = pages.length;

  return (
    <div
      className={`flex flex-col items-center gap-8 ${className}`}
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
      }}
    >
      {pages.map((pageModel: PageModel) => {
        const pageNum = pageModel.pageNumber;
        let pageNumberText = `Page ${pageNum} of ${totalPages}`;
        if (footer.pageNumberFormat === 'PAGE_ONLY') {
          pageNumberText = `Page ${pageNum}`;
        } else if (footer.pageNumberFormat === 'NUMBER_ONLY') {
          pageNumberText = `${pageNum}`;
        }

        return (
          <div
            key={`preview-page-${pageNum}`}
            className={`relative bg-white text-brand-charcoal transition-all box-border overflow-hidden select-text ${
              showPageShadow ? 'shadow-page border border-slate-200/80 rounded-sm' : ''
            }`}
            style={{
              width: `${geometry.pageWidthMm}mm`,
              height: `${geometry.pageHeightMm}mm`,
              minWidth: `${geometry.pageWidthMm}mm`,
              maxWidth: `${geometry.pageWidthMm}mm`,
              minHeight: `${geometry.pageHeightMm}mm`,
              maxHeight: `${geometry.pageHeightMm}mm`,
              backgroundColor: colors.background || '#FFFFFF',
              color: colors.text || '#1E1E24',
              fontFamily: typography.bodyFont,
              fontSize: `${typography.baseFontSize}pt`,
              lineHeight: typography.lineHeight,
            }}
          >
            {/* Header (anchored at physical top margin) */}
            {header.enabled && (
              <header
                className={`absolute flex items-center ${headerJustify} text-[8.5pt] uppercase tracking-wider text-slate-500 z-10 box-border`}
                style={{
                  top: `${geometry.headerTopMm}mm`,
                  left: `${geometry.marginLeftMm}mm`,
                  width: `${geometry.contentWidthMm}mm`,
                  height: `${geometry.headerHeightMm}mm`,
                  borderBottom: header.borderBottom ? `1px solid ${colors.secondary || '#E2E8F0'}` : 'none',
                  color: colors.secondary || '#64748B',
                }}
              >
                {header.logoUrl && (
                  <img
                    src={header.logoUrl}
                    alt="Logo"
                    className="max-h-5 mr-3 object-contain inline-block"
                  />
                )}
                {header.companyName && (
                  <span className="font-bold mr-3" style={{ color: colors.primary }}>
                    {header.companyName}
                  </span>
                )}
                {header.documentTitle && <span>{header.documentTitle}</span>}
                {header.customText && <span className="ml-auto">{header.customText}</span>}
              </header>
            )}

            {/* Content Body (bounded to availableContentHeight) */}
            <main
              className="absolute box-border overflow-hidden"
              style={{
                top: `${geometry.contentTopMm}mm`,
                left: `${geometry.marginLeftMm}mm`,
                width: `${geometry.contentWidthMm}mm`,
                height: `${geometry.contentHeightMm}mm`,
                maxHeight: `${geometry.contentHeightMm}mm`,
                fontFamily: typography.bodyFont,
                color: colors.text || '#1E1E24',
              }}
              dangerouslySetInnerHTML={{ __html: pageModel.contentHtml }}
            />

            {/* Footer (anchored at deterministic physical bottom: pageHeight - bottomMargin - footerHeight) */}
            {footer.enabled && (
              <footer
                className={`absolute flex items-center ${footerJustify} text-[8.5pt] text-slate-500 z-10 box-border`}
                style={{
                  top: `${geometry.footerTopMm}mm`,
                  left: `${geometry.marginLeftMm}mm`,
                  width: `${geometry.contentWidthMm}mm`,
                  height: `${geometry.footerHeightMm}mm`,
                  borderTop: footer.borderTop ? `1px solid ${colors.secondary || '#E2E8F0'}` : 'none',
                }}
              >
                {footer.customText && <span>{footer.customText}</span>}
                {footer.website && <span className="ml-3">{footer.website}</span>}
                {footer.email && <span className="ml-3">{footer.email}</span>}
                {footer.showPageNumbers && (
                  <span className="font-semibold ml-auto" style={{ color: colors.primary }}>
                    {pageNumberText}
                  </span>
                )}
              </footer>
            )}
          </div>
        );
      })}
    </div>
  );
}
