'use client';

import React from 'react';
import { useDocument } from '../../stores/document-context';
import { Plus, Copy, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

export function PageManager() {
  const {
    document: doc,
    activePageIndex,
    setActivePageIndex,
    addPage,
    duplicatePage,
    deletePage,
    reorderPages,
  } = useDocument();

  if (!doc) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-brand-border">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">Pages</h3>
          <p className="text-[11px] text-brand-muted">
            {doc.pages.length} {doc.pages.length === 1 ? 'page' : 'pages'} total
          </p>
        </div>
        <button
          type="button"
          onClick={addPage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-orange text-white text-xs font-semibold hover:opacity-95 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Page</span>
        </button>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {doc.pages.map((page, index) => {
          const isActive = index === activePageIndex;
          return (
            <div
              key={page.id}
              onClick={() => setActivePageIndex(index)}
              className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-surface border-brand-orange shadow-sm ring-1 ring-brand-orange/50'
                  : 'bg-white border-brand-border hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-brand-charcoal flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-700">
                    {index + 1}
                  </span>
                  Page {index + 1}
                </span>

                {/* Quick actions on hover */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        reorderPages(index, index - 1);
                      }}
                      className="p-1 rounded hover:bg-slate-100 text-slate-500"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {index < doc.pages.length - 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        reorderPages(index, index + 1);
                      }}
                      className="p-1 rounded hover:bg-slate-100 text-slate-500"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicatePage(index);
                    }}
                    className="p-1 rounded hover:bg-slate-100 text-slate-500"
                    title="Duplicate Page"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {doc.pages.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePage(index);
                      }}
                      className="p-1 rounded hover:bg-red-50 text-red-500"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Page Content Snippet preview */}
              <div className="h-14 overflow-hidden rounded bg-slate-50 p-2 text-[10px] text-slate-500 border border-slate-100 leading-tight">
                <div
                  className="scale-75 origin-top-left pointer-events-none line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: page.contentHtml }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
