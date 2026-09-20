'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Quote,
  Minus,
  Code,
  Table as TableIcon,
  Undo,
  Redo,
  Highlighter,
  Palette,
  Link as LinkIcon,
} from 'lucide-react';
import { AVAILABLE_FONTS } from '@docucraft/shared';

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  if (!editor) return null;

  const colorPalette = [
    '#1E1E24', '#0F172A', '#334155', '#475569',
    '#DC2626', '#EA580C', '#D97706', '#059669',
    '#2563EB', '#7C3AED', '#DB2777', '#FFA259',
  ];

  const highlightPalette = [
    '#FFEDB9', '#FEF08A', '#BBF7D0', '#BAE6FD', '#DDD6FE', '#FBCFE8',
  ];

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="sticky top-0 z-30 flex flex-wrap items-center gap-1 p-2 bg-white/95 backdrop-blur-sm border-b border-brand-border text-brand-charcoal text-xs shadow-sm">
      {/* History */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Headings & Blocks */}
      <div className="flex items-center gap-0.5 px-2 border-r border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('paragraph') ? 'bg-brand-cream text-brand-charcoal font-bold' : 'hover:bg-slate-100'
          }`}
          title="Normal Text"
        >
          <Pilcrow className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-brand-cream text-brand-charcoal font-bold' : 'hover:bg-slate-100'
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-brand-cream text-brand-charcoal font-bold' : 'hover:bg-slate-100'
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-brand-cream text-brand-charcoal font-bold' : 'hover:bg-slate-100'
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
      </div>

      {/* Inline Formatting */}
      <div className="flex items-center gap-0.5 px-2 border-r border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('bold') ? 'bg-brand-cream text-brand-charcoal font-bold' : 'hover:bg-slate-100'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('italic') ? 'bg-brand-cream text-brand-charcoal font-bold' : 'hover:bg-slate-100'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('underline') ? 'bg-brand-cream text-brand-charcoal font-bold' : 'hover:bg-slate-100'
          }`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('strike') ? 'bg-brand-cream text-brand-charcoal font-bold' : 'hover:bg-slate-100'
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
      </div>

      {/* Color & Highlight */}
      <div className="relative flex items-center gap-0.5 px-2 border-r border-slate-200">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowHighlightPicker(false);
            }}
            className="p-1.5 rounded hover:bg-slate-100 transition-colors flex items-center gap-1"
            title="Text Color"
          >
            <Palette className="w-4 h-4" />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-xl border border-slate-200 grid grid-cols-4 gap-1.5 z-50">
              {colorPalette.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setColor(c).run();
                    setShowColorPicker(false);
                  }}
                  className="w-5 h-5 rounded-full border border-slate-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowHighlightPicker(!showHighlightPicker);
              setShowColorPicker(false);
            }}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive('highlight') ? 'bg-brand-cream' : 'hover:bg-slate-100'
            }`}
            title="Highlight Text"
          >
            <Highlighter className="w-4 h-4" />
          </button>
          {showHighlightPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-xl border border-slate-200 grid grid-cols-3 gap-1.5 z-50">
              {highlightPalette.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleHighlight({ color: c }).run();
                    setShowHighlightPicker(false);
                  }}
                  className="w-5 h-5 rounded border border-slate-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-0.5 px-2 border-r border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-brand-cream text-brand-charcoal font-bold' : 'hover:bg-slate-100'
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-brand-cream text-brand-charcoal font-bold' : 'hover:bg-slate-100'
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-brand-cream text-brand-charcoal font-bold' : 'hover:bg-slate-100'
          }`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive({ textAlign: 'justify' }) ? 'bg-brand-cream text-brand-charcoal font-bold' : 'hover:bg-slate-100'
          }`}
          title="Align Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </button>
      </div>

      {/* Lists & Structural */}
      <div className="flex items-center gap-0.5 px-2 border-r border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('bulletList') ? 'bg-brand-cream text-brand-charcoal font-bold' : 'hover:bg-slate-100'
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('orderedList') ? 'bg-brand-cream text-brand-charcoal font-bold' : 'hover:bg-slate-100'
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('blockquote') ? 'bg-brand-cream text-brand-charcoal font-bold' : 'hover:bg-slate-100'
          }`}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded hover:bg-slate-100 transition-colors"
          title="Horizontal Divider"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Insertables: Link, Table */}
      <div className="flex items-center gap-0.5 pl-2">
        <button
          type="button"
          onClick={setLink}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('link') ? 'bg-brand-cream text-brand-charcoal font-bold' : 'hover:bg-slate-100'
          }`}
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={insertTable}
          className="p-1.5 rounded hover:bg-slate-100 transition-colors"
          title="Insert Table (3x3)"
        >
          <TableIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
