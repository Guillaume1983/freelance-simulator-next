'use client';

import type { ReactNode } from 'react';
import type { RegimeLikeForHistogram } from '@/components/simulateur/regimeVisualTokens';
import { HistogramBarLabeled } from '@/components/simulateur/HistogramBarLabeled';

/**
 * Ventilation PDF : panneau (breakdown, jusqu’au net mensuel/annuel) + histogramme aligné en bas
 * sur la même hauteur — sans flex-1 sur la rangée, pour éviter d’étirer la barre jusqu’au bas de page.
 */
export function PdfVentilationRow({
  children,
  regime,
}: {
  children: ReactNode;
  regime: RegimeLikeForHistogram;
}) {
  return (
    <div className="mt-2 flex flex-row items-stretch gap-3">
      <div className="min-w-0 flex-1">{children}</div>
      <div className="flex w-[200px] shrink-0 flex-col self-stretch">
        <p className="mb-1.5 shrink-0 text-[9px] font-black uppercase tracking-widest text-slate-500">
          Répartition du CA
        </p>
        <div className="flex min-h-0 flex-1 flex-col">
          <HistogramBarLabeled forPrint fillHeight regime={regime} />
        </div>
      </div>
    </div>
  );
}
