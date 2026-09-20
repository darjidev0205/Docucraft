'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TEMPLATES, autoFormatPlainText, TemplateDefinition } from '@docucraft/shared';
import { useAuth } from '../../stores/auth-context';
import { useUI } from '../../stores/ui-context';
import { apiClient } from '../../lib/api-client';
import { DocuCraftLogo } from '../../components/brand/DocuCraftLogo';
import { DocumentPreview } from '../../components/preview/DocumentPreview';
import {
  ArrowRight,
  ChevronLeft,
  RotateCcw,
  Check,
  Type,
  FileText,
} from 'lucide-react';

const SAMPLE_TEXT = `Annual Business Performance Report

Our organization achieved significant operational expansion and sustained market growth throughout this fiscal year.
Total annualized revenue increased by 35% compared to the prior year.

Key Achievements & Milestones:
• Increased enterprise customer satisfaction to an all-time high of 94%
• Expanded engineering, design, and client success teams across three continents
• Entered three new European tier-1 metropolitan markets
• Reduced processing latency by 65% via modern cloud infrastructure

Strategic Priorities for 2027:
1. Accelerate investment into automated document publishing workflows
2. Deepen enterprise platform compliance and SOC2 data governance
3. Expand strategic partner distribution channels globally`;

export default function CreateDocumentPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-paper-sand flex items-center justify-center text-xs text-ink-500 font-sans">
          Loading publishing setup...
        </div>
      }
    >
      <CreateDocumentContent />
    </React.Suspense>
  );
}

function CreateDocumentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateQuery = searchParams.get('template');

  const { user } = useAuth();

  const { addToast } = useUI();

  const [title, setTitle] = useState('Annual Business Performance Report');
  const [content, setContent] = useState(SAMPLE_TEXT);
  const [selectedTemplateId, setSelectedTemplateId] = useState('professional-business');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (templateQuery && TEMPLATES.some((t) => t.id === templateQuery)) {
      setSelectedTemplateId(templateQuery);
    }
  }, [templateQuery]);

  const selectedTemplate = TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];

  const handleClear = () => {
    setTitle('');
    setContent('');
  };

  const handleSample = () => {
    setTitle('Annual Business Performance Report');
    setContent(SAMPLE_TEXT);
  };

  const handleContinue = async () => {
    if (!content.trim()) {
      addToast('Please enter or paste some content first.', 'error');
      return;
    }

    setLoading(true);
    const docId = `doc_${Date.now()}`;

    try {
      const formattedHtml = autoFormatPlainText(content, title);
      const initialPages = [
        {
          id: 'page-1',
          pageNumber: 1,
          contentHtml: formattedHtml,
        },
      ];

      if (user) {
        const created = await apiClient.post<any>('/documents', {
          title: title.trim() || 'Untitled Document',
          templateId: selectedTemplate.id,
          settings: selectedTemplate.defaultSettings,
          initialContent: content,
        });
        router.push(`/editor/${created.id}`);
        return;
      }

      // Anonymous user: local draft preserved in localStorage
      const localDoc = {
        id: docId,
        userId: 'anonymous',
        title: title.trim() || 'Untitled Document',
        templateId: selectedTemplate.id,
        settings: selectedTemplate.defaultSettings,
        pages: initialPages,
        version: 1,
        isFavorite: false,
        isTrash: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(`docucraft_draft_${docId}`, JSON.stringify(localDoc));
      router.push(`/editor/${docId}`);
    } catch (err: any) {
      console.error('Failed to create document:', err);
      addToast('Failed to create document. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-sand text-ink-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="h-16 border-b border-paper-border bg-white px-6 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <DocuCraftLogo size="sm" />
        </Link>
        <Link
          href={user ? '/dashboard' : '/'}
          className="flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-900 transition-colors"
        >
          <ChevronLeft size={14} />
          <span>{user ? 'Back to Dashboard' : 'Back to Home'}</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10">
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper-card border border-paper-border text-ink-700 text-[11px] font-bold uppercase tracking-wider mb-2">
            <span>Publishing Setup</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 mb-2">
            Prepare Your Document
          </h1>
          <p className="text-sm text-ink-500">
            Paste plain text or notes, select an architectural template, and continue to the visual canvas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Title & Text Content */}
          <div className="lg:col-span-7 bg-white rounded-lg border border-paper-border p-6 shadow-paper space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-500 mb-1.5">
                Document Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Strategic Performance Briefing"
                className="w-full px-3.5 py-2.5 rounded-md border border-paper-border bg-paper-warm font-semibold text-sm text-ink-900 focus:outline-none focus:border-brand-orange focus:bg-white transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-500">
                  Plain Text Content
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleSample}
                    className="text-brand-orange font-semibold hover:underline"
                  >
                    Fill Sample Notes
                  </button>
                  <span className="text-paper-border">|</span>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-ink-400 hover:text-ink-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <textarea
                rows={15}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste or write your notes, report, proposal, resume, or announcement here..."
                className="w-full p-4 rounded-md border border-paper-border bg-paper-warm text-ink-900 text-sm leading-relaxed focus:outline-none focus:border-brand-orange focus:bg-white font-mono text-xs transition-all resize-none"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-paper-border">
              <span className="text-xs text-ink-400">
                Text structure, headings, lists, and quotes will be auto-formatted on canvas.
              </span>
              <button
                type="button"
                onClick={handleContinue}
                disabled={loading}
                className="group w-full sm:w-auto px-6 py-2.5 rounded-md bg-ink-900 hover:bg-ink-800 text-white font-semibold text-xs shadow-paper hover:shadow-dock transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Open in Canvas Editor</span>
                <ArrowRight size={13} className="text-brand-orange transition-transform duration-200 ease-out group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right Column: Template Selection with Miniature Previews */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-ink-900">Choose Template</h3>
              <Link
                href="/templates"
                className="text-xs text-brand-orange font-semibold hover:underline"
              >
                Catalog specs
              </Link>
            </div>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplateId === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center gap-4 ${
                      isSelected
                        ? 'bg-paper-pure border-brand-orange shadow-paper ring-1 ring-brand-orange'
                        : 'bg-white border-paper-border hover:border-paper-border-strong hover:bg-paper-warm'
                    }`}
                  >
                    {/* Small Sheet Thumbnail */}
                    <div className="w-16 h-22 shrink-0 border border-paper-border bg-paper-card overflow-hidden rounded-xs flex items-center justify-center">
                      <div className="w-full pointer-events-none scale-90">
                        <DocumentPreview template={tmpl} mode="thumbnail" shadow={false} hoverLift={false} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-xs text-ink-900 truncate">{tmpl.name}</h4>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 bg-paper-card text-ink-500 font-semibold rounded">
                          {tmpl.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-500 line-clamp-2 leading-relaxed">
                        {tmpl.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-ink-400 font-mono">
                        <span>{tmpl.defaultSettings.typography.headingFont.split(',')[0]}</span>
                        <span>•</span>
                        <span>{tmpl.defaultSettings.pageSize}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-brand-orange text-white flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
