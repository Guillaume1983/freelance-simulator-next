'use client';

import { buildCaRepartitionSegments } from '@/lib/simulateur/caRepartitionColors';
import { cn } from '@/lib/utils';
import { REGIME_COLORS, type RegimeLikeForHistogram } from '@/components/simulateur/regimeVisualTokens';

/** Grande barre empilée avec labels et % inscrits dans chaque segment — même rendu comparateur / simulateur / palier. */
export function HistogramBarLabeled({ regime }: { regime: RegimeLikeForHistogram }) {
  const portageCommission = regime.lines?.find((l) => l.id === 'portage_commission')?.amount ?? 0;
  const segs = buildCaRepartitionSegments(
    regime.ca,
    { fees: regime.fees, cotis: regime.cotis, ir: regime.ir, net: regime.net },
    { regimeId: regime.id, portageCommission, lines: regime.lines, cashInCompany: regime.cashInCompany },
  );
  const colors = REGIME_COLORS[regime.id] ?? REGIME_COLORS.Portage;

  return (
    <div className="relative mx-auto w-[216px] max-w-[min(216px,45vw)] shrink-0 isolate">
      <div
        className={cn(
          'absolute -inset-3 rounded-3xl opacity-10 blur-2xl pointer-events-none -z-10',
          `bg-linear-to-b ${colors.gradient}`,
        )}
      />
      <div
        className={cn(
          'relative flex flex-col-reverse overflow-hidden rounded-2xl border-2 shadow-xl w-full transition-all duration-500',
          colors.border,
          'bg-slate-50 dark:bg-slate-900/60',
        )}
        style={{ height: 'min(52vh, 420px)' }}
      >
        {segs.map((s) => (
          <div
            key={s.key}
            style={{ height: `${Math.max(0, s.pct)}%`, background: s.fill }}
            className="w-full min-h-0 transition-all duration-500 relative flex items-center justify-center overflow-hidden"
          >
            {s.pct >= 8 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center px-1 pointer-events-none z-1">
                <span
                  className="text-[9px] sm:text-[10px] font-black leading-tight text-center line-clamp-2 wrap-break-word antialiased"
                  style={{ color: s.ink }}
                >
                  {s.label}
                </span>
                <span
                  className="text-[12px] font-black leading-none mt-0.5 antialiased tabular-nums"
                  style={{ color: s.ink }}
                >
                  {Math.round(s.pct)}%
                </span>
              </div>
            )}
            {s.pct > 0 && s.pct < 8 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-1 px-1">
                <div className="inline-flex max-w-[calc(100%-4px)] min-w-0 flex-row items-center justify-center gap-1">
                  <span
                    className="truncate text-left text-[7px] font-black leading-none antialiased"
                    style={{ color: s.ink }}
                    title={s.label}
                  >
                    {s.label}
                  </span>
                  <span className="shrink-0 text-[8px] font-black tabular-nums antialiased" style={{ color: s.ink }}>
                    {Math.round(s.pct)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
