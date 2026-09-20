'use client';

import React from 'react';
import { useUI } from '../../stores/ui-context';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useUI();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-4 h-4 text-blue-500 shrink-0" />;
        let borderClass = 'border-slate-200';
        let bgClass = 'bg-white';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
          borderClass = 'border-emerald-200';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />;
          borderClass = 'border-red-200';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg border ${borderClass} ${bgClass} text-sm text-brand-charcoal animate-in slide-in-from-bottom-3 duration-200`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span className="font-medium text-xs md:text-sm">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
