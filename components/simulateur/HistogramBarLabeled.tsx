'use client';

import {
  buildCaRepartitionSegments,
  shouldShowRepartitionPctLabel,
} from '@/lib/simulateur/caRepartitionColors';
import { cn } from '@/lib/utils';
import { REGIME_COLORS, type RegimeLikeForHistogram } from '@/components/simulateur/regimeVisualTokens';

/** Grande barre empilée avec labels et % inscrits dans chaque segment — même rendu comparateur / simulateur / palier. */
export function HistogramBarLabeled({
  regime,
  forPrint = false,
  fillHeight = false,
}: {
  regime: RegimeLikeForHistogram;
  /** Barre hauteur fixe, styles clairs pour export PDF (composants dans `components/pdf/`). */
  forPrint?: boolean;
  /** Avec `forPrint` : la barre remplit la hauteur du conteneur flex. */
  fillHeight?: boolean;
}) {
  const portageCommission = regime.lines?.find((l) => l.id === 'portage_commission')?.amount ?? 0;
  const segs = buildCaRepartitionSegments(
    regime.ca,
    { fees: regime.fees, cotis: regime.cotis, ir: regime.ir, net: regime.net },
    { regimeId: regime.id, portageCommission, lines: regime.lines, cashInCompany: regime.cashInCompany },
  );
  const colors = REGIME_COLORS[regime.id] ?? REGIME_COLORS.Portage;

  const printFill = forPrint && fillHeight;

  return (
    <div
      className={cn(
        'relative isolate',
        printFill ? 'h-full w-[200px] max-w-full mx-auto shrink-0 flex flex-col min-h-0' : 'mx-auto shrink-0',
        forPrint && !fillHeight ? 'w-[200px]' : '',
        !forPrint ? 'w-[216px] max-w-[min(216px,45vw)]' : '',
      )}
    >
      {!forPrint && (
        <div
          className={cn(
            'absolute -inset-3 rounded-3xl opacity-10 blur-2xl pointer-events-none -z-10',
            `bg-linear-to-b ${colors.gradient}`,
          )}
        />
      )}
      <div
        className={cn(
          'relative flex flex-col-reverse overflow-hidden rounded-2xl border-2 w-full transition-all duration-500',
          colors.border,
          forPrint ? 'bg-white border-slate-400 shadow-none' : 'shadow-xl bg-slate-50 dark:bg-slate-900/60',
        )}
        style={
          printFill
            ? { flex: '1 1 0%', minHeight: 0 }
            : { height: forPrint ? 300 : 'min(52vh, 420px)' }
        }
      >
        {segs.map((s) => {
          const showPctLabel = shouldShowRepartitionPctLabel(s.pct);
          return (
            <div
              key={s.key}
              style={{ height: `${Math.max(0, s.pct)}%`, background: s.fill }}
              className="w-full min-h-0 transition-all duration-500 relative flex items-center justify-center overflow-hidden"
            >
              {showPctLabel && s.pct >= 8 && (
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
              {showPctLabel && s.pct > 0 && s.pct < 8 && (
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
          );
        })}
      </div>
    </div>
  );
}
