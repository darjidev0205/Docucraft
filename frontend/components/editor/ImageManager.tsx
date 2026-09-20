'use client';

import React, { useState } from 'react';
import { useDocument } from '../../stores/document-context';
import { useUI } from '../../stores/ui-context';
import { apiClient } from '../../lib/api-client';
import { Upload, Image as ImageIcon, Trash2, Check, ShieldAlert } from 'lucide-react';

export function ImageManager() {
  const { document: doc, updateSettings, updatePageContent, activePageIndex } = useDocument();
  const { addToast } = useUI();
  const [uploading, setUploading] = useState(false);

  if (!doc) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isLogo: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (PNG, JPG, WEBP, SVG).', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('Image size exceeds 10MB limit.', 'error');
      return;
    }

    setUploading(true);
    try {
      // Direct base64 data URL for instant zero-latency embedding, or upload to backend
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;

        if (isLogo) {
          updateSettings({
            header: {
              ...doc.settings.header,
              enabled: true,
              logoUrl: dataUrl,
            },
          });
          addToast('Header logo updated!', 'success');
        } else {
          // Insert image into active page HTML
          const activePage = doc.pages[activePageIndex];
          if (activePage) {
            const imgTag = `<p><img src="${dataUrl}" alt="Document Image" style="max-width: 100%; height: auto; border-radius: 6px; margin: 12px 0;" /></p>`;
            updatePageContent(activePageIndex, activePage.contentHtml + imgTag);
            addToast('Image added to page!', 'success');
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      addToast('Failed to load image.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeLogo = () => {
    updateSettings({
      header: {
        ...doc.settings.header,
        logoUrl: undefined,
      },
    });
    addToast('Logo removed from header.', 'info');
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-6 text-xs text-brand-charcoal">
      {/* Header Logo Section */}
      <div>
        <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-2">Header Logo</h4>
        <p className="text-[11px] text-brand-muted mb-3">
          Upload an official brand or company logo to display on every page header.
        </p>

        {doc.settings.header.logoUrl ? (
          <div className="p-3 bg-white rounded-xl border border-brand-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={doc.settings.header.logoUrl}
                alt="Logo"
                className="max-h-8 max-w-[80px] object-contain"
              />
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Logo Active
              </span>
            </div>
            <button
              type="button"
              onClick={removeLogo}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
              title="Remove Logo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-brand-orange rounded-xl bg-white cursor-pointer transition-colors text-center">
            <Upload className="w-6 h-6 text-slate-400 mb-1" />
            <span className="font-semibold text-brand-charcoal">Upload Header Logo</span>
            <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, or SVG (Up to 10MB)</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, true)}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {/* Insert Document Image Section */}
      <div className="pt-4 border-t border-brand-border">
        <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-2">Insert In Page</h4>
        <p className="text-[11px] text-brand-muted mb-3">
          Upload and insert an image directly into the current active page content.
        </p>

        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-brand-orange rounded-xl bg-white cursor-pointer transition-colors text-center">
          <ImageIcon className="w-6 h-6 text-slate-400 mb-1" />
          <span className="font-semibold text-brand-charcoal">Insert Image to Page {activePageIndex + 1}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP (Up to 10MB)</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e, false)}
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}
