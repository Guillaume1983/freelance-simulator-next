'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function GrowthRatesModal({
  open,
  onClose,
  growthByYear,
  onUpdateYear,
}: {
  open: boolean;
  onClose: () => void;
  growthByYear: number[];
  onUpdateYear: (index: number, value: number) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="growth-modal-title"
        aria-describedby="growth-modal-desc"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 pr-2">
            <h2 id="growth-modal-title" className="text-lg font-black text-slate-900 dark:text-white">
              Croissance du CA
            </h2>
            <p
              id="growth-modal-desc"
              className="mt-1 text-[13px] leading-snug text-slate-500 dark:text-slate-400"
            >
              Taux par rapport à l&apos;année précédente (années 2 à 5). Les projections se mettent à jour tout
              de suite.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {[2, 3, 4, 5].map((an) => {
            const idx = an - 1;
            return (
              <label key={an} className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Vers année {an}</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    step={1}
                    inputMode="numeric"
                    value={growthByYear[idx] ?? 0}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      onUpdateYear(idx, Number.isNaN(n) ? 0 : n);
                    }}
                    onFocus={(e) => e.target.select()}
                    className="h-9 w-full min-w-0 max-w-[5rem] rounded-lg border border-slate-200 bg-white px-2 text-center text-sm font-semibold tabular-nums text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40"
                  />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">%</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
