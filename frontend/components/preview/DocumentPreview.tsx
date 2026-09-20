'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  DocumentModel,
  TemplateDefinition,
  calculatePageGeometry,
  paginateDocument,
  PageModel,
} from '@docucraft/shared';

export interface DocumentPreviewProps {
  document?: DocumentModel;
  template?: TemplateDefinition;
  mode?: 'thumbnail' | 'full';
  pageIndex?: number;
  scale?: number;
  className?: string;
  shadow?: boolean;
  hoverLift?: boolean;
  onClick?: () => void;
}

export function DocumentPreview({
  document,
  template,
  mode = 'thumbnail',
  pageIndex = 0,
  scale: forcedScale,
  className = '',
  shadow = true,
  hoverLift = true,
  onClick,
}: DocumentPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [computedScale, setComputedScale] = useState(0.35);

  // Normalize document model from either document or template
  const docModel: DocumentModel = useMemo(() => {
    if (document) return document;
    if (template) {
      return {
        id: `tpl-${template.id}`,
        userId: 'preview',
        title: template.sampleContent?.title || template.name,
        templateId: template.id,
        settings: template.defaultSettings,
        pages: template.sampleContent.pages.map((p, i) => ({
          id: `p-${i}`,
          pageNumber: i + 1,
          contentHtml: p.contentHtml,
        })),
        version: 1,
        isFavorite: false,
        isTrash: false,
        createdAt: '',
        updatedAt: '',
      };
    }
    throw new Error('DocumentPreview requires either document or template prop');
  }, [document, template]);

  // Execute pagination & geometry calculation
  const { geometry, pages } = useMemo(() => {
    return paginateDocument(docModel);
  }, [docModel]);

  const targetPage: PageModel = pages[pageIndex] || pages[0] || {
    pageNumber: 1,
    blocks: [],
    contentHtml: '',
    availableHeightPx: geometry.contentHeightPx,
    usedHeightPx: 0,
  };

  // Dynamic responsive scale calculation for thumbnail mode
  useEffect(() => {
    if (forcedScale) {
      setComputedScale(forcedScale);
      return;
    }

    if (mode === 'thumbnail' && containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const containerWidth = entry.contentRect.width;
          if (containerWidth > 0) {
            // geometry.pageWidthPx is ~794px for A4
            const scaleFactor = containerWidth / geometry.pageWidthPx;
            setComputedScale(scaleFactor);
          }
        }
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [mode, forcedScale, geometry.pageWidthPx]);

  const effectiveScale = forcedScale ?? computedScale;

  const { colors, typography, header, footer } = docModel.settings;

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

  let pageNumberText = `Page ${targetPage.pageNumber} of ${pages.length}`;
  if (footer.pageNumberFormat === 'PAGE_ONLY') {
    pageNumberText = `Page ${targetPage.pageNumber}`;
  } else if (footer.pageNumberFormat === 'NUMBER_ONLY') {
    pageNumberText = `${targetPage.pageNumber}`;
  }

  // Calculate container aspect ratio height
  const aspectRatio = geometry.pageHeightMm / geometry.pageWidthMm;

  if (mode === 'thumbnail') {
    return (
      <div
        ref={containerRef}
        onClick={onClick}
        className={`relative w-full overflow-hidden select-none bg-paper-sand border border-paper-border transition-all duration-300 ${
          hoverLift ? 'hover:-translate-y-1 hover:shadow-paper-lg hover:border-brand-orange/40' : ''
        } ${shadow ? 'shadow-paper' : ''} ${className}`}
        style={{
          paddingBottom: `${aspectRatio * 100}%`,
          cursor: onClick ? 'pointer' : 'default',
        }}
      >
        {/* Scaled physical sheet */}
        <div
          className="absolute top-0 left-0 origin-top-left bg-white pointer-events-none box-border overflow-hidden"
          style={{
            width: `${geometry.pageWidthMm}mm`,
            height: `${geometry.pageHeightMm}mm`,
            transform: `scale(${effectiveScale})`,
            backgroundColor: colors.background || '#FFFFFF',
            color: colors.text || '#17181C',
            fontFamily: typography.bodyFont,
            fontSize: `${typography.baseFontSize}pt`,
            lineHeight: typography.lineHeight,
          }}
        >
          {/* Header */}
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
                <img src={header.logoUrl} alt="Logo" className="max-h-5 mr-3 object-contain inline-block" />
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

          {/* Content Area bounded to availableContentHeight */}
          <main
            className="absolute box-border overflow-hidden"
            style={{
              top: `${geometry.contentTopMm}mm`,
              left: `${geometry.marginLeftMm}mm`,
              width: `${geometry.contentWidthMm}mm`,
              height: `${geometry.contentHeightMm}mm`,
              maxHeight: `${geometry.contentHeightMm}mm`,
              fontFamily: typography.bodyFont,
              color: colors.text || '#17181C',
            }}
            dangerouslySetInnerHTML={{ __html: targetPage.contentHtml }}
          />

          {/* Footer physically anchored at bottom */}
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
      </div>
    );
  }

  // Full mode (e.g. Editor / Preview Modal)
  return (
    <div
      onClick={onClick}
      className={`relative bg-white text-ink-900 box-border overflow-hidden transition-all select-text ${
        shadow ? 'shadow-paper border border-paper-border' : ''
      } ${className}`}
      style={{
        width: `${geometry.pageWidthMm}mm`,
        height: `${geometry.pageHeightMm}mm`,
        minWidth: `${geometry.pageWidthMm}mm`,
        maxWidth: `${geometry.pageWidthMm}mm`,
        minHeight: `${geometry.pageHeightMm}mm`,
        maxHeight: `${geometry.pageHeightMm}mm`,
        backgroundColor: colors.background || '#FFFFFF',
        color: colors.text || '#17181C',
        fontFamily: typography.bodyFont,
        fontSize: `${typography.baseFontSize}pt`,
        lineHeight: typography.lineHeight,
      }}
    >
      {/* Header */}
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
            <img src={header.logoUrl} alt="Logo" className="max-h-5 mr-3 object-contain inline-block" />
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

      {/* Content */}
      <main
        className="absolute box-border overflow-hidden"
        style={{
          top: `${geometry.contentTopMm}mm`,
          left: `${geometry.marginLeftMm}mm`,
          width: `${geometry.contentWidthMm}mm`,
          height: `${geometry.contentHeightMm}mm`,
          maxHeight: `${geometry.contentHeightMm}mm`,
          fontFamily: typography.bodyFont,
          color: colors.text || '#17181C',
        }}
        dangerouslySetInnerHTML={{ __html: targetPage.contentHtml }}
      />

      {/* Footer */}
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
}
