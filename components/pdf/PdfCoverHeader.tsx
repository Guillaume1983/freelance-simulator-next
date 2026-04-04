'use client';

import { cn } from '@/lib/utils';

/**
 * En-tête de couverture PDF : logo + marque + bloc titre (dégradé).
 * La source du logo est alignée sur le Header (`/logo-icon.png`).
 */
export function PdfCoverHeader({
  title,
  subtitle,
  badge,
}: {
  title: string;
  subtitle: string;
  /** Affiché au-dessus du nom de marque (ex. « Palier SEO »). Pas de valeur par défaut : évite le mot « export » sur la couverture. */
  badge?: string;
}) {
  return (
    <header className="mb-4">
      <div className="flex items-start gap-4 border-b border-slate-200 pb-4">
        {/* Même asset que components/Header — impression navigateur / PDF */}
        <img
          src="/logo-icon.png"
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 object-contain shrink-0"
        />
        <div className="min-w-0 pt-0.5">
          {badge ? (
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{badge}</p>
          ) : null}
          <p className={cn('text-xl font-black text-slate-900 tracking-tight', badge ? 'mt-1' : '')}>
            freelance-<span className="text-indigo-600">simulateur</span>
          </p>
        </div>
      </div>
      <div className="pdf-print-cover-card mt-4 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 p-5 text-white shadow-lg ring-1 ring-slate-900/10">
        <h1 className="text-[21px] font-black leading-snug tracking-tight">{title}</h1>
        <p className="mt-2 text-[12px] leading-relaxed text-indigo-100/95">{subtitle}</p>
      </div>
    </header>
  );
}
