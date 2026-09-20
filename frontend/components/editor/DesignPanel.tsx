'use client';

import React from 'react';
import { useDocument } from '../../stores/document-context';
import { PageSize, Orientation, MarginPreset, MARGIN_PRESETS, AVAILABLE_FONTS } from '@docucraft/shared';

export function DesignPanel() {
  const { document: doc, updateSettings } = useDocument();

  if (!doc) return null;

  const { settings } = doc;
  const { pageSize, orientation, marginPreset, typography, colors, header, footer } = settings;

  const handleMarginPresetChange = (preset: MarginPreset) => {
    updateSettings({
      marginPreset: preset,
      margins: MARGIN_PRESETS[preset] || MARGIN_PRESETS.normal,
    });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-6 text-xs text-brand-charcoal">
      {/* Page Setup */}
      <div>
        <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-3">Page Dimensions</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold mb-1">Paper Size</label>
            <select
              value={pageSize}
              onChange={(e) => updateSettings({ pageSize: e.target.value as PageSize })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-brand-border bg-white text-xs focus:ring-1 focus:ring-brand-orange"
            >
              <option value="A4">A4 (210 × 297 mm)</option>
              <option value="A5">A5 (148 × 210 mm)</option>
              <option value="Letter">Letter (8.5 × 11 in)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Orientation</label>
            <select
              value={orientation}
              onChange={(e) => updateSettings({ orientation: e.target.value as Orientation })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-brand-border bg-white text-xs focus:ring-1 focus:ring-brand-orange"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
        </div>

        {/* Margins */}
        <div className="mt-3">
          <label className="block font-semibold mb-1">Margins</label>
          <div className="grid grid-cols-3 gap-2">
            {(['normal', 'narrow', 'wide'] as MarginPreset[]).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleMarginPresetChange(preset)}
                className={`py-1.5 px-2 rounded-lg border text-center font-medium capitalize transition-all ${
                  marginPreset === preset
                    ? 'bg-brand-cream border-brand-orange text-brand-charcoal font-bold shadow-xs'
                    : 'bg-white border-brand-border hover:bg-slate-50'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="pt-4 border-t border-brand-border">
        <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-3">Typography</h4>
        <div className="space-y-3">
          <div>
            <label className="block font-semibold mb-1">Heading Font</label>
            <select
              value={typography.headingFont}
              onChange={(e) =>
                updateSettings({
                  typography: { ...typography, headingFont: e.target.value },
                })
              }
              className="w-full px-2.5 py-1.5 rounded-lg border border-brand-border bg-white text-xs"
            >
              {AVAILABLE_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Body Font</label>
            <select
              value={typography.bodyFont}
              onChange={(e) =>
                updateSettings({
                  typography: { ...typography, bodyFont: e.target.value },
                })
              }
              className="w-full px-2.5 py-1.5 rounded-lg border border-brand-border bg-white text-xs"
            >
              {AVAILABLE_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Base Font Size ({typography.baseFontSize}pt)</label>
              <input
                type="range"
                min="9"
                max="16"
                step="0.5"
                value={typography.baseFontSize}
                onChange={(e) =>
                  updateSettings({
                    typography: { ...typography, baseFontSize: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-brand-orange"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Line Height ({typography.lineHeight})</label>
              <input
                type="range"
                min="1.2"
                max="2.2"
                step="0.1"
                value={typography.lineHeight}
                onChange={(e) =>
                  updateSettings({
                    typography: { ...typography, lineHeight: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-brand-orange"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Brand & Document Colors */}
      <div className="pt-4 border-t border-brand-border">
        <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-3">Color Accent Palette</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold mb-1">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.primary}
                onChange={(e) =>
                  updateSettings({
                    colors: { ...colors, primary: e.target.value },
                  })
                }
                className="w-7 h-7 p-0 border border-slate-200 rounded cursor-pointer"
              />
              <span className="text-[11px] font-mono">{colors.primary}</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Accent / Border</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.secondary}
                onChange={(e) =>
                  updateSettings({
                    colors: { ...colors, secondary: e.target.value },
                  })
                }
                className="w-7 h-7 p-0 border border-slate-200 rounded cursor-pointer"
              />
              <span className="text-[11px] font-mono">{colors.secondary}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header & Footer toggles */}
      <div className="pt-4 border-t border-brand-border space-y-4">
        <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-1">Header & Footer</h4>

        {/* Header Settings */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs">Document Header</span>
            <input
              type="checkbox"
              checked={header.enabled}
              onChange={(e) =>
                updateSettings({
                  header: { ...header, enabled: e.target.checked },
                })
              }
              className="accent-brand-orange w-4 h-4 rounded cursor-pointer"
            />
          </div>

          {header.enabled && (
            <div className="space-y-2 pt-2 border-t border-slate-200/60">
              <div>
                <label className="block font-medium mb-1">Company / Organization</label>
                <input
                  type="text"
                  placeholder="Company Name"
                  value={header.companyName || ''}
                  onChange={(e) =>
                    updateSettings({
                      header: { ...header, companyName: e.target.value },
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Header Title</label>
                <input
                  type="text"
                  placeholder="Document Subject"
                  value={header.documentTitle || ''}
                  onChange={(e) =>
                    updateSettings({
                      header: { ...header, documentTitle: e.target.value },
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="headerBorder"
                  checked={header.borderBottom}
                  onChange={(e) =>
                    updateSettings({
                      header: { ...header, borderBottom: e.target.checked },
                    })
                  }
                  className="accent-brand-orange"
                />
                <label htmlFor="headerBorder" className="text-[11px] cursor-pointer">
                  Show divider line under header
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Settings */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs">Document Footer</span>
            <input
              type="checkbox"
              checked={footer.enabled}
              onChange={(e) =>
                updateSettings({
                  footer: { ...footer, enabled: e.target.checked },
                })
              }
              className="accent-brand-orange w-4 h-4 rounded cursor-pointer"
            />
          </div>

          {footer.enabled && (
            <div className="space-y-2 pt-2 border-t border-slate-200/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium">Page Numbers</span>
                <input
                  type="checkbox"
                  checked={footer.showPageNumbers}
                  onChange={(e) =>
                    updateSettings({
                      footer: { ...footer, showPageNumbers: e.target.checked },
                    })
                  }
                  className="accent-brand-orange"
                />
              </div>

              {footer.showPageNumbers && (
                <select
                  value={footer.pageNumberFormat}
                  onChange={(e) =>
                    updateSettings({
                      footer: {
                        ...footer,
                        pageNumberFormat: e.target.value as any,
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                >
                  <option value="PAGE_OF_TOTAL">"Page 1 of 3"</option>
                  <option value="PAGE_ONLY">"Page 1"</option>
                  <option value="NUMBER_ONLY">"1"</option>
                </select>
              )}

              <div>
                <label className="block font-medium mb-1">Custom Footer Text</label>
                <input
                  type="text"
                  placeholder="Confidential, Website, or Copyright"
                  value={footer.customText || ''}
                  onChange={(e) =>
                    updateSettings({
                      footer: { ...footer, customText: e.target.value },
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
