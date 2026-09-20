'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TEMPLATES, TemplateDefinition } from '@docucraft/shared';
import { useAuth } from '../stores/auth-context';
import { DocuCraftLogo } from '../components/brand/DocuCraftLogo';
import { DocumentPreview } from '../components/preview/DocumentPreview';
import {
  HandDrawnLine,
  EditorialAnnotation,
} from '../components/ui/HandDrawnLine';
import {
  FileText,
  ArrowRight,
  Check,
  Printer,
  ChevronRight,
  Layers,
  Layout,
  Type,
  Maximize2,
  Download,
  FolderOpen,
  Sliders,
  Table,
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Business', 'Academic', 'Minimal', 'Marketing', 'Resume'];

  const filteredTemplates = selectedCategory === 'All'
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category.toLowerCase() === selectedCategory.toLowerCase());

  const featuredTemplate = TEMPLATES[0]; // Professional Business

  const processSteps = [
    {
      step: '01',
      title: 'WRITE',
      subtitle: 'Paste or write your raw text',
      description: 'Start with raw ideas, meeting transcripts, reports, or outlines. No need to worry about formatting yet.',
      actionText: 'Enter plain text',
    },
    {
      step: '02',
      title: 'CHOOSE',
      subtitle: 'Select a bespoke template',
      description: 'Choose from 10 distinct architectural document layouts with tailored typography, margins, and palette tokens.',
      actionText: 'Select layout',
    },
    {
      step: '03',
      title: 'CRAFT',
      subtitle: 'Refine typography & layout',
      description: 'Fine-tune headings, tables, blockquotes, and accent colors. Real-time preview ensures millimeter accuracy.',
      actionText: 'Customize details',
    },
    {
      step: '04',
      title: 'EXPORT',
      subtitle: 'Download vector-grade PDF',
      description: 'Generate high-resolution, vector-sharp PDFs with deterministic bottom-anchored footers and zero clipping.',
      actionText: 'Export PDF',
    },
  ];

  return (
    <div className="min-h-screen bg-paper-warm text-ink-900 font-sans selection:bg-brand-cream selection:text-ink-900">
      {/* ========================================================
          1. REFINED EDITORIAL NAVBAR
         ======================================================== */}
      <header className="sticky top-0 z-50 bg-paper-warm/90 backdrop-blur-md border-b border-paper-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <DocuCraftLogo size="md" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[13.5px] font-medium text-ink-700">
            <a href="#how-it-works" className="hover:text-ink-900 transition-colors">How It Works</a>
            <a href="#templates" className="hover:text-ink-900 transition-colors">Templates</a>
            <a href="#craft" className="hover:text-ink-900 transition-colors">Craftsmanship</a>
            <a href="#capabilities" className="hover:text-ink-900 transition-colors">Capabilities</a>
            <a href="#use-cases" className="hover:text-ink-900 transition-colors">Use Cases</a>
          </nav>

          {/* Auth Controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-ink-800 bg-white border border-paper-border hover:border-ink-400 hover:bg-paper-sand rounded-md shadow-subtle transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0"
                >
                  <FolderOpen size={14} className="text-ink-500" />
                  Dashboard
                </Link>
                <Link
                  href="/create"
                  className="group inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-ink-900 hover:bg-ink-800 rounded-md shadow-paper hover:shadow-dock transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0"
                >
                  New Document
                  <ArrowRight size={12} className="text-brand-orange transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-ink-700 hover:text-ink-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/create"
                  className="group inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-ink-900 hover:bg-ink-800 rounded-md shadow-paper hover:shadow-dock transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0"
                >
                  Create Document
                  <ArrowRight size={13} className="text-brand-orange transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================
          2. HERO SECTION — EDITORIAL & PRODUCT FOCUS
         ======================================================== */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 border-b border-paper-border bg-paper-warm overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            {/* Subtle Brand Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-paper-card border border-paper-border text-[11px] font-semibold text-ink-700 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
              Document Publishing Studio
            </div>

            {/* Confident Editorial Headline with Hand-Drawn Underline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-[-0.03em] text-ink-900 leading-[1.12] mb-6">
              Turn your plain text into{' '}
              <span className="relative inline-block">
                <span>documents worth sharing.</span>
                <HandDrawnLine
                  variant="underline"
                  color="#FFA259"
                  strokeWidth={2}
                  className="absolute -bottom-2.5 left-0 w-full h-3 text-brand-orange"
                />
              </span>
            </h1>

            {/* Clear Product Purpose */}
            <p className="text-base sm:text-lg text-ink-500 font-normal leading-relaxed mb-8 max-w-2xl mx-auto">
              Paste your raw notes, choose a professionally crafted template, customize every typographic detail, and generate vector-sharp PDFs ready to publish or print.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/create"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-ink-900 hover:bg-ink-800 rounded-md shadow-paper hover:shadow-dock transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0"
              >
                Create a Document
                <ArrowRight size={15} className="text-brand-orange transition-transform duration-200 ease-out group-hover:translate-x-1" />
              </Link>
              <a
                href="#templates"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-ink-800 bg-white border border-paper-border hover:border-ink-400 hover:bg-paper-sand rounded-md shadow-subtle transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0"
              >
                Explore 10 Templates
              </a>
            </div>

            {/* Guarantee Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-ink-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-brand-orange" />
                Deterministic bottom footers
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-brand-orange" />
                Pre-render block pagination
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-brand-orange" />
                Millimeter-accurate preview
              </span>
            </div>
          </div>

          {/* ========================================================
              HERO VISUAL: REAL PRODUCT TRANSFORMATION COMPOSITION
             ======================================================== */}
          <div className="relative mt-8 max-w-5xl mx-auto">
            {/* Architectural Grid Card Container */}
            <div className="bg-white border border-paper-border rounded-lg shadow-paper-lg p-3 sm:p-6 lg:p-8">
              {/* Product Header Bar */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-paper-border text-xs text-ink-500">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-paper-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-paper-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-paper-border" />
                  <span className="ml-2 font-mono text-[11px] text-ink-400">DocuCraft Studio — Executive Briefing</span>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-[11px] font-medium">
                  <span className="text-brand-orange font-semibold">● 100% Vector Output</span>
                  <span>A4 Portrait</span>
                  <span>2 Pages</span>
                </div>
              </div>

              {/* Three-Stage Real Transformation Composition */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                {/* Stage 1: Plain Text Input (Left) */}
                <div className="md:col-span-4 bg-paper-sand border border-paper-border rounded-md p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-paper-border/60">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-700">01. Plain Text Input</span>
                      <span className="text-[10px] font-mono text-ink-400">RAW DRAFT</span>
                    </div>
                    <div className="font-mono text-[11px] leading-relaxed text-ink-700 space-y-2">
                      <p className="font-bold text-ink-900"># Executive Strategic Briefing</p>
                      <p className="text-ink-500">Fiscal Year Growth Targets, Capital Allocation, and Operational Priorities</p>
                      <p className="pt-2 font-semibold">## 1. Executive Summary</p>
                      <p className="text-[10px] text-ink-500">During the preceding quarter, our organization achieved record enterprise growth driven by key infrastructure investments...</p>
                      <p className="pt-1 font-semibold">## 2. Key Operational Highlights</p>
                      <p className="text-[10px] text-ink-500">- Market Expansion: Penetrated 3 major European tier-1 markets.</p>
                      <p className="text-[10px] text-ink-500">- Overhead Reduction: Decreased expenses by 14%.</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-paper-border/60 flex items-center justify-between text-[11px] text-ink-500">
                    <span>1,420 characters</span>
                    <span className="text-brand-orange font-semibold flex items-center gap-1">
                      Auto-parsed <ArrowRight size={11} />
                    </span>
                  </div>
                </div>

                {/* Stage 2 & 3: Real Rendered Document Sheet (Right) */}
                <div className="md:col-span-8 bg-paper-card border border-paper-border rounded-md p-4 sm:p-6 flex flex-col items-center justify-center">
                  <div className="w-full flex items-center justify-between mb-3 text-xs text-ink-500">
                    <span className="font-bold uppercase tracking-wider text-ink-800 text-[11px]">
                      02. Formatted Document Preview
                    </span>
                    <div className="flex items-center gap-2">
                      <EditorialAnnotation text="ready to publish" color="#FFA259" />
                      <span className="text-[11px] font-semibold text-ink-600 flex items-center gap-1">
                        <Printer size={13} />
                        Physical Sheet Layout
                      </span>
                    </div>
                  </div>

                  {/* High-Fidelity Real Document Preview */}
                  <div className="w-full max-w-[420px] transition-transform duration-300 hover:scale-[1.015]">
                    <DocumentPreview template={featuredTemplate} mode="thumbnail" shadow={true} hoverLift={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. HOW IT WORKS — EDITORIAL HORIZONTAL TIMELINE
         ======================================================== */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white border-b border-paper-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-orange mb-3 block">
              Publishing Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-900 mb-3">
              From thought to publication in four disciplined steps.
            </h2>
            <p className="text-sm sm:text-base text-ink-500 font-normal leading-relaxed">
              A streamlined creative process designed to eliminate friction between drafting text and delivering publication-grade PDFs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {processSteps.map((item, idx) => (
              <div key={item.step} className="relative flex flex-col">
                <div
                  className="group relative flex-1 bg-paper-warm border border-paper-border rounded-lg p-6 hover:border-paper-border-strong hover:bg-white hover:shadow-paper hover:-translate-y-1 transition-all duration-200 ease-out flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-2xl font-extrabold text-ink-900 group-hover:text-brand-orange transition-colors">
                        {item.step}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                        {item.title}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-ink-900 mb-2">
                      {item.subtitle}
                    </h3>
                    <p className="text-xs text-ink-500 leading-relaxed mb-6 font-normal">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-paper-border text-xs font-semibold text-ink-700 flex items-center justify-between">
                    <span>{item.actionText}</span>
                    <ChevronRight size={13} className="text-brand-orange transition-transform duration-200 ease-out group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Hand-Drawn Arrow Connector Between Steps (Desktop Only) */}
                {idx < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <HandDrawnLine
                      variant="connector"
                      color="#FFA259"
                      strokeWidth={1.5}
                      className="w-7 h-4 text-brand-orange"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          4. 10 BESPOKE TEMPLATES GALLERY
         ======================================================== */}
      <section id="templates" className="py-20 md:py-28 bg-paper-sand border-b border-paper-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-orange">
                  Curated Typography & Grids
                </span>
                <HandDrawnLine variant="arrow" color="#FFA259" strokeWidth={1.5} className="w-5 h-3 text-brand-orange inline-block" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-900 mb-3">
                10 architectural template identities.
              </h2>
              <p className="text-sm sm:text-base text-ink-500 font-normal leading-relaxed max-w-xl">
                Every template features independent typography pairings, margin structures, and header/footer configurations engineered for its exact use case.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-white border border-paper-border rounded-md shadow-subtle self-start md:self-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs rounded transition-all duration-150 ${
                    selectedCategory === cat
                      ? 'bg-ink-900 text-white font-semibold'
                      : 'text-ink-600 hover:text-ink-900 hover:bg-paper-card font-medium'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Template Grid: Real Document Previews with Refined Hover Interactions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template, idx) => {
              // Selective pencil annotation for top templates
              const annotations: Record<string, string> = {
                'professional-business': 'Executive Standard',
                'modern-minimal': 'Swiss Typography',
                'academic-research': 'Formal Citations',
                'business-proposal': 'High Conversion',
                'creative-portfolio': 'Editorial Spread',
              };
              const annotationText = annotations[template.id];

              return (
                <div
                  key={template.id}
                  className="group flex flex-col bg-white border border-paper-border hover:border-brand-orange/60 rounded-lg overflow-hidden transition-all duration-200 ease-out hover:-translate-y-1.5 hover:shadow-paper-lg relative"
                >
                  {/* Real Miniature Document Preview with Gentle Zoom on Card Hover */}
                  <div className="p-4 bg-paper-card border-b border-paper-border flex items-center justify-center relative overflow-hidden">
                    <div className="w-full max-w-[240px] transition-transform duration-200 ease-out group-hover:scale-[1.018]">
                      <DocumentPreview template={template} mode="thumbnail" shadow={true} hoverLift={false} />
                    </div>

                    {/* Reveal Editorial Pencil Annotation on Card Hover */}
                    {annotationText && (
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out pointer-events-none">
                        <EditorialAnnotation text={annotationText} color="#FFA259" />
                      </div>
                    )}
                  </div>

                  {/* Template Metadata & Action */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-500 px-2 py-0.5 bg-paper-sand border border-paper-border rounded">
                          {template.category}
                        </span>
                        {template.badge && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-brand-orange bg-brand-cream/60 px-2 py-0.5 rounded">
                            {template.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-ink-900 group-hover:text-brand-orange transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-xs text-ink-500 mt-1 line-clamp-2 leading-relaxed font-normal">
                        {template.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-paper-border">
                      <Link
                        href={`/create?template=${template.id}`}
                        className="inline-flex items-center justify-between w-full text-xs font-semibold text-ink-900 group-hover:text-brand-orange transition-colors"
                      >
                        <span>Use Template</span>
                        <ArrowRight size={13} className="text-brand-orange transition-transform duration-200 ease-out group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/templates"
              className="group inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-ink-800 bg-white border border-paper-border hover:border-ink-400 hover:bg-paper-sand rounded-md shadow-subtle transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0"
            >
              Browse Full Catalog with Specification Sheets
              <ArrowRight size={13} className="text-brand-orange transition-transform duration-200 ease-out group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. EDITORIAL PHOTOGRAPHY & CRAFTSMANSHIP FEATURE
         ======================================================== */}
      <section id="craft" className="py-20 md:py-28 bg-white border-b border-paper-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Authentic Editorial Desk Photograph */}
            <div className="lg:col-span-7">
              <div className="relative rounded-lg overflow-hidden border border-paper-border shadow-paper-lg bg-paper-card group">
                <img
                  src="/images/editorial-desk.jpg"
                  alt="Architectural wooden desk with printed report and writing instruments"
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                />
                <div className="p-3 bg-paper-warm border-t border-paper-border text-[11px] text-ink-500 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <EditorialAnnotation text="A4 Proof Verified" color="#FFA259" />
                    <span>Physical verification: 210mm x 297mm sheet</span>
                  </div>
                  <span className="font-mono text-[10px]">96 to 300 DPI Vector Output</span>
                </div>
              </div>
            </div>

            {/* Right: Editorial Commentary on Document Publishing */}
            <div className="lg:col-span-5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-orange mb-3 block">
                Physical Tactility
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-900 mb-4">
                Engineered for the physical page, not just the screen.
              </h2>
              <p className="text-sm text-ink-600 font-normal leading-relaxed mb-4">
                Most digital document tools treat PDF export as an afterthought—scaling pages unexpectedly, cutting sentences in half, or pushing footers under arbitrary content blocks.
              </p>
              <p className="text-sm text-ink-600 font-normal leading-relaxed mb-6">
                DocuCraft calculates page geometry before rendering. Every paragraph, table, and heading is measured against available content height. Footers remain mathematically anchored to the physical bottom on every page, whether it contains ten paragraphs or one sentence.
              </p>

              <div className="space-y-3 pt-2 border-t border-paper-border">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-cream/80 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink-900">Deterministic Footer Placement</h4>
                    <p className="text-[11px] text-ink-500 font-normal">FooterTop = PageHeight - BottomMargin - FooterHeight. Identical across all pages.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-cream/80 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink-900">Atomic Block Pagination</h4>
                    <p className="text-[11px] text-ink-500 font-normal">No clipping, no hiding with overflow, and controlled paragraph splitting.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. SOPHISTICATED DARK SECTION (#17181C)
         ======================================================== */}
      <section className="py-20 md:py-28 bg-ink-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-orange mb-3 block">
              Typography & Output Standards
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              Your Content. Your Style. Your Document.
            </h2>
            <p className="text-ink-400 text-sm sm:text-base font-normal leading-relaxed max-w-xl mx-auto">
              Whether you are authoring board briefings, academic dissertations, or commercial proposals, DocuCraft gives your text the weight and authority it deserves.
            </p>
          </div>

          {/* Editorial Dark Showcase: Dual Document Spread */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Sheet 1: Academic Paper */}
            <div className="group bg-ink-800/90 border border-ink-700/80 hover:border-ink-600 rounded-lg p-6 flex flex-col justify-between transition-all duration-200 ease-out hover:-translate-y-1">
              <div className="mb-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-orange">01. Academic Research</span>
                <h3 className="text-base font-bold text-white mt-1">Empirical Analysis & Multi-Column Layout</h3>
                <p className="text-xs text-ink-400 mt-1 font-normal">Formal serif typography with structured abstract and citation footnotes.</p>
              </div>
              <div className="w-full max-w-[260px] mx-auto mt-4 transition-transform duration-200 ease-out group-hover:scale-[1.02]">
                <DocumentPreview template={TEMPLATES[2]} mode="thumbnail" shadow={true} hoverLift={false} />
              </div>
            </div>

            {/* Sheet 2: Business Proposal */}
            <div className="group bg-ink-800/90 border border-ink-700/80 hover:border-ink-600 rounded-lg p-6 flex flex-col justify-between transition-all duration-200 ease-out hover:-translate-y-1">
              <div className="mb-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-orange">02. Business Proposal</span>
                <h3 className="text-base font-bold text-white mt-1">Executive Deliverables & Signature Block</h3>
                <p className="text-xs text-ink-400 mt-1 font-normal">Structured pricing matrix, milestone timeline, and binding signature region.</p>
              </div>
              <div className="w-full max-w-[260px] mx-auto mt-4 transition-transform duration-200 ease-out group-hover:scale-[1.02]">
                <DocumentPreview template={TEMPLATES[3]} mode="thumbnail" shadow={true} hoverLift={false} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. CORE CAPABILITIES (FEATURES) — UNIFIED SYSTEM
         ======================================================== */}
      <section id="capabilities" className="py-20 md:py-28 bg-white border-b border-paper-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-orange mb-3 block">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-900 mb-3">
              Everything required for publishing documents.
            </h2>
            <p className="text-sm sm:text-base text-ink-500 font-normal leading-relaxed">
              Precision tools designed specifically for document creation and high-resolution PDF rendering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-6 bg-paper-warm border border-paper-border hover:border-paper-border-strong hover:bg-white rounded-lg hover:-translate-y-1 hover:shadow-paper transition-all duration-200 ease-out">
              <div className="w-9 h-9 rounded bg-white border border-paper-border flex items-center justify-center text-ink-900 mb-4 shadow-subtle group-hover:border-brand-orange/40 transition-colors">
                <Type size={18} className="text-brand-orange" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400 block mb-1">Typography</span>
              <h3 className="text-sm font-bold text-ink-900 mb-2">Curated Typography Engine</h3>
              <p className="text-xs text-ink-500 font-normal leading-relaxed">
                Choose between editorial serifs (Merriweather, Playfair Display) and architectural sans-serifs (Inter, Outfit, JetBrains Mono).
              </p>
            </div>

            <div className="group p-6 bg-paper-warm border border-paper-border hover:border-paper-border-strong hover:bg-white rounded-lg hover:-translate-y-1 hover:shadow-paper transition-all duration-200 ease-out">
              <div className="w-9 h-9 rounded bg-white border border-paper-border flex items-center justify-center text-ink-900 mb-4 shadow-subtle group-hover:border-brand-orange/40 transition-colors">
                <Table size={18} className="text-brand-orange" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400 block mb-1">Tables & Grids</span>
              <h3 className="text-sm font-bold text-ink-900 mb-2">Rich Tables & Visual Callouts</h3>
              <p className="text-xs text-ink-500 font-normal leading-relaxed">
                Insert structured pricing tables, milestone summaries, and highlighted quote blocks that paginate cleanly across sheets.
              </p>
            </div>

            <div className="group p-6 bg-paper-warm border border-paper-border hover:border-paper-border-strong hover:bg-white rounded-lg hover:-translate-y-1 hover:shadow-paper transition-all duration-200 ease-out">
              <div className="w-9 h-9 rounded bg-white border border-paper-border flex items-center justify-center text-ink-900 mb-4 shadow-subtle group-hover:border-brand-orange/40 transition-colors">
                <Layout size={18} className="text-brand-orange" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400 block mb-1">Pagination</span>
              <h3 className="text-sm font-bold text-ink-900 mb-2">Pre-Render Block Pagination</h3>
              <p className="text-xs text-ink-500 font-normal leading-relaxed">
                Atomic blocks are measured and packed into discrete page models before printing. Zero surprise cut-offs or footer overflows.
              </p>
            </div>

            <div className="group p-6 bg-paper-warm border border-paper-border hover:border-paper-border-strong hover:bg-white rounded-lg hover:-translate-y-1 hover:shadow-paper transition-all duration-200 ease-out">
              <div className="w-9 h-9 rounded bg-white border border-paper-border flex items-center justify-center text-ink-900 mb-4 shadow-subtle group-hover:border-brand-orange/40 transition-colors">
                <Sliders size={18} className="text-brand-orange" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400 block mb-1">Layout Geometry</span>
              <h3 className="text-sm font-bold text-ink-900 mb-2">Margins & Physical Geometry</h3>
              <p className="text-xs text-ink-500 font-normal leading-relaxed">
                Support for A4, A5, and Letter page sizes in both portrait and landscape orientation with normal, narrow, and wide margins.
              </p>
            </div>

            <div className="group p-6 bg-paper-warm border border-paper-border hover:border-paper-border-strong hover:bg-white rounded-lg hover:-translate-y-1 hover:shadow-paper transition-all duration-200 ease-out">
              <div className="w-9 h-9 rounded bg-white border border-paper-border flex items-center justify-center text-ink-900 mb-4 shadow-subtle group-hover:border-brand-orange/40 transition-colors">
                <Printer size={18} className="text-brand-orange" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400 block mb-1">Rendering Pool</span>
              <h3 className="text-sm font-bold text-ink-900 mb-2">High-Performance Chromium Pool</h3>
              <p className="text-xs text-ink-500 font-normal leading-relaxed">
                Singleton headless browser pool with concurrency semaphore producing warm vector PDFs in under 800ms.
              </p>
            </div>

            <div className="group p-6 bg-paper-warm border border-paper-border hover:border-paper-border-strong hover:bg-white rounded-lg hover:-translate-y-1 hover:shadow-paper transition-all duration-200 ease-out">
              <div className="w-9 h-9 rounded bg-white border border-paper-border flex items-center justify-center text-ink-900 mb-4 shadow-subtle group-hover:border-brand-orange/40 transition-colors">
                <Download size={18} className="text-brand-orange" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400 block mb-1">Security</span>
              <h3 className="text-sm font-bold text-ink-900 mb-2">Protected Download Pipeline</h3>
              <p className="text-xs text-ink-500 font-normal leading-relaxed">
                Backend-enforced authentication, IDOR ownership verification, autosave debounce, and generation deduplication locks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          8. USE CASES SECTION — UNIFIED CARD HIERARCHY
         ======================================================== */}
      <section id="use-cases" className="py-20 md:py-28 bg-paper-sand border-b border-paper-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-orange mb-3 block">
              Professional Applications
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-900 mb-3">
              Tailored for every document genre.
            </h2>
            <p className="text-sm sm:text-base text-ink-500 font-normal leading-relaxed">
              See how corporate leaders, researchers, and creators use DocuCraft for daily publication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-paper-border hover:border-paper-border-strong rounded-lg p-5 hover:-translate-y-1 hover:shadow-subtle transition-all duration-200 ease-out">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-orange block mb-1">ENTERPRISE & LEADERSHIP</span>
              <h3 className="text-sm font-bold text-ink-900 mb-2">Business & Board Briefings</h3>
              <p className="text-xs text-ink-500 font-normal leading-relaxed">
                Quarterly reviews, corporate proposals, investor updates, and operational performance audits.
              </p>
            </div>

            <div className="bg-white border border-paper-border hover:border-paper-border-strong rounded-lg p-5 hover:-translate-y-1 hover:shadow-subtle transition-all duration-200 ease-out">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-orange block mb-1">ACADEMIC & RESEARCH</span>
              <h3 className="text-sm font-bold text-ink-900 mb-2">Research Papers & Theses</h3>
              <p className="text-xs text-ink-500 font-normal leading-relaxed">
                Academic abstracts, laboratory findings, literature reviews, and standardized citations.
              </p>
            </div>

            <div className="bg-white border border-paper-border hover:border-paper-border-strong rounded-lg p-5 hover:-translate-y-1 hover:shadow-subtle transition-all duration-200 ease-out">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-orange block mb-1">CAREER & TALENT</span>
              <h3 className="text-sm font-bold text-ink-900 mb-2">Executive Resumes & CVs</h3>
              <p className="text-xs text-ink-500 font-normal leading-relaxed">
                Structured career histories, skill matrices, credentials, and printable executive profiles.
              </p>
            </div>

            <div className="bg-white border border-paper-border hover:border-paper-border-strong rounded-lg p-5 hover:-translate-y-1 hover:shadow-subtle transition-all duration-200 ease-out">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-orange block mb-1">MARKETING & PRODUCT</span>
              <h3 className="text-sm font-bold text-ink-900 mb-2">Commercial One-Pagers</h3>
              <p className="text-xs text-ink-500 font-normal leading-relaxed">
                Product briefs, service sheets, event pamphlets, and high-impact marketing one-pagers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          9. CALL TO ACTION — DIRECT & INVITING
         ======================================================== */}
      <section className="py-20 md:py-24 bg-white border-b border-paper-border text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <DocuCraftLogo size="lg" className="justify-center mb-6" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight mb-3">
            Start creating your next document today.
          </h2>
          <p className="text-sm sm:text-base text-ink-500 font-normal leading-relaxed max-w-xl mx-auto mb-8">
            No complex layout software, no messy word processor spacing, and no broken pagination. Just clean text and beautiful documents.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/create"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-ink-900 hover:bg-ink-800 rounded-md shadow-paper hover:shadow-dock transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0"
            >
              Create a Document
              <ArrowRight size={14} className="text-brand-orange transition-transform duration-200 ease-out group-hover:translate-x-1" />
            </Link>
            <Link
              href="/templates"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-ink-800 bg-white border border-paper-border hover:border-ink-400 hover:bg-paper-sand rounded-md shadow-subtle transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0"
            >
              Explore 10 Templates
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          10. REFINED PRODUCT FOOTER
         ======================================================== */}
      <footer className="py-12 bg-paper-warm border-t border-paper-border text-xs text-ink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <DocuCraftLogo size="sm" />
            <span className="text-ink-400 font-normal">© 2026 DocuCraft Studio. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium text-ink-700">
            <a href="#how-it-works" className="hover:text-ink-900 transition-colors">How It Works</a>
            <a href="#templates" className="hover:text-ink-900 transition-colors">Templates</a>
            <a href="#capabilities" className="hover:text-ink-900 transition-colors">Capabilities</a>
            <Link href="/create" className="hover:text-ink-900 transition-colors">Create</Link>
            <Link href="/login" className="hover:text-ink-900 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
