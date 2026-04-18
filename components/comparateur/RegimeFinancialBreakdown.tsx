'use client';

import { useMemo } from 'react';
import AmountTooltip from '@/components/AmountTooltip';
import { getDetailTextFromLines } from '@/lib/financial';
import { tooltipColorForRowKey } from '@/lib/simulateur/caRepartitionColors';
import { cn, fmtEur } from '@/lib/utils';

export function RetirementBadge({
  quarters,
  regimeId,
}: {
  quarters: number;
  regimeId: string;
}) {
  const validated = quarters >= 4;
  const label = validated ? '4 trim. retraite validés' : `~${quarters}/4 trim. retraite`;
  const titleHint =
    'Indicateur simplifié (0 à 4) à partir de la base avant impôt et d’un seuil forfaitaire — pas le nombre légal de trimestres Urssaf. Détails : page Hypothèses, section Retraite.';
  return (
    <span
      title={`${label} · ${regimeId} — ${titleHint}`}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold cursor-default select-none ${
        validated
          ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
          : 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${validated ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      {label}
    </span>
  );
}

const ROWS = [
  { label: 'CA annuel brut', key: 'ca' as const, div: 1 as const },
  {
    label: 'Commission de portage',
    key: 'portageCommission' as const,
    div: 1 as const,
    prefix: '-',
    color: 'text-cyan-700 dark:text-cyan-400',
  },
  {
    /** Dépenses + CFE selon statut ; les IK/loyer/avantages sont détaillés sur la ligne « Dont optimisations ». */
    label: "Charges d'exploitation",
    key: 'fees' as const,
    div: 1 as const,
    prefix: '-',
    color: 'text-rose-500',
  },
  {
    label: 'Cotisations sociales',
    key: 'cotis' as const,
    div: 1 as const,
    prefix: '-',
    color: 'text-amber-600',
  },
  { label: 'Base avant impôt', key: 'beforeTax' as const, div: 1 as const, highlight: true },
  {
    label: 'Prélèvement fiscal perso (IR / PFU)',
    key: 'ir' as const,
    div: 1 as const,
    prefix: '-',
    color: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    label: 'DISPONIBLE FINAL ANNUEL',
    key: 'net' as const,
    div: 1 as const,
    isFinal: true,
    bigAmount: false,
    separatorAbove: true,
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    label: 'Dont optimisations (IK, loyer, avantages)',
    key: 'optimisations' as const,
    div: 1 as const,
    prefix: '',
    color: 'text-emerald-600',
  },
  {
    label: 'Trésorerie société (après IS)',
    key: 'cashInCompany' as const,
    div: 1 as const,
    prefix: '',
    color: 'text-slate-500',
  },
  {
    label: 'DISPONIBLE FINAL MENSUEL',
    key: 'net' as const,
    div: 12 as const,
    isFinal: true,
    bigAmount: true,
  },
];

type RowDef = (typeof ROWS)[number];

function getBeforeTaxRowLabel(regimeId: string) {
  if (regimeId === 'EURL IR') return 'Revenu imposable (avant IR)';
  if (regimeId === 'SASU') return 'Revenu brut (avant IR/PFU)';
  return 'Rémunération nette (avant IR)';
}

function getFeesRowLabel(regimeId: string) {
  if (regimeId === 'Micro') return 'Charges non déductibles';
  return "Charges d'exploitation";
}

function getRowBgClassCard(row: RowDef, forPrint: boolean) {
  const r = row as RowDef & { highlight?: boolean; isFinal?: boolean; key?: string };
  if (forPrint) {
    if (r.isFinal) return 'bg-emerald-50 border border-emerald-100';
    if (r.highlight) return 'bg-slate-50 border border-slate-100';
    if (r.key === 'optimisations') return 'bg-emerald-50/80 border border-emerald-100';
    if (r.key === 'cashInCompany') return 'bg-slate-50 border border-slate-100';
    return 'bg-slate-50/50 border border-slate-100';
  }
  if (r.isFinal) return 'bg-emerald-50/70 dark:bg-emerald-900/35';
  if (r.highlight) return 'bg-slate-50/70 dark:bg-slate-800/35';
  if (r.key === 'optimisations') return 'bg-emerald-50/60 dark:bg-emerald-900/30';
  if (r.key === 'cashInCompany') return 'bg-slate-50/60 dark:bg-slate-800/30';
  return 'bg-slate-50/40 dark:bg-slate-900/20';
}

function getDisplayValue(r: Record<string, unknown>, row: RowDef): number | null {
  if (row.key === 'portageCommission') {
    if (r.id !== 'Portage') return null;
    const lines = r.lines as { id?: string; amount?: number }[] | undefined;
    const commission = lines?.find((l) => l.id === 'portage_commission')?.amount ?? 0;
    return commission / row.div;
  }
  if (row.key === 'optimisations') {
    const lines = (r.lines as { id?: string; amount?: number }[] | undefined) ?? [];
    const ids = ['indemnites_km', 'loyer_percu', 'avantages'];
    const sum = lines
      .filter((l) => ids.includes(l.id ?? ''))
      .reduce((acc, l) => acc + (typeof l.amount === 'number' ? l.amount : 0), 0);
    if (sum === 0) return null;
    return sum / row.div;
  }
  /** Micro : CFE + dépenses catalogue (lignes) — affichage ; le net retranche les dépenses en trésorerie. */
  if (row.key === 'fees' && r.id === 'Micro') {
    const lines = r.lines as { id?: string; amount?: number }[] | undefined;
    const cfe = lines?.find((l) => l.id === 'micro_cfe')?.amount ?? 0;
    const dep = lines?.find((l) => l.id === 'micro_depenses_reelles')?.amount ?? 0;
    const sum = cfe + dep;
    if (sum <= 0) return null;
    return sum / row.div;
  }
  const raw = r[row.key] as number | undefined;
  if (raw == null) return null;
  return raw / row.div;
}

function getTooltipColor(key: string): string {
  const rep = tooltipColorForRowKey(key);
  if (rep) return rep;
  switch (key) {
    case 'ca':
      return '#6366f1';
    case 'beforeTax':
      return '#64748b';
    case 'optimisations':
      return '#10b981';
    case 'cashInCompany':
      return '#3b82f6';
    default:
      return '#6366f1';
  }
}

/**
 * Lignes pertinentes pour le statut affiché (pas de ligne « commission portage » sur Micro, etc.).
 */
function getVisibleRowsForRegime(regime: any): RowDef[] {
  const lines = (regime.lines as { id?: string; amount?: number }[] | undefined) ?? [];

  const portageCommission =
    regime.id === 'Portage'
      ? (lines.find((l) => l.id === 'portage_commission')?.amount ?? 0)
      : 0;

  const hasFees =
    (regime.fees ?? 0) > 0 ||
    ['sasu_cfe', 'eurl_ir_cfe', 'eurl_is_cfe', 'micro_cfe', 'micro_depenses_reelles'].some((id) => {
      const a = lines.find((l) => l.id === id)?.amount;
      return typeof a === 'number' && a > 0;
    });

  const optimisationsSum = lines
    .filter((l) => ['indemnites_km', 'loyer_percu', 'avantages'].includes(l.id ?? ''))
    .reduce((acc, l) => acc + (typeof l.amount === 'number' ? l.amount : 0), 0);

  const showCashInCompany =
    (regime.id === 'EURL IS' || regime.id === 'SASU') && (regime.cashInCompany ?? 0) > 0;

  /** SASU sans rémunération au titre du salaire : pas de cotisations TNS → ne pas afficher la ligne. */
  const showCotisSasu =
    regime.id !== 'SASU' || (typeof regime.cotis === 'number' ? regime.cotis : 0) > 0;

  return ROWS.filter((row) => {
    switch (row.key) {
      case 'ca':
      case 'beforeTax':
      case 'ir':
      case 'net':
        return true;
      case 'cotis':
        return showCotisSasu;
      case 'portageCommission':
        return regime.id === 'Portage' && portageCommission > 0;
      case 'fees':
        return hasFees;
      case 'optimisations':
        return optimisationsSum > 0;
      case 'cashInCompany':
        return showCashInCompany;
      default:
        return true;
    }
  });
}

export default function RegimeFinancialBreakdown({
  sim,
  regime,
  forPrint = false,
  className,
}: {
  sim: any;
  regime: any;
  /** PDF : pas de tooltips, thème clair, détails sous chaque ligne. */
  forPrint?: boolean;
  className?: string;
}) {
  const fmt = fmtEur;

  const visibleRows = useMemo(() => getVisibleRowsForRegime(regime), [regime]);

  const isDisponibleFinalRow = (row: RowDef) =>
    (row as RowDef & { isFinal?: boolean }).isFinal === true && row.key === 'net';

  const idxAnnuel = visibleRows.findIndex(
    (row) => isDisponibleFinalRow(row) && row.div === 1,
  );
  const idxMensuel = visibleRows.findIndex(
    (row) => isDisponibleFinalRow(row) && row.div === 12,
  );

  const hasPinnedDisponible =
    idxAnnuel >= 0 &&
    idxMensuel >= 0 &&
    idxMensuel > idxAnnuel;

  const scrollRows = hasPinnedDisponible
    ? [
        ...visibleRows.slice(0, idxAnnuel),
        ...visibleRows.slice(idxAnnuel + 1, idxMensuel),
      ]
    : visibleRows;

  const bottomRows = hasPinnedDisponible
    ? [visibleRows[idxAnnuel]!, visibleRows[idxMensuel]!]
    : [];

  const getDetailText = (r: any, key: string, monthly: boolean): string =>
    getDetailTextFromLines(r, key, sim, monthly);

  const getMobileUnit = (row: RowDef) => (row.div === 12 ? '/m' : '/an');

  const r = regime;

  const rowBg = (row: RowDef) => getRowBgClassCard(row, forPrint);

  return (
    <div
      className={cn(
        forPrint
          ? 'rounded-xl border border-slate-300 bg-white overflow-hidden flex flex-col'
          : 'rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 overflow-hidden lg:h-[min(52vh,420px)] flex flex-col',
        className,
      )}
    >
      <div
        className={
          forPrint
            ? 'px-3 py-2 border-b border-slate-200 shrink-0 bg-slate-50'
            : 'px-3 py-2 border-b border-slate-200/50 dark:border-slate-700/50 shrink-0'
        }
      >
        <p
          className={
            forPrint
              ? 'text-[11px] font-black uppercase tracking-widest text-slate-600'
              : 'text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400'
          }
        >
          Ventilation détaillée
        </p>
      </div>
      <div className="flex flex-col flex-1 min-h-0">
        <div
          className={
            forPrint
              ? 'p-2 space-y-1'
              : 'p-2 space-y-0.5 lg:space-y-1 lg:overflow-y-auto min-h-0 lg:flex-1'
          }
        >
          {scrollRows.map((row) => {
            const val = getDisplayValue(r, row);
            const detailText = getDetailText(r, row.key, row.div === 12);
            const tooltipColor = getTooltipColor(row.key);
            const rowLabel =
              row.key === 'beforeTax'
                ? getBeforeTaxRowLabel(r.id)
                : row.key === 'fees'
                  ? getFeesRowLabel(r.id)
                  : row.label;
            const isFinal = (row as RowDef & { isFinal?: boolean }).isFinal;
            const rowColor = (row as RowDef & { color?: string }).color;
            const rowPrefix = (row as RowDef & { prefix?: string }).prefix;

            return (
              <div key={`${row.label}-${row.div}`}>
                <div
                  className={`flex items-baseline justify-between gap-2 rounded-lg px-2.5 py-1 lg:py-1.5 transition-colors ${rowBg(row)} ${isFinal && !forPrint ? 'ring-1 ring-emerald-200 dark:ring-emerald-800' : ''} ${isFinal && forPrint ? 'ring-1 ring-emerald-200' : ''}`}
                >
                  <p
                    className={
                      forPrint
                        ? 'text-[10px] font-bold uppercase tracking-wide text-slate-600 flex-1 min-w-0 leading-tight'
                        : 'text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex-1 min-w-0 leading-tight'
                    }
                  >
                    {rowLabel}
                  </p>
                  <span
                    className={`text-[12px] font-black shrink-0 text-right tabular-nums ${
                      isFinal
                        ? forPrint
                          ? 'text-emerald-700'
                          : 'text-emerald-600 dark:text-emerald-400'
                        : forPrint
                          ? 'text-slate-800'
                          : rowColor || 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {val === null ? (
                      <span className={forPrint ? 'text-slate-300' : 'text-slate-300 dark:text-slate-600'}>–</span>
                    ) : forPrint ? (
                      <span>
                        {rowPrefix && <span className="opacity-60">{rowPrefix}</span>}{' '}
                        {fmt(val)}
                        <span className="text-[9px] text-slate-500 ml-0.5 font-semibold">{getMobileUnit(row)}</span>
                      </span>
                    ) : (
                      <AmountTooltip
                        amount={val}
                        ca={r.ca}
                        detailText={detailText}
                        label={rowLabel}
                        color={tooltipColor}
                        position="bottom"
                      >
                        {rowPrefix && <span className="opacity-60">{rowPrefix}</span>}{' '}
                        {fmt(val)}
                        <span className="text-[9px] text-slate-400 ml-0.5 font-semibold">{getMobileUnit(row)}</span>
                      </AmountTooltip>
                    )}
                  </span>
                </div>
                {forPrint && detailText ? (
                  <p className="text-[8px] text-slate-500 leading-snug pl-1 pr-1 mt-0.5 mb-1">{detailText}</p>
                ) : null}
              </div>
            );
          })}
        </div>
        {bottomRows.length > 0 && (
          <div
            className={
              forPrint
                ? 'shrink-0 border-t border-slate-200 bg-slate-50 px-2 pb-2 pt-2 space-y-1'
                : 'shrink-0 lg:border-t lg:border-slate-200/70 lg:dark:border-slate-600/50 lg:bg-slate-50/80 lg:dark:bg-slate-800/40 px-2 pb-2 lg:p-2 lg:pt-1.5 space-y-0.5 lg:space-y-1'
            }
          >
            {bottomRows.map((row) => {
              const val = getDisplayValue(r, row);
              const detailText = getDetailText(r, row.key, row.div === 12);
              const tooltipColor = getTooltipColor(row.key);
              const rowLabel =
                row.key === 'beforeTax'
                  ? getBeforeTaxRowLabel(r.id)
                  : row.key === 'fees'
                    ? getFeesRowLabel(r.id)
                    : row.label;
              const isFinal = (row as RowDef & { isFinal?: boolean }).isFinal;
              const rowColor = (row as RowDef & { color?: string }).color;
              const rowPrefix = (row as RowDef & { prefix?: string }).prefix;

              return (
                <div key={`${row.label}-${row.div}`}>
                  <div
                    className={`flex items-baseline justify-between gap-2 rounded-lg px-2.5 py-1 lg:py-1.5 transition-colors ${rowBg(row)} ${isFinal && !forPrint ? 'ring-1 ring-emerald-200 dark:ring-emerald-800' : ''} ${isFinal && forPrint ? 'ring-1 ring-emerald-200' : ''}`}
                  >
                    <p
                      className={
                        forPrint
                          ? 'text-[10px] font-bold uppercase tracking-wide text-slate-600 flex-1 min-w-0 leading-tight'
                          : 'text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex-1 min-w-0 leading-tight'
                      }
                    >
                      {rowLabel}
                    </p>
                    <span
                      className={`text-[12px] font-black shrink-0 text-right tabular-nums ${
                        isFinal
                          ? forPrint
                            ? 'text-emerald-700'
                            : 'text-emerald-600 dark:text-emerald-400'
                          : forPrint
                            ? 'text-slate-800'
                            : rowColor || 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {val === null ? (
                        <span className={forPrint ? 'text-slate-300' : 'text-slate-300 dark:text-slate-600'}>–</span>
                      ) : forPrint ? (
                        <span>
                          {rowPrefix && <span className="opacity-60">{rowPrefix}</span>}{' '}
                          {fmt(val)}
                          <span className="text-[9px] text-slate-500 ml-0.5 font-semibold">{getMobileUnit(row)}</span>
                        </span>
                      ) : (
                        <AmountTooltip
                          amount={val}
                          ca={r.ca}
                          detailText={detailText}
                          label={rowLabel}
                          color={tooltipColor}
                          position="top"
                        >
                          {rowPrefix && <span className="opacity-60">{rowPrefix}</span>}{' '}
                          {fmt(val)}
                          <span className="text-[9px] text-slate-400 ml-0.5 font-semibold">{getMobileUnit(row)}</span>
                        </AmountTooltip>
                      )}
                    </span>
                  </div>
                  {forPrint && detailText ? (
                    <p className="text-[8px] text-slate-500 leading-snug pl-1 pr-1 mt-0.5 mb-1">{detailText}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
