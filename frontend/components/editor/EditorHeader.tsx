'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDocument } from '../../stores/document-context';
import { useAuth } from '../../stores/auth-context';
import { DocuCraftIcon } from '../brand/DocuCraftLogo';
import {
  FileText,
  Eye,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ChevronLeft,
} from 'lucide-react';

interface EditorHeaderProps {
  onTogglePreview: () => void;
}

export function EditorHeader({ onTogglePreview }: EditorHeaderProps) {
  const { document: doc, updateTitle, saveStatus, downloadPdf, isGeneratingPdf } = useDocument();
  const { user } = useAuth();
  const [editingTitle, setEditingTitle] = useState(false);

  if (!doc) return null;

  return (
    <header className="h-14 bg-white border-b border-paper-border px-4 flex items-center justify-between no-print select-none shrink-0 z-40">
      {/* Left Area: Logo, Back button & Title */}
      <div className="flex items-center gap-3">
        <Link
          href={user ? '/dashboard' : '/'}
          className="p-1.5 rounded hover:bg-paper-card text-ink-500 hover:text-ink-900 transition-colors flex items-center gap-1.5 text-xs font-medium"
        >
          <DocuCraftIcon size={18} />
          <ChevronLeft size={14} className="text-ink-400" />
          <span className="hidden sm:inline">{user ? 'Dashboard' : 'Home'}</span>
        </Link>

        <div className="h-4 w-px bg-paper-border" />

        {/* Editable Document Title */}
        <div className="flex items-center gap-2">
          {editingTitle ? (
            <input
              type="text"
              autoFocus
              value={doc.title}
              onChange={(e) => updateTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setEditingTitle(false);
              }}
              className="text-xs font-bold text-ink-900 px-2 py-0.5 rounded border border-brand-orange bg-paper-warm focus:outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              className="text-xs font-bold text-ink-900 hover:text-brand-orange transition-colors max-w-xs md:max-w-md truncate text-left"
              title="Click to rename"
            >
              {doc.title || 'Untitled Document'}
            </button>
          )}
        </div>

        {/* Save Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 pl-2 text-xs">
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-emerald-600 text-[11px] font-medium">
              <CheckCircle2 size={12} />
              <span>Saved</span>
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1 text-ink-400 text-[11px] font-medium animate-pulse">
              <Loader2 size={12} className="animate-spin text-brand-orange" />
              <span>Saving...</span>
            </span>
          )}
          {saveStatus === 'unsaved' && (
            <span className="flex items-center gap-1 text-amber-600 text-[11px] font-medium">
              <Clock size={12} />
              <span>Unsaved</span>
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1 text-red-600 text-[11px] font-medium">
              <AlertCircle size={12} />
              <span>Save error</span>
            </span>
          )}
        </div>
      </div>

      {/* Right Area: Preview, Print, and Download PDF */}
      <div className="flex items-center gap-2">
        {/* Preview Button */}
        <button
          type="button"
          onClick={onTogglePreview}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-paper-border bg-white hover:bg-paper-card text-xs font-medium text-ink-700 transition-all shadow-subtle"
        >
          <Eye size={13} className="text-ink-400" />
          <span className="hidden sm:inline">Preview</span>
        </button>

        {/* Browser Print Button */}
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-paper-border bg-white hover:bg-paper-card text-xs font-medium text-ink-700 transition-all shadow-subtle"
        >
          <Printer size={13} className="text-ink-400" />
          <span className="hidden sm:inline">Print</span>
        </button>

        {/* Primary Protected Download PDF Button */}
        <button
          type="button"
          onClick={downloadPdf}
          disabled={isGeneratingPdf}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-ink-900 hover:bg-ink-800 text-white text-xs font-semibold shadow-paper transition-all disabled:opacity-50"
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
      </div>
    </header>
  );
}
