'use client';
import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { FileText, BarChart3 } from 'lucide-react';
import { PLAFOND_MICRO_BNC, PLAFOND_MICRO_BIC } from '@/lib/constants';
import { getDetailTextFromLines } from '@/lib/financial';
import { fmtEur } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';
import ConnectorModal from '@/components/ConnectorModal';
import AmountTooltip from '@/components/AmountTooltip';

/* ── Pastilles de scroll mobile ── */
function ScrollDots({ total, active }: { total: number; active: number }) {
  return (
    <div className="flex justify-center items-center gap-1.5 py-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{ width: i === active ? 20 : 6, height: 6, background: i === active ? '#6366f1' : '#cbd5e1' }}
        />
      ))}
    </div>
  );
}

/* ── Style unifié pour tous les boutons export PDF ── */
const PDF_BTN = 'cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-[10px] font-black uppercase tracking-wide transition-all shadow-sm';

const REGIME_COLORS: Record<string, string> = {
  'Portage':  '#6366f1',
  'Micro':    '#f59e0b',
  'EURL IR':  '#10b981',
  'EURL IS':  '#3b82f6',
  'SASU':     '#8b5cf6',
};


/* ── Barre unique segmentée (Charges → Cotis → IR → Net) + labels à droite ── */
function StackedBar({ ca, fees, cotis, ir, net }: {
  ca: number; fees: number; cotis: number; ir: number; net: number;
}) {
  const total = Math.max(ca, 1);
  const segs = [
    { pct: (fees  / total) * 100, color: '#fb7185', label: 'Charges' },
    { pct: (cotis / total) * 100, color: '#fbbf24', label: 'Cotis'   },
    { pct: (ir    / total) * 100, color: '#f87171', label: 'Impôts'  },
    { pct: (net   / total) * 100, color: '#34d399', label: 'Net'     },
  ];
  return (
    <div className="stacked-bar flex items-center gap-3 py-1">
      {/* Barre */}
      <div
        className="stacked-bar-inner rounded-xl overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700"
        style={{ width: 56, height: 88 }}
      >
        {segs.map((s, i) => (
          <div
            key={i}
            style={{ height: `${Math.max(0, s.pct)}%`, background: s.color }}
            className="stacked-bar-segment transition-all duration-500 w-full"
            title={`${s.label} : ${Math.round(s.pct)}%`}
          />
        ))}
      </div>
      {/* Labels à droite */}
      <div className="stacked-bar-legend flex flex-col gap-1.5">
        {segs.map(s => (
          <span key={s.label} className="flex items-center gap-1.5 text-[8px] font-black leading-none whitespace-nowrap" style={{ color: s.color }}>
            <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: s.color }} />
            {s.label} {Math.round(s.pct)}%
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ComparisonTable({ sim }: { sim: any }) {
  const [activeCard, setActiveCard] = useState(0);
  const [showConnectorModal, setShowConnectorModal] = useState(false);
  const { isConnected } = useUser();

  const printRef      = useRef<HTMLDivElement>(null);
  const cardScrollRef = useRef<HTMLDivElement>(null);

  const onCardScroll = () => {
    const el = cardScrollRef.current;
    if (!el) return;
    const count = sim.resultats.length;
    const idx = Math.round(el.scrollLeft / (el.scrollWidth / count || 1));
    setActiveCard(Math.min(Math.max(idx, 0), Math.max(count - 1, 0)));
  };

  const scrollToCard = (index: number) => {
    const el = cardScrollRef.current;
    const count = sim.resultats.length;
    if (!el || count === 0) return;
    const safeIndex = Math.min(Math.max(index, 0), count - 1);
    const cardWidth = el.scrollWidth / count || 0;
    el.scrollTo({ left: safeIndex * cardWidth, behavior: 'smooth' });
    setActiveCard(safeIndex);
  };
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Comparatif-Statuts-FreelanceSimulateur',
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 8mm;
      }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    `,
  });

  const regimes = sim.resultats;
  const typeMicro = sim.state?.typeActiviteMicro ?? 'BNC';
  const plafondMicro = typeMicro === 'BNC' ? PLAFOND_MICRO_BNC : PLAFOND_MICRO_BIC;
  const isMicroPlafondExceeded = (r: any) => r.id === 'Micro' && r.ca > plafondMicro;
  const eligibleForWinner = regimes.filter((r: any) => !isMicroPlafondExceeded(r));
  const winnerId = eligibleForWinner.length > 0
    ? [...eligibleForWinner].sort((a: any, b: any) => b.net - a.net)[0].id
    : null;
  // Alias vers fmtEur (lib/utils) — formatage identique partout, sans hydratation mismatch
  const fmt = fmtEur;

  const getBeforeTaxRowLabel = (regimeId: string) => {
    if (regimeId === 'EURL IR') return 'Revenu imposable (avant IR)';
    if (regimeId === 'SASU') return 'Dividendes bruts (avant PFU)';
    return 'Rémunération nette (avant IR)';
  };

  const rows = [
    { label: 'CA annuel brut',                key: 'ca',             div: 1 },
    { label: 'Charges (dépenses + optimisations)', key: 'fees',      div: 1,  prefix: '-', color: 'text-rose-500' },
    { label: 'Commission de portage',         key: 'portageCommission', div: 1, prefix: '-', color: 'text-violet-600' },
    { label: 'Cotisations sociales',          key: 'cotis',          div: 1,  prefix: '-', color: 'text-amber-600' },
    { label: 'Base avant impôt',              key: 'beforeTax',      div: 1,  highlight: true },
    { label: 'Prélèvement fiscal perso (IR / PFU)', key: 'ir',       div: 1,  prefix: '-', color: 'text-rose-600' },
    { label: 'DISPONIBLE FINAL ANNUEL',       key: 'net',            div: 1,  isFinal: true, bigAmount: false, separatorAbove: true },
    { label: 'Dont optimisations (IK, loyer, avantages)', key: 'optimisations', div: 1, prefix: '', color: 'text-emerald-600' },
    { label: 'Trésorerie société (après IS)', key: 'cashInCompany',  div: 1,  prefix: '',  color: 'text-slate-500' },
    { label: 'DISPONIBLE FINAL MENSUEL',      key: 'net',            div: 12, isFinal: true, bigAmount: true },
  ];

  // Masquer complètement certaines lignes si elles sont vides pour tous les statuts
  const hasAnyCashInCompany = regimes.some((r: any) => r.cashInCompany != null && r.cashInCompany > 0);
  const hasAnyFees = regimes.some((r: any) => r.id !== 'Micro' && r.fees != null && r.fees > 0);
  const hasAnyOptimisations = regimes.some((r: any) => {
    const lines = (r.lines as any[] | undefined) ?? [];
    const ids = ['indemnites_km', 'loyer_percu', 'avantages'];
    const sum = lines
      .filter((l: any) => ids.includes(l.id))
      .reduce((acc: number, l: any) => acc + (typeof l.amount === 'number' ? l.amount : 0), 0);
    return sum > 0;
  });
  const hasAnyPortageCommission = regimes.some((r: any) => {
    if (r.id !== 'Portage') return false;
    const commission = r.lines?.find((l: any) => l.id === 'portage_commission')?.amount ?? 0;
    return commission > 0;
  });

  const visibleRows = rows.filter(r => {
    if (r.key === 'cashInCompany') return hasAnyCashInCompany;
    if (r.key === 'fees') return hasAnyFees;
    if (r.key === 'optimisations') return hasAnyOptimisations;
    if (r.key === 'portageCommission') return hasAnyPortageCommission;
    return true;
  });

  const getRowBgClass = (row: (typeof rows)[number]) => {
    const r = row as typeof row & { highlight?: boolean; isFinal?: boolean; key?: string };
    if (r.isFinal) return 'bg-indigo-50/60 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-black';
    if (r.highlight) return 'bg-slate-50/60 dark:bg-slate-800/30 font-bold';
    if (r.key === 'optimisations') return 'bg-emerald-50/50 dark:bg-emerald-900/25';
    if (r.key === 'cashInCompany') return 'bg-slate-50/50 dark:bg-slate-800/25';
    return '';
  };

  const getRowBgClassCard = (row: (typeof rows)[number]) => {
    const r = row as typeof row & { highlight?: boolean; isFinal?: boolean; key?: string };
    if (r.isFinal) return 'bg-indigo-50/70 dark:bg-indigo-900/35';
    if (r.highlight) return 'bg-slate-50/70 dark:bg-slate-800/35';
    if (r.key === 'optimisations') return 'bg-emerald-50/60 dark:bg-emerald-900/30';
    if (r.key === 'cashInCompany') return 'bg-slate-50/60 dark:bg-slate-800/30';
    return 'bg-slate-50/40 dark:bg-slate-900/20';
  };

  const getDisplayValue = (r: any, row: typeof rows[number]) => {
    if (row.key === 'portageCommission') {
      if (r.id !== 'Portage') return null;
      const commission = r.lines?.find((l: any) => l.id === 'portage_commission')?.amount ?? 0;
      return commission / row.div;
    }
    if (row.key === 'optimisations') {
      const lines = (r.lines as any[] | undefined) ?? [];
      const ids = ['indemnites_km', 'loyer_percu', 'avantages'];
      const sum = lines
        .filter((l: any) => ids.includes(l.id))
        .reduce((acc: number, l: any) => acc + (typeof l.amount === 'number' ? l.amount : 0), 0);
      if (sum === 0) return null;
      return sum / row.div;
    }
    // Micro : dépenses pro non déductibles → ne pas afficher "- 0 €"
    if (row.key === 'fees' && r.id === 'Micro') return null;
    // SASU : pas de cotisations sociales "classiques" dans ce modèle → ne pas afficher "- 0 €"
    if (row.key === 'cotis' && r.id === 'SASU') return null;
    const raw = r[row.key as keyof typeof r] as number | undefined;
    if (raw == null) return null;
    return raw / row.div;
  };
  const getMobileUnit   = (row: typeof rows[number]) => row.div === 12 ? '/mois' : '/an';

  const getDetailText = (r: any, key: string, monthly = false): string =>
    getDetailTextFromLines(r, key, sim, monthly);

  const getTooltipColor = (key: string): string => {
    switch (key) {
      case 'ca': return '#6366f1';
      case 'fees': return '#fb7185';
      case 'portageCommission': return '#8b5cf6';
      case 'cotis': return '#fbbf24';
      case 'beforeTax': return '#64748b';
      case 'ir': return '#f87171';
      case 'net': return '#34d399';
      case 'optimisations': return '#10b981';
      case 'cashInCompany': return '#3b82f6';
      default: return '#6366f1';
    }
  };

  const RetirementBadge = ({ quarters, regimeId }: { quarters: number; regimeId: string }) => {
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
  };

  return (
    <div className="overflow-visible bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none">

      {/* ── Vue desktop ── */}
      <div className="hidden md:block">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-linear-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-t-2xl border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            {/* Bouton PDF caché, déclenché depuis la barre de contrôle */}
            <button
              id="comparateur-pdf-btn"
              onClick={() => (isConnected ? handlePrint() : setShowConnectorModal(true))}
              className={`sr-only ${PDF_BTN}`}
            >
              <FileText size={11} /> Exporter PDF
            </button>
          </div>
        </div>
        <table className="w-full border-separate border-spacing-0 table-fixed">
          <thead>
            <tr className="bg-white dark:bg-slate-900">

              {/* Cellule haut-gauche */}
              <th className="p-5 text-left border-b border-slate-100 dark:border-slate-800 w-[200px] align-bottom">
                <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Métriques
                </h3>
              </th>

              {regimes.map((r: any) => (
                <th key={r.id} className="p-3 relative pt-10 border-b border-slate-100 dark:border-slate-800 align-top">
                  <div className={`header-band band-${r.class}`} />
                  {r.id === winnerId && !isMicroPlafondExceeded(r) && <div className="winner-badge">OPTIMUM</div>}
                  {isMicroPlafondExceeded(r) && <div className="plafond-badge">PLAFOND DÉPASSÉ</div>}

                  <div className="flex flex-col items-center gap-2">
                    {/* Nom */}
                    <span className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{r.id}</span>

                    {/* Montant net mensuel — hauteur fixe pour alignement */}
                    <div className="flex flex-col items-center min-h-[52px] justify-center">
                      <span className="text-2xl font-black text-slate-900 dark:text-white leading-none tabular-nums">
                        {fmt(r.net / 12)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 mt-0.5">net / mois</span>
                      {r.cashInCompany != null && r.cashInCompany > 0 ? (
                        <span className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                          + {fmt(r.cashInCompany)} trésorerie
                        </span>
                      ) : (
                        <span className="mt-1.5 invisible text-[8px]">—</span>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-slate-700 dark:text-slate-300">
            {visibleRows.map((row, idx) => {
              const isLast = idx === visibleRows.length - 1;
              const isFinal = (row as any).isFinal;
              return (
                <tr
                  key={idx}
                  className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30 ${getRowBgClass(row)} ${
                    isFinal && !isLast ? 'border-b-2 border-indigo-100 dark:border-indigo-900/50' : ''
                  }`}
                >
                  <td className="px-5 py-3 border-r border-slate-100 dark:border-slate-800">
                    <div className="font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wide leading-tight">
                      {row.label}
                    </div>
                  </td>
                  {regimes.map((r: any) => {
                    const val = getDisplayValue(r, row);
                    const detailText = getDetailText(r, row.key, row.div === 12);
                    const tooltipColor = getTooltipColor(row.key);
                    return (
                      <td
                        key={r.id}
                        className={`px-3 py-3 ${(row as any).color || ''}`}
                      >
                        <div className="w-full flex justify-center">
                          {(() => {
                            if (val === null) {
                              return (
                                <span className="inline-flex justify-end tabular-nums text-sm font-bold w-[88px] text-slate-300 dark:text-slate-600">
                                  —
                                </span>
                              );
                            }
                            const content = (
                              <>
                                {row.key === 'beforeTax' && (
                                  <div className="text-[8px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5 text-right">
                                    {getBeforeTaxRowLabel(r.id)}
                                  </div>
                                )}
                                <span className={isFinal ? 'text-indigo-600 dark:text-indigo-400' : ''}>
                                  {(row as any).prefix} {fmt(val)}
                                </span>
                              </>
                            );
                            return (
                              <AmountTooltip
                                amount={val}
                                ca={r.ca}
                                detailText={detailText}
                                label={row.label}
                                color={tooltipColor}
                              >
                                <div className="inline-flex flex-col items-end tabular-nums text-sm font-bold w-[88px]">
                                  {content}
                                </div>
                              </AmountTooltip>
                            );
                          })()}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* ── Ligne Trimestres retraite validés ── */}
            <tr className="bg-white dark:bg-slate-900">
              <td className="px-4 py-3 border-r border-slate-100 dark:border-slate-800 align-top">
                <div className="font-black text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-widest leading-tight">
                  Trimestres retraite<br />validés
                </div>
              </td>
              {regimes.map((r: any) => (
                <td key={r.id} className="px-3 py-3 text-center">
                  <RetirementBadge quarters={r.retirementQuarters} regimeId={r.id} />
                </td>
              ))}
            </tr>

            {/* ── Ligne Répartitions ── */}
            <tr className="bg-slate-50/20 dark:bg-slate-900/10">
              <td className="p-4">
                <div className="font-black text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-widest leading-tight">Répartitions</div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1.5">
                  {[
                    { color: '#fb7185', label: 'Charges' },
                    { color: '#fbbf24', label: 'Cotis' },
                    { color: '#f87171', label: 'IR' },
                    { color: '#34d399', label: 'Net' },
                  ].map(item => (
                    <span key={item.label} className="flex items-center gap-1 text-[7px] text-slate-400 font-bold">
                      <span className="w-2 h-2 rounded-sm inline-block" style={{ background: item.color }} />
                      {item.label}
                    </span>
                  ))}
                </div>
              </td>
                  {regimes.map((r: any) => (
                <td key={r.id} className="px-4 py-3">
                  <div className="flex justify-center">
                    <StackedBar ca={r.ca} fees={r.fees} cotis={r.cotis} ir={r.ir} net={r.net} />
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Vue mobile : cartes par régime ── */}
      <div className="block md:hidden p-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm shrink-0">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Comparatif stratégique
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Swipe ou utilisez les flèches pour comparer
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => (isConnected ? handlePrint() : setShowConnectorModal(true))}
              id="comparateur-pdf-btn-mobile"
              className={`sr-only ${PDF_BTN}`}
            >
              <FileText size={11} /> PDF
            </button>
          </div>
        </div>
        <div className="relative">
          {/* Flèches de navigation mobile */}
          <button
            type="button"
            onClick={() => scrollToCard(activeCard - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500 dark:text-slate-300"
            aria-label="Statut précédent"
          >
            <span className="text-xs">{'‹'}</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToCard(activeCard + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500 dark:text-slate-300"
            aria-label="Statut suivant"
          >
            <span className="text-xs">{'›'}</span>
          </button>

          <div
            ref={cardScrollRef}
            onScroll={onCardScroll}
            className="-mx-4 px-7 flex gap-4 overflow-x-auto overflow-y-hidden snap-x snap-mandatory pb-2 min-w-0 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
          >
            {regimes.map((r: any) => {
            const isWinner = r.id === winnerId;
            const color    = REGIME_COLORS[r.id] ?? '#6366f1';
            return (
              <div
                key={r.id}
                className="snap-center shrink-0 w-[min(calc(100vw-3.5rem),22rem)] max-w-sm relative border border-slate-200 dark:border-slate-700 overflow-hidden rounded-2xl bg-white dark:bg-[#020617] shadow-lg"
              >
                <div className="h-1 w-full" style={{ background: color }} />
                <div className="px-4 pt-4 pb-3 flex flex-col items-center text-center">
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300 mb-2">{r.id}</span>

                  {/* Montant net */}
                  <div className="text-3xl font-black dark:text-white leading-none tracking-tight mb-1">
                    <span className={isMicroPlafondExceeded(r) ? 'text-rose-500 dark:text-rose-400 line-through decoration-2' : ''}>
                      {fmt(r.net / 12)}<span className="text-[11px] text-slate-400 font-bold ml-1">/mois</span>
                    </span>
                  </div>

                  {/* Badges statut — hauteur fixe pour alignement */}
                  <div className="h-[24px] flex items-center justify-center gap-2 mb-1">
                    {isMicroPlafondExceeded(r) ? (
                      <span className="inline-flex items-center gap-1 bg-rose-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                        PLAFOND DÉPASSÉ
                      </span>
                    ) : isWinner ? (
                      <span className="inline-flex items-center gap-1 bg-indigo-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                        OPTIMUM
                      </span>
                    ) : (
                      <span className="invisible text-[9px]">—</span>
                    )}
                  </div>

                  {/* Badge retraite */}
                  <div className="mb-2">
                    <RetirementBadge quarters={r.retirementQuarters} regimeId={r.id} />
                  </div>

                  {r.cashInCompany != null && r.cashInCompany > 0 && (
                    <div className="mb-1 inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                      Trésorerie&nbsp;: {fmt(r.cashInCompany)} /an
                    </div>
                  )}
                  <StackedBar ca={r.ca} fees={r.fees} cotis={r.cotis} ir={r.ir} net={r.net} />
                </div>
                <div className="px-4 pb-2 space-y-1.5">
                  {visibleRows.map((row) => {
                    const val = getDisplayValue(r, row);
                    const detailText = getDetailText(r, row.key, row.div === 12);
                    const tooltipColor = getTooltipColor(row.key);
                    return (
                      <div key={row.label}>
                        <div className={`flex items-baseline justify-between gap-3 rounded-xl px-3 py-2 ${getRowBgClassCard(row)}`}>
                          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 flex-1">{row.key === 'beforeTax' ? getBeforeTaxRowLabel(r.id) : row.label}</p>
                          <span className={`text-[11px] font-black ${(row as any).isFinal ? 'text-indigo-700 dark:text-indigo-300' : (row as any).color || 'text-slate-800 dark:text-slate-100'}`}>
                            {val === null ? '—' : (
                              <AmountTooltip
                                amount={val}
                                ca={r.ca}
                                detailText={detailText}
                                label={row.label}
                                color={tooltipColor}
                                position="bottom"
                              >
                                {(row as any).prefix} {fmt(val)}
                                <span className="text-[9px] text-slate-400 ml-1">{getMobileUnit(row)}</span>
                              </AmountTooltip>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          </div>
        </div>
        <ScrollDots total={sim.resultats.length} active={activeCard} />
      </div>

      {/* ── PDF Comparatif (masqué) ── */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} style={{ fontFamily: 'Arial, sans-serif', padding: '10mm', fontSize: 10 }}>

          {/* En-tête */}
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <h1 style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>Comparatif statuts freelance 2026</h1>
            <p style={{ fontSize: 9, color: '#666', margin: '4px 0 0' }}>
              CA : {fmt(sim.state.tjm * sim.state.days)} · TJM {sim.state.tjm} € · {sim.state.days} j · {sim.state.taxParts} parts fiscales · freelance-simulateur.fr
            </p>
          </div>

          {/* Tableau chiffres */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Métrique</th>
                  {regimes.map((r: any) => (
                  <th key={r.id} style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: REGIME_COLORS[r.id] }}>{r.id}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, i) => (
                <tr
                  key={i}
                  style={{ background: (row as any).bigAmount ? '#eef2ff' : i % 2 === 0 ? '#fff' : '#f8fafc' }}
                >
                  <td
                    style={{
                      padding: '4px 7px',
                      fontWeight: (row as any).isFinal ? 900 : 600,
                      borderBottom: '1px solid #e2e8f0',
                      fontSize: 9,
                    }}
                  >
                    {row.label}
                  </td>
                    {regimes.map((r: any) => {
                    const val = getDisplayValue(r, row);
                    const sublabel = row.key === 'beforeTax' ? getBeforeTaxRowLabel(r.id) : null;
                    return (
                      <td
                        key={r.id}
                        style={{
                          padding: '4px 7px',
                          textAlign: 'right',
                          fontWeight: (row as any).isFinal ? 900 : 'normal',
                          borderBottom: '1px solid #e2e8f0',
                          fontSize: 9,
                          color: (row as any).isFinal ? '#4f46e5' : 'inherit',
                        }}
                      >
                        {sublabel ? (
                          <div style={{ fontSize: 7, color: '#94a3b8', marginBottom: 2 }}>{sublabel}</div>
                        ) : null}
                        {val === null ? '—' : `${(row as any).prefix ?? ''}${fmt(val)}${row.div === 12 ? '/mois' : ''}`}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Histogrammes */}
          {(() => {
            return (
              <div style={{ marginTop: 16 }}>
                <h2 style={{ fontSize: 11, fontWeight: 900, margin: '0 0 8px', borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>Répartition du CA par statut</h2>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  {regimes.map((r: any) => {
                    const total = Math.max(r.ca, 1);
                    const segs = [
                      { pct: (r.fees  / total) * 100, color: '#fb7185', label: 'Charges' },
                      { pct: (r.cotis / total) * 100, color: '#fbbf24', label: 'Cotis'   },
                      { pct: (r.ir    / total) * 100, color: '#f87171', label: 'Impôts'  },
                      { pct: (r.net   / total) * 100, color: '#34d399', label: 'Net'     },
                    ];
                    return (
                      <div key={r.id} style={{ textAlign: 'center', flex: 1 }}>
                        <p style={{ fontSize: 8, fontWeight: 900, margin: '0 0 4px', color: REGIME_COLORS[r.id] }}>{r.id}</p>
                        <div style={{ display: 'flex', width: '100%', height: 10, borderRadius: 4, overflow: 'hidden', background: '#e2e8f0' }}>
                          {segs.map((s, j) => (
                            <div
                              key={j}
                              style={{
                                width: `${Math.max(0, s.pct)}%`,
                                background: s.color,
                              }}
                            />
                          ))}
                        </div>
                        <div style={{ marginTop: 4 }}>
                          {segs.map(s => (
                            <div key={s.label} style={{ fontSize: 7, color: s.color, fontWeight: 700 }}>{s.label} {Math.round(s.pct)}%</div>
                          ))}
                        </div>
                        <p style={{ fontSize: 9, fontWeight: 900, color: '#34d399', margin: '4px 0 0' }}>{fmt(r.net / 12)}/mois</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <p style={{ fontSize: 7, color: '#999', marginTop: 12 }}>Simulation estimative — barèmes 2026. Ces simulations ne constituent pas un conseil fiscal.</p>
        </div>
      </div>

      <ConnectorModal
        open={showConnectorModal}
        onClose={() => setShowConnectorModal(false)}
        title="Connectez-vous pour débloquer"
        message="Connectez-vous ou créez un compte pour exporter en PDF et sauvegarder vos paramètres."
      />

    </div>
  );
}
