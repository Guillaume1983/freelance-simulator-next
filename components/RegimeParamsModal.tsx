'use client';

import { useEffect, useRef } from 'react';
import { X, Settings2 } from 'lucide-react';
import RegimeParamsInline from '@/components/RegimeParamsInline';

const REGIME_COLORS: Record<string, string> = {
  'Portage':  '#6366f1',
  'Micro':    '#f59e0b',
  'EURL IR':  '#10b981',
  'EURL IS':  '#3b82f6',
  'SASU':     '#8b5cf6',
};

const REGIME_DESCRIPTIONS: Record<string, string> = {
  'Portage':  'Ajustez le taux de frais de gestion de la société de portage.',
  'Micro':    'Choisissez le type d\'activité et le mode d\'imposition.',
  'EURL IR':  'Aucun paramètre spécifique à configurer pour ce statut.',
  'EURL IS':  'Définissez la part du bénéfice versée en rémunération TNS.',
  'SASU':     'Définissez la part du bénéfice distribué en dividendes.',
};

interface Props {
  sim: any;
  regimeId: string;
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement>;
}

export default function RegimeParamsModal({ sim, regimeId, isOpen, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const color = REGIME_COLORS[regimeId] ?? '#6366f1';

  // Fermer au clic extérieur
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  // Fermer à l'Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasParams = regimeId !== 'EURL IR';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Paramètres ${regimeId}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-sm mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden"
        style={{ boxShadow: `0 24px 64px -8px ${color}30` }}
      >
        {/* Barre colorée */}
        <div className="h-1 w-full" style={{ background: color }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${color}18` }}
            >
              <Settings2 size={16} style={{ color }} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {regimeId}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Paramètres de calcul
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
            aria-label="Fermer"
          >
            <X size={14} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
            {REGIME_DESCRIPTIONS[regimeId]}
          </p>

          {hasParams ? (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
              <RegimeParamsInline sim={sim} regimeId={regimeId} align="left" />
            </div>
          ) : (
            <div className="flex items-center justify-center py-6 text-slate-400 dark:text-slate-600">
              <p className="text-xs italic">Aucun paramètre ajustable pour ce statut.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-sm transition-all text-white"
            style={{ background: color }}
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
}
