'use client';

import React, { useState } from 'react';
import { useDocument } from '../../stores/document-context';
import { DocumentPreviewRenderer } from './DocumentPreviewRenderer';
import { X, Download, ZoomIn, ZoomOut, RotateCcw, Loader2 } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewModal({ isOpen, onClose }: PreviewModalProps) {
  const { document: doc, downloadPdf, isGeneratingPdf } = useDocument();
  const [zoom, setZoom] = useState(0.85);

  if (!isOpen || !doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink-900/90 backdrop-blur-md animate-in fade-in duration-150">
      {/* Top Preview Controls Bar */}
      <div className="h-14 px-6 bg-ink-900 border-b border-ink-800 flex items-center justify-between text-white shrink-0 font-sans">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-sm text-white">Physical Document Preview</h3>
          <span className="text-xs text-ink-400">
            ({doc.pages.length} {doc.pages.length === 1 ? 'page' : 'pages'}) • {doc.settings.pageSize} ({doc.settings.orientation})
          </span>
        </div>

        {/* Zoom and Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-ink-800 rounded-md p-1 mr-2 text-xs border border-ink-700">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
              className="p-1 rounded hover:bg-ink-700 text-ink-300 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="px-2 font-mono text-[11px] text-ink-200">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
              className="p-1 rounded hover:bg-ink-700 text-ink-300 transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
            <button
              type="button"
              onClick={() => setZoom(0.85)}
              className="p-1 rounded hover:bg-ink-700 text-ink-400 hover:text-white transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw size={13} />
            </button>
          </div>

          <button
            type="button"
            onClick={downloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-white hover:bg-paper-card text-ink-900 text-xs font-semibold shadow-paper transition-all disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 size={13} className="animate-spin text-brand-orange" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download size={13} className="text-brand-orange" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-ink-800 text-ink-400 hover:text-white transition-colors ml-2"
            title="Close Preview"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Preview Viewport Canvas */}
      <div className="flex-1 overflow-auto p-8 flex justify-center items-start bg-ink-950/40">
        <DocumentPreviewRenderer document={doc} scale={zoom} />
      </div>
    </div>
  );
}
