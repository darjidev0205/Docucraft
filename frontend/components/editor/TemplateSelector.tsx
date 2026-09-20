'use client';

import React, { useState } from 'react';
import { TEMPLATES } from '@docucraft/shared';
import { useDocument } from '../../stores/document-context';
import { Check } from 'lucide-react';

export function TemplateSelector() {
  const { document: doc, switchTemplate } = useDocument();
  const [selectedCategory, setSelectedCategory] = useState('All');

  if (!doc) return null;

  const categories = ['All', 'Business', 'Marketing', 'Resume', 'Academic', 'Certificate', 'Report', 'Creative', 'Minimal'];

  const filtered = selectedCategory === 'All'
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="flex flex-col h-full font-sans">
      <div className="p-4 border-b border-paper-border">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-2">Templates</h3>
        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-ink-900 text-white font-semibold'
                  : 'bg-paper-card text-ink-600 hover:bg-paper-border/60 hover:text-ink-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.map((tmpl) => {
          const isSelected = doc.templateId === tmpl.id;
          return (
            <div
              key={tmpl.id}
              onClick={() => switchTemplate(tmpl.id)}
              className={`p-3 rounded-md border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-paper-pure border-brand-orange ring-1 ring-brand-orange shadow-subtle'
                  : 'bg-white border-paper-border hover:border-paper-border-strong hover:bg-paper-warm'
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h4 className="text-xs font-bold text-ink-900 flex items-center gap-1.5">
                    {tmpl.name}
                    {tmpl.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-cream text-ink-900 font-semibold uppercase">
                        {tmpl.badge}
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-ink-500 line-clamp-2 mt-0.5 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>
                {isSelected && (
                  <span className="p-0.5 rounded-full bg-brand-orange text-white shrink-0 ml-1">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </div>

              {/* Color accents preview */}
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-paper-border text-[10px] text-ink-400">
                <span className="font-medium">Palette:</span>
                <span
                  className="w-3 h-3 rounded-full border border-paper-border"
                  style={{ backgroundColor: tmpl.defaultSettings.colors.primary }}
                  title="Primary"
                />
                <span
                  className="w-3 h-3 rounded-full border border-paper-border"
                  style={{ backgroundColor: tmpl.defaultSettings.colors.secondary }}
                  title="Secondary"
                />
                <span
                  className="w-3 h-3 rounded-full border border-paper-border"
                  style={{ backgroundColor: tmpl.defaultSettings.colors.accent }}
                  title="Accent"
                />
                <span className="ml-auto font-mono">
                  {tmpl.defaultSettings.pageSize} • {tmpl.defaultSettings.orientation}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
