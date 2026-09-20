'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

import { useDocument } from '../../stores/document-context';
import { EditorToolbar } from './EditorToolbar';
import { PAPER_DIMENSIONS } from '@docucraft/shared';

export function EditorCanvas() {
  const { document: doc, activePageIndex, updatePageContent } = useDocument();

  if (!doc) return null;

  const { settings, pages } = doc;
  const { pageSize, orientation, margins, colors, typography, header, footer } = settings;

  const paper = PAPER_DIMENSIONS[pageSize] || PAPER_DIMENSIONS.A4;
  const isLandscape = orientation === 'landscape';
  const widthMm = isLandscape ? paper.heightMm : paper.widthMm;
  const minHeightMm = isLandscape ? paper.widthMm : paper.heightMm;

  const activePage = pages[activePageIndex] || pages[0];

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: activePage ? activePage.contentHtml : '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[400px]',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      updatePageContent(activePageIndex, html);
    },
  });

  // Whenever active page switches, load the corresponding page's HTML into TipTap
  useEffect(() => {
    if (editor && activePage) {
      const currentEditorHtml = editor.getHTML();
      if (currentEditorHtml !== activePage.contentHtml) {
        editor.commands.setContent(activePage.contentHtml, false);
      }
    }
  }, [activePageIndex, activePage, editor]);

  // Header alignment
  let headerJustify = 'justify-start';
  if (header.align === 'center') headerJustify = 'justify-center';
  if (header.align === 'right') headerJustify = 'justify-end';
  if (header.align === 'split') headerJustify = 'justify-between';

  // Footer alignment
  let footerJustify = 'justify-start';
  if (footer.align === 'center') footerJustify = 'justify-center';
  if (footer.align === 'right') footerJustify = 'justify-end';
  if (footer.align === 'split') footerJustify = 'justify-between';

  const totalPages = pages.length;
  const pageNum = activePageIndex + 1;
  let pageNumberText = `Page ${pageNum} of ${totalPages}`;
  if (footer.pageNumberFormat === 'PAGE_ONLY') {
    pageNumberText = `Page ${pageNum}`;
  } else if (footer.pageNumberFormat === 'NUMBER_ONLY') {
    pageNumberText = `${pageNum}`;
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100/70">
      {/* Top Rich Text Formatting Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Neutral Workspace Canvas */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start">
        {/* Printable Paper Sheet */}
        <div
          className="relative bg-white text-brand-charcoal transition-all box-border shadow-page rounded-sm border border-slate-300/80 flex flex-col justify-between"
          style={{
            width: `${widthMm}mm`,
            minHeight: `${minHeightMm}mm`,
            paddingTop: `${margins.top}mm`,
            paddingRight: `${margins.right}mm`,
            paddingBottom: `${margins.bottom}mm`,
            paddingLeft: `${margins.left}mm`,
            backgroundColor: colors.background || '#FFFFFF',
            color: colors.text || '#1E1E24',
            fontFamily: typography.bodyFont,
            fontSize: `${typography.baseFontSize}pt`,
            lineHeight: typography.lineHeight,
          }}
        >
          {/* Header Preview / Boundary */}
          {header.enabled ? (
            <header
              className={`flex items-center ${headerJustify} pb-2 mb-4 text-[8.5pt] uppercase tracking-wider select-none`}
              style={{
                borderBottom: header.borderBottom ? `1px solid ${colors.secondary || '#E2E8F0'}` : 'none',
                color: colors.secondary || '#64748B',
              }}
            >
              {header.logoUrl && (
                <img
                  src={header.logoUrl}
                  alt="Logo"
                  className="max-h-6 mr-3 object-contain inline-block"
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
          ) : (
            <div className="h-2" />
          )}

          {/* TipTap Rich Text Area */}
          <div
            className="flex-1 w-full"
            style={{
              fontFamily: typography.bodyFont,
            }}
          >
            <EditorContent editor={editor} />
          </div>

          {/* Footer Preview / Boundary */}
          {footer.enabled ? (
            <footer
              className={`flex items-center ${footerJustify} pt-3 mt-6 text-[8.5pt] text-slate-500 select-none`}
              style={{
                borderTop: footer.borderTop ? `1px solid ${colors.secondary || '#E2E8F0'}` : 'none',
              }}
            >
              {footer.customText && <span>{footer.customText}</span>}
              {footer.website && <span className="mx-2">{footer.website}</span>}
              {footer.email && <span className="mx-2">{footer.email}</span>}
              {footer.showPageNumbers && (
                <span className="font-semibold ml-auto" style={{ color: colors.primary }}>
                  {pageNumberText}
                </span>
              )}
            </footer>
          ) : (
            <div className="h-2" />
          )}
        </div>
      </div>
    </div>
  );
}
