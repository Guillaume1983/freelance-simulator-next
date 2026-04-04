'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * En-tête de page PDF (comparateur : un statut / simulateur : une année / palier).
 * Barre d’accent sous le titre + marge généreuse avant le bloc suivant.
 */
export function PdfStatutPageHeader({
  barClassName,
  title,
  caRight,
}: {
  barClassName: string;
  title: ReactNode;
  caRight: ReactNode;
}) {
  return (
    <header className="pdf-statut-page-header">
      <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2 pb-5">
        <h2 className="text-[24px] font-black leading-[1.15] tracking-tight text-slate-900">{title}</h2>
        <span className="text-[16px] font-black tabular-nums leading-none text-slate-800">{caRight}</span>
      </div>
      <div className={cn('h-2 w-full rounded-full', barClassName)} />
      <div className="h-6" aria-hidden />
    </header>
  );
}
