'use client';

import React, { useState } from 'react';
import { PageManager } from './PageManager';
import { TemplateSelector } from './TemplateSelector';
import { DesignPanel } from './DesignPanel';
import { ImageManager } from './ImageManager';
import { Files, LayoutTemplate, Palette, Image as ImageIcon } from 'lucide-react';

type SidebarTab = 'pages' | 'templates' | 'design' | 'images';

export function EditorSidebar() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('pages');

  const tabs: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
    { id: 'pages', label: 'Pages', icon: <Files className="w-4 h-4" /> },
    { id: 'templates', label: 'Templates', icon: <LayoutTemplate className="w-4 h-4" /> },
    { id: 'design', label: 'Design', icon: <Palette className="w-4 h-4" /> },
    { id: 'images', label: 'Images', icon: <ImageIcon className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-80 h-full bg-white border-r border-brand-border flex flex-col shrink-0 no-print">
      {/* Sidebar Navigation Tabs */}
      <div className="flex border-b border-brand-border bg-brand-surface">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-2 flex flex-col items-center gap-1 text-[11px] font-semibold border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-brand-orange text-brand-charcoal bg-white'
                : 'border-transparent text-brand-muted hover:text-brand-charcoal hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panel Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'pages' && <PageManager />}
        {activeTab === 'templates' && <TemplateSelector />}
        {activeTab === 'design' && <DesignPanel />}
        {activeTab === 'images' && <ImageManager />}
      </div>
    </aside>
  );
}
