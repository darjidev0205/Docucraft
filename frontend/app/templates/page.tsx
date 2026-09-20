'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TEMPLATES } from '@docucraft/shared';
import { useAuth } from '../../stores/auth-context';
import { DocuCraftLogo } from '../../components/brand/DocuCraftLogo';
import { DocumentPreview } from '../../components/preview/DocumentPreview';
import { EditorialAnnotation } from '../../components/ui/HandDrawnLine';
import { ArrowRight, ChevronLeft, Type, Sliders } from 'lucide-react';

export default function TemplatesPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Business', 'Academic', 'Marketing', 'Resume', 'Certificate', 'Report', 'Creative', 'Minimal'];

  const filtered = selectedCategory === 'All'
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-paper-sand text-ink-900 flex flex-col font-sans selection:bg-brand-cream selection:text-ink-900">
      {/* Navigation */}
      <header className="h-16 bg-white border-b border-paper-border px-6 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <DocuCraftLogo size="sm" />
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={user ? '/dashboard' : '/'}
            className="flex items-center gap-1 text-xs font-semibold text-ink-500 hover:text-ink-900 transition-colors"
          >
            <ChevronLeft size={14} />
            <span>{user ? 'Dashboard' : 'Home'}</span>
          </Link>

          <Link
            href="/create"
            className="group px-3.5 py-1.5 rounded-md bg-ink-900 hover:bg-ink-800 text-white text-xs font-semibold transition-all duration-200 ease-out shadow-subtle hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
          >
            <span>Create Document</span>
            <ArrowRight size={12} className="text-brand-orange transition-transform duration-200 ease-out group-hover:translate-x-1" />
          </Link>
        </div>
      </header>

      {/* Main Showcase */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper-card border border-paper-border text-ink-700 text-[11px] font-semibold uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
            <span>Architectural Library</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-ink-900 mb-2">
            Document Templates Catalog
          </h1>
          <p className="text-sm text-ink-500 max-w-lg mx-auto leading-relaxed font-normal">
            10 distinct typographical systems engineered with authentic margins, headers, tables, and physical bottom-anchored footers.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded text-xs transition-all duration-150 ${
                selectedCategory === cat
                  ? 'bg-ink-900 text-white font-semibold shadow-subtle'
                  : 'bg-white border border-paper-border text-ink-600 hover:text-ink-900 hover:bg-paper-card font-medium'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid with Unified Card Hover Interactions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((tmpl) => (
            <div
              key={tmpl.id}
              className="group bg-white rounded-lg border border-paper-border hover:border-brand-orange/60 shadow-paper hover:shadow-paper-lg transition-all duration-200 ease-out hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden relative"
            >
              {/* Document Sheet Thumbnail with Gentle Zoom on Card Hover */}
              <div className="p-5 bg-paper-card border-b border-paper-border flex items-center justify-center relative overflow-hidden">
                <div className="w-full max-w-[260px] transition-transform duration-200 ease-out group-hover:scale-[1.018]">
                  <DocumentPreview template={tmpl} mode="thumbnail" shadow={true} hoverLift={false} />
                </div>
              </div>

              {/* Metadata */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-500 px-2 py-0.5 bg-paper-sand border border-paper-border rounded">
                      {tmpl.category}
                    </span>
                    {tmpl.badge && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-brand-orange bg-brand-cream/60 px-2 py-0.5 rounded">
                        {tmpl.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-ink-900 group-hover:text-brand-orange transition-colors">
                    {tmpl.name}
                  </h3>
                  <p className="text-xs text-ink-500 mt-1 leading-relaxed line-clamp-2 font-normal">
                    {tmpl.description}
                  </p>

                  {/* Typography & Geometry Specs */}
                  <div className="mt-4 pt-3 border-t border-paper-border grid grid-cols-2 gap-2 text-[10.5px] text-ink-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Type size={12} className="text-brand-orange shrink-0" />
                      <span className="truncate">{tmpl.defaultSettings.typography.headingFont.split(',')[0]}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sliders size={12} className="text-brand-orange shrink-0" />
                      <span>{tmpl.defaultSettings.pageSize} {tmpl.defaultSettings.orientation}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-paper-border">
                  <Link
                    href={`/create?template=${tmpl.id}`}
                    className="inline-flex items-center justify-between w-full text-xs font-semibold text-ink-900 group-hover:text-brand-orange transition-colors"
                  >
                    <span>Use This Template</span>
                    <ArrowRight size={13} className="text-brand-orange transition-transform duration-200 ease-out group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
