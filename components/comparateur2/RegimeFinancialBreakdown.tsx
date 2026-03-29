'use client';

import AmountTooltip from '@/components/AmountTooltip';
import { PLAFOND_MICRO_BNC, PLAFOND_MICRO_BIC } from '@/lib/constants';
import { getDetailTextFromLines } from '@/lib/financial';
import {
  buildCaRepartitionSegments,
  tooltipColorForRowKey,
} from '@/lib/simulateur/caRepartitionColors';
import { fmtEur } from '@/lib/utils';

function MiniStackedBar({
  ca,
  fees,
  cotis,
  ir,
  net,
  regimeId,
  portageCommission = 0,
  lines,
  cashInCompany,
}: {
  ca: number;
  fees: number;
  cotis: number;
  ir: number;
  net: number;
  regimeId: string;
  portageCommission?: number;
  lines?: { id?: string; amount?: number }[];
  cashInCompany?: number;
}) {
  const amounts = { fees, cotis, ir, net };
  const segs = buildCaRepartitionSegments(ca, amounts, {
    regimeId,
    portageCommission,
    lines,
    cashInCompany,
  });
  return (
    <div className="stacked-bar flex items-center gap-3 py-1">
      <div
        className="stacked-bar-inner overflow-hidden shrink-0 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50"
        style={{ width: 48, height: 72 }}
      >
        {segs.map((s) => (
          <div
            key={s.key}
            style={{ height: `${Math.max(0, s.pct)}%`, background: s.fill }}
            className="stacked-bar-segment transition-all duration-500 w-full"
            title={`${s.label} : ${Math.round(s.pct)}%`}
          />
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {segs.map((s) => (
          <span
            key={s.key}
            className="flex items-center gap-1.5 text-[8px] font-black leading-none whitespace-nowrap"
            style={{ color: s.ink }}
          >
            <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: s.fill }} />
            {s.label} {Math.round(s.pct)}%
          </span>
        ))}
      </div>
    </div>
  );
}

function RetirementBadge({ quarters, regimeId }: { quarters: number; regimeId: string }) {
  const validated = quarters >= 4;
  const label = validated ? '4 trim. retraite validés' : `~${quarters}/4 trim. retraite`;
  return (
    <span
      title={label}
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
    label: 'Charges (dépenses + optimisations)',
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
  if (regimeId === 'SASU') return 'Dividendes bruts (avant PFU)';
  return 'Rémunération nette (avant IR)';
}

function getRowBgClassCard(row: RowDef) {
  const r = row as RowDef & { highlight?: boolean; isFinal?: boolean; key?: string };
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
  if (row.key === 'fees' && r.id === 'Micro') return null;
  if (row.key === 'cotis' && r.id === 'SASU') return null;
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

export default function RegimeFinancialBreakdown({
  sim,
  regime,
  regimes,
}: {
  sim: any;
  regime: any;
  regimes: any[];
}) {
  const fmt = fmtEur;

  const hasAnyCashInCompany = regimes.some(
    (x: any) => x.cashInCompany != null && x.cashInCompany > 0,
  );
  const hasAnyFees = regimes.some(
    (x: any) => x.id !== 'Micro' && x.fees != null && x.fees > 0,
  );
  const hasAnyOptimisations = regimes.some((x: any) => {
    const lines = (x.lines as { id?: string; amount?: number }[] | undefined) ?? [];
    const ids = ['indemnites_km', 'loyer_percu', 'avantages'];
    const sum = lines
      .filter((l) => ids.includes(l.id ?? ''))
      .reduce((acc, l) => acc + (typeof l.amount === 'number' ? l.amount : 0), 0);
    return sum > 0;
  });
  const hasAnyPortageCommission = regimes.some((x: any) => {
    if (x.id !== 'Portage') return false;
    const lines = x.lines as { id?: string; amount?: number }[] | undefined;
    const commission = lines?.find((l) => l.id === 'portage_commission')?.amount ?? 0;
    return commission > 0;
  });

  const visibleRows = ROWS.filter((row) => {
    if (row.key === 'cashInCompany') return hasAnyCashInCompany;
    if (row.key === 'fees') return hasAnyFees;
    if (row.key === 'optimisations') return hasAnyOptimisations;
    if (row.key === 'portageCommission') return hasAnyPortageCommission;
    return true;
  });

  const getDetailText = (r: any, key: string, monthly: boolean): string =>
    getDetailTextFromLines(r, key, sim, monthly);

  const getMobileUnit = (row: RowDef) => (row.div === 12 ? '/mois' : '/an');

  const r = regime;
  const portageCommission =
    r.lines?.find((l: { id?: string; amount?: number }) => l.id === 'portage_commission')
      ?.amount ?? 0;

  return (
    <div className="space-y-4">
      {/* Détail des montants */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 overflow-hidden">
        <div className="px-3 py-2 border-b border-slate-200/50 dark:border-slate-700/50">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Ventilation détaillée
          </p>
        </div>
        <div className="p-2 space-y-1">
          {visibleRows.map((row) => {
            const val = getDisplayValue(r, row);
            const detailText = getDetailText(r, row.key, row.div === 12);
            const tooltipColor = getTooltipColor(row.key);
            const rowLabel = row.key === 'beforeTax' ? getBeforeTaxRowLabel(r.id) : row.label;
            const isFinal = (row as RowDef & { isFinal?: boolean }).isFinal;
            const rowColor = (row as RowDef & { color?: string }).color;
            const rowPrefix = (row as RowDef & { prefix?: string }).prefix;
            
            return (
              <div key={`${row.label}-${row.div}`}>
                <div
                  className={`flex items-baseline justify-between gap-2 rounded-lg px-2.5 py-1.5 transition-colors ${getRowBgClassCard(row)} ${isFinal ? 'ring-1 ring-emerald-200 dark:ring-emerald-800' : ''}`}
                >
                  <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex-1 min-w-0 leading-tight">
                    {rowLabel}
                  </p>
                  <span
                    className={`text-[10px] font-black shrink-0 text-right tabular-nums ${
                      isFinal
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : rowColor || 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {val === null ? (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    ) : (
                      <AmountTooltip
                        amount={val}
                        ca={r.ca}
                        detailText={detailText}
                        label={row.label}
                        color={tooltipColor}
                        position="bottom"
                      >
                        {rowPrefix && <span className="opacity-60">{rowPrefix}</span>}{' '}
                        {fmt(val)}
                        <span className="text-[8px] text-slate-400 ml-0.5 font-semibold">{getMobileUnit(row)}</span>
                      </AmountTooltip>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trimestres retraite */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-3 flex items-center gap-3">
        <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest shrink-0">
          Retraite
        </p>
        <RetirementBadge quarters={r.retirementQuarters ?? 0} regimeId={r.id} />
      </div>
    </div>
  );
}
