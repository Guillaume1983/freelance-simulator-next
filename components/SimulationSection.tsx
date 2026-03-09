'use client';
import React, { useRef, useMemo, useState } from 'react';

import { useReactToPrint } from 'react-to-print';
import { projeterSurNAns } from '@/lib/projections';
import { getDetailTextFromLines } from '@/lib/financial';
import { fmtEur } from '@/lib/utils';
import { FileBarChart2, FileText, Eye, EyeOff, ChevronLeft, ChevronRight, Rocket, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import ConnectorModal from '@/components/ConnectorModal';
import AmountTooltip from '@/components/AmountTooltip';

/* ── Pastilles de scroll mobile ── */
function ScrollDots({ total, active, color }: { total: number; active: number; color: string }) {
  return (
    <div className="flex justify-center items-center gap-1.5 py-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{ width: i === active ? 20 : 6, height: 6, background: i === active ? color : '#cbd5e1' }}
        />
      ))}
    </div>
  );
}

/* ── Style unifié pour tous les boutons export PDF (aligné sur ComparisonTable) ── */
const PDF_BTN = 'cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-[10px] font-black uppercase tracking-wide transition-all shadow-sm';

const REGIME_COLORS: Record<string, string> = {
  'Portage':  '#6366f1',
  'Micro':    '#f59e0b',
  'EURL IR':  '#10b981',
  'EURL IS':  '#3b82f6',
  'SASU':     '#8b5cf6',
};

const PROJECTION_ANALYSIS: Record<string, { forts: string[]; vigilance: string[] }> = {
  Portage: {
    forts: [
      'Simulation très lisible : net = CA – frais de gestion – cotisations classiques.',
      'Stabilité forte du pouvoir d’achat sur 5 ans (peu de surprise fiscale).',
      'Protection chômage (ARE) qui sécurise les années de croissance incertaine.',
    ],
    vigilance: [
      'Les frais de gestion (5–10 % du CA) pèsent sur le net à long terme.',
      'Peu de marge de manœuvre pour capitaliser de la trésorerie en société.',
    ],
  },
  Micro: {
    forts: [
      'Croissance très simple à suivre : charges proportionnelles au CA.',
      'Aucune complexité de gestion, même avec une forte hausse de CA.',
      'Idéal pour tester l’activité sur 1 à 2 ans avant de basculer en société.',
    ],
    vigilance: [
      'Plafond micro : au-delà, bascule obligatoire et changement complet de régime.',
      'Les dépenses réelles ne sont jamais déductibles, même si elles augmentent avec le CA.',
    ],
  },
  'EURL IR': {
    forts: [
      'Permet d’absorber une hausse de charges réelles (matériel, loyer, IK) sans exploser l’impôt.',
      'Bonne lisibilité du couple revenu net / IR sur plusieurs années.',
      'Structure prête pour l’embauche ou une éventuelle bascule en IS.',
    ],
    vigilance: [
      'Cotisations TNS qui restent élevées même en cas de baisse ponctuelle de CA.',
      'Nécessité d’anticiper la trésorerie pour payer les appels de cotisations et d’IR différés.',
    ],
  },
  'EURL IS': {
    forts: [
      "Très bon outil pour lisser la rémunération dans le temps (salaire + trésorerie société).",
      'Possibilité de lisser la croissance en laissant une partie du bénéfice en société.',
      'Permet de financer des projets (achat matériel, croissance) sur plusieurs années.',
    ],
    vigilance: [
      'Double niveau d’imposition (IS puis IR / PFU) à bien piloter sur la durée.',
      'Demande un suivi rapproché avec un expert-comptable pour garder le cap sur 3–5 ans.',
    ],
  },
  SASU: {
    forts: [
      'Statut “premium” qui se projette bien sur des TJM élevés et des missions longues.',
      'Souplesse pour mixer salaire et dividendes en fonction des années.',
      'Bonne protection sociale sur la durée (assimilé salarié).',
    ],
    vigilance: [
      'Coût global charges + IS + PFU à surveiller dans les scénarios de forte croissance.',
      'Pas d’ARE sur la fin de mandat : à intégrer dans la stratégie de sortie.',
    ],
  },
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

export default function SimulationSection({
  sim,
  activeRegime,
  setActiveRegime,
  singleRegime = false,
  growthByYear,
}: {
  sim: any;
  activeRegime: string;
  setActiveRegime: (id: string) => void;
  /** true sur les pages simulateur (un seul statut) : masque les pastilles et le bloc SIMULATIONS / nom / +% */
  singleRegime?: boolean;
  growthByYear: number[];
}) {
  const printBizRef    = useRef<HTMLDivElement>(null);
  const yearScrollRef  = useRef<HTMLDivElement>(null);
  const [activeYear, setActiveYear]     = useState(0);
  const [showConnectorModal, setShowConnectorModal] = useState(false);
  const { isConnected } = useUser();

  const handlePrintBiz = useReactToPrint({
    contentRef: printBizRef,
    documentTitle: 'BusinessPlan-Simulation5ans-FreelanceSimulateur',
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

  const simulations = useMemo(
    () =>
      projeterSurNAns(
        {
          tjm: sim.state.tjm,
          days: sim.state.days,
          taxParts: sim.state.taxParts,
          spouseIncome: sim.state.spouseIncome,
          kmAnnuel: sim.state.kmAnnuel,
          cvFiscaux: sim.state.cvFiscaux,
          typeVehicule: sim.state.typeVehicule ?? 'voiture',
          vehiculeElectrique: sim.state.vehiculeElectrique ?? false,
          loyerPercu: sim.state.loyerPercu,
          activeCharges: sim.state.activeCharges,
          sectionsActive: sim.state.sectionsActive,
          portageComm: sim.state.portageComm,
          chargeAmounts: sim.state.chargeAmounts,
          acreEnabled: sim.state.acreEnabled,
          citySize: sim.state.citySize,
          growthRate: sim.state.growthRate / 100,
          materielAnnuel: sim.state.materielAnnuel,
          avantagesOptimises: sim.state.avantagesOptimises,
          typeActiviteMicro: sim.state.typeActiviteMicro,
          prelevementLiberatoire: sim.state.prelevementLiberatoire,
          remunerationDirigeantMensuelle: sim.state.remunerationDirigeantMensuelle,
          repartitionRemuneration: sim.state.repartitionRemuneration,
        },
        growthByYear.map(v => (v ?? 0) / 100),
      ),
    [sim.state, growthByYear],
  );

  // Alias vers fmtEur — formatage identique partout, sans hydratation mismatch
  const fmt = fmtEur;

  const onYearScroll = () => {
    const el = yearScrollRef.current;
    if (!el) return;
    const count = simulations.length;
    const idx = Math.round(el.scrollLeft / (el.scrollWidth / count));
    setActiveYear(Math.min(idx, count - 1));
  };

  const getBeforeTaxRowLabel = (regimeId: string) => {
    if (regimeId === 'EURL IR') return 'Revenu imposable (avant IR)';
    if (regimeId === 'SASU') return 'Dividendes bruts (avant PFU)';
    return 'Rémunération nette (avant IR)';
  };

  const baseRows = [
    { label: 'CA annuel brut',               key: 'ca',        prefix: '',  color: '',               highlight: false, isFinal: false, monthly: false },
    { label: 'Charges (dépenses + optimisations)', key: 'fees',      prefix: '-', color: 'text-rose-500',  highlight: false, isFinal: false, monthly: false },
    { label: 'Commission de portage',        key: 'portageCommission', prefix: '-', color: 'text-violet-600', highlight: false, isFinal: false, monthly: false },
    { label: 'Cotisations sociales',         key: 'cotis',     prefix: '-', color: 'text-amber-600', highlight: false, isFinal: false, monthly: false },
    { label: 'Base avant impôt',             key: 'beforeTax', prefix: '',  color: '',               highlight: true,  isFinal: false, monthly: false },
    { label: 'Prélèvement fiscal perso (IR / PFU)', key: 'ir',  prefix: '-', color: 'text-rose-600',  highlight: false, isFinal: false, monthly: false },
    { label: 'DISPONIBLE FINAL ANNUEL',      key: 'net',       prefix: '',  color: '',               highlight: false, isFinal: true,  monthly: false, bigAmount: false, separatorAbove: true },
    { label: 'Dont optimisations (IK, loyer, avantages)', key: 'optimisations', prefix: '', color: 'text-emerald-600', highlight: false, isFinal: false, monthly: false },
    { label: 'Trésorerie société (après IS)', key: 'cashInCompany', prefix: '',  color: 'text-slate-500', highlight: false, isFinal: false, monthly: false },
    { label: 'DISPONIBLE FINAL MENSUEL',     key: 'net',       prefix: '',  color: '',               highlight: false, isFinal: true,  monthly: true,  bigAmount: true },
  ];

  // Masquer certaines lignes si elles sont vides sur 5 ans pour le régime actif
  const hasAnyCashInCompany = simulations.some(yr => {
    const r = yr.find((x: any) => x.id === activeRegime) as any;
    return r && r.cashInCompany != null && r.cashInCompany > 0;
  });
  const hasAnyFees = simulations.some(yr => {
    const r = yr.find((x: any) => x.id === activeRegime) as any;
    if (!r) return false;
    if (activeRegime === 'Micro') return false;
    return r.fees != null && r.fees > 0;
  });
  const hasAnyOptimisations = simulations.some(yr => {
    const r = yr.find((x: any) => x.id === activeRegime) as any;
    if (!r) return false;
    const lines = (r.lines as any[] | undefined) ?? [];
    const ids = ['indemnites_km', 'loyer_percu', 'avantages'];
    const sum = lines
      .filter((l: any) => ids.includes(l.id))
      .reduce((acc: number, l: any) => acc + (typeof l.amount === 'number' ? l.amount : 0), 0);
    return sum > 0;
  });
  const hasAnyPortageCommission = simulations.some(yr => {
    const r = yr.find((x: any) => x.id === activeRegime) as any;
    if (!r || activeRegime !== 'Portage') return false;
    const commission = r.lines?.find((l: any) => l.id === 'portage_commission')?.amount ?? 0;
    return commission > 0;
  });
  const rows = baseRows.filter(row => {
    if (row.key === 'cashInCompany') return hasAnyCashInCompany;
    if (row.key === 'portageCommission') return hasAnyPortageCommission;
    // Micro : optimisations non déductibles → masquer totalement la ligne
    if (row.key === 'optimisations' && activeRegime === 'Micro') return false;
    // Micro : pas de ligne « Charges (dépenses + optimisations) » dans les simulations
    if (row.key === 'fees' && activeRegime === 'Micro') return false;
    if (row.key === 'fees') return hasAnyFees;
    if (row.key === 'optimisations') return hasAnyOptimisations;
    return true;
  });

  const regimeColor = REGIME_COLORS[activeRegime] ?? '#6366f1';
  const allRegimes  = sim.resultats.map((r: any) => r.id);
  const regimeClass = simulations[0]?.find((x: any) => x.id === activeRegime)?.class ?? 'portage';

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

  const getRegimePhrase = (id: string) => {
    if (id === 'Portage') return 'au portage salarial';
    if (id === 'Micro') return 'à la micro‑entreprise';
    if (id === 'EURL IR' || id === 'EURL IS') return 'à l’EURL (IR ou IS)';
    if (id === 'SASU') return 'à la SASU';
    return 'à ce statut';
  };

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

  const getRowBgClass = (row: (typeof rows)[number]) => {
    if (row.isFinal) return 'bg-indigo-50/60 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-black';
    if (row.highlight) return 'bg-slate-50/60 dark:bg-slate-800/30 font-bold';
    if (row.key === 'optimisations') return 'bg-emerald-50/50 dark:bg-emerald-900/25';
    if (row.key === 'cashInCompany') return 'bg-slate-50/50 dark:bg-slate-800/25';
    return '';
  };

  const getRowBgClassCard = (row: (typeof rows)[number]) => {
    if (row.isFinal) return 'bg-indigo-50/70 dark:bg-indigo-900/35';
    if (row.highlight) return 'bg-slate-50/70 dark:bg-slate-800/35';
    if (row.key === 'optimisations') return 'bg-emerald-50/60 dark:bg-emerald-900/30';
    if (row.key === 'cashInCompany') return 'bg-slate-50/60 dark:bg-slate-800/30';
    return 'bg-slate-50/40 dark:bg-slate-900/20';
  };

  return (
    <div className="overflow-visible bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">

      {/* ── Barre de contrôle supplémentaire (multi‑statuts uniquement) ── */}
      {!singleRegime && (
        <div className="px-4 md:px-6 py-3 flex flex-wrap items-center gap-4 md:gap-6 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 rounded-t-2xl">

          {/* Sélecteur de régime — desktop */}
          <div className="hidden md:flex gap-1 flex-wrap">
            {allRegimes.map((id: string) => (
              <button
                key={id}
                onClick={() => setActiveRegime(id)}
                className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border transition-colors ${
                  activeRegime === id ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
                style={{
                  background:  activeRegime === id ? REGIME_COLORS[id] : 'transparent',
                  borderColor: REGIME_COLORS[id],
                }}
              >
                {id}
              </button>
            ))}
          </div>

        </div>
      )}

      {/* ── Tableau Simulations (desktop) — même rendu que ComparisonTable ── */}
      <div className="overflow-visible bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-700/50 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div className="hidden md:block">
          {/* Barre d'en-tête (alignée comparateur) */}
          <div className="flex items-center justify-between px-6 py-3 bg-linear-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-t-3xl border-b border-slate-200/80 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              {/* Bouton PDF caché, déclenché depuis la barre de contrôle */}
              <button
                id="simulateur-pdf-btn"
                onClick={() => (isConnected ? handlePrintBiz() : setShowConnectorModal(true))}
                className={`sr-only ${PDF_BTN}`}
              >
                <FileText size={11} /> Exporter PDF
              </button>
            </div>
          </div>
          <table className="w-full border-separate border-spacing-0 table-fixed">
            <thead>
              <tr className="bg-white dark:bg-slate-900">
                <th className="p-5 text-left border-b border-slate-100 dark:border-slate-800 w-[200px] align-bottom">
                  <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Métriques
                  </h3>
                </th>
                {simulations.map((yr, i) => {
                  const r = yr.find((x: any) => x.id === activeRegime);
                  return (
                    <th key={i} className="p-3 relative pt-10 border-b border-slate-100 dark:border-slate-800 align-top min-w-[130px]">
                      <div className={`header-band band-${regimeClass}`} />
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                          Année {i + 1}
                        </span>
                        <div className="flex flex-col items-center min-h-[52px] justify-center">
                          <span className="text-2xl font-black text-slate-900 dark:text-white leading-none tabular-nums">
                            {r ? fmt(r.net / 12) : '—'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 mt-0.5">net / mois</span>
                          {r && r.cashInCompany != null && r.cashInCompany > 0 ? (
                            <span className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                              + {fmt(r.cashInCompany)} trésorerie
                            </span>
                          ) : (
                            <span className="mt-1.5 invisible text-[8px]">—</span>
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="text-slate-700 dark:text-slate-300">
              {rows.map((row, idx) => {
                const isLast = idx === rows.length - 1;
                const isFinal = (row as any).isFinal;
                return (
                  <React.Fragment key={idx}>
                    <tr className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30 ${getRowBgClass(row)} ${isFinal && !isLast ? 'border-b-2 border-indigo-100 dark:border-indigo-900/50' : ''}`}>
                      <td className="px-5 py-3 border-r border-slate-100 dark:border-slate-800">
                        <div className="font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wide leading-tight">{row.label}</div>
                      </td>
                      {simulations.map((yr, i) => {
                        const r = yr.find((x: any) => x.id === activeRegime) as any;
                        let val: number | null = null;
                        if (row.key === 'optimisations') {
                          const lines = (r?.lines as any[] | undefined) ?? [];
                          const ids = ['indemnites_km', 'loyer_percu', 'avantages'];
                          const sum = lines
                            .filter((l: any) => ids.includes(l.id))
                            .reduce((acc: number, l: any) => acc + (typeof l.amount === 'number' ? l.amount : 0), 0);
                          val = sum > 0 ? sum : null;
                        } else {
                          val = r ? (row.monthly ? r[row.key] / 12 : r[row.key]) : null;
                        }
                        if (row.key === 'portageCommission') {
                          if (activeRegime !== 'Portage') val = null;
                          else val = r?.lines?.find((l: any) => l.id === 'portage_commission')?.amount ?? 0;
                        }
                        if (row.key === 'fees' && r?.id === 'Micro') val = null;
                        if (row.key === 'cotis' && r?.id === 'SASU') val = null;
                        if (row.key === 'cashInCompany' && (r?.cashInCompany == null || r?.cashInCompany === 0)) val = null;
                        const detailText = r ? getDetailText(r, row.key, row.monthly) : '';
                        const tooltipColor = getTooltipColor(row.key);
                        return (
                          <td
                            key={i}
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
                                        {getBeforeTaxRowLabel(activeRegime)}
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
                  </React.Fragment>
                );
              })}

              {/* ── Ligne Trimestres retraite validés ── */}
              <tr className="bg-white dark:bg-slate-900">
                <td className="px-4 py-3 border-r border-slate-100 dark:border-slate-800 align-top">
                  <div className="font-black text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-widest leading-tight">
                    Trimestres retraite<br />validés
                  </div>
                </td>
                {simulations.map((yr, i) => {
                  const r = yr.find((x: any) => x.id === activeRegime) as any;
                  return (
                    <td key={i} className="px-3 py-3 text-center">
                      {r ? (
                        <RetirementBadge quarters={r.retirementQuarters ?? 0} regimeId={activeRegime} />
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* ── Ligne Répartitions (alignée comparateur) ── */}
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
                {simulations.map((yr, i) => {
                  const r = yr.find((x: any) => x.id === activeRegime) as any;
                  return (
                    <td key={i} className="px-4 py-3">
                      <div className="flex justify-center">
                        <StackedBar ca={r?.ca ?? 0} fees={r?.fees ?? 0} cotis={r?.cotis ?? 0} ir={r?.ir ?? 0} net={r?.net ?? 0} />
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Vue mobile : cartes par année ── */}
      <div className="block md:hidden">

        {/* Cartes années (scroll horizontal snap) */}
        <div
          ref={yearScrollRef}
          onScroll={onYearScroll}
          className="px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 pt-4"
        >
          {simulations.map((yr, i) => {
            const r = yr.find((x: any) => x.id === activeRegime) as any;
            return (
              <div
                key={i}
                className="snap-center shrink-0 w-[calc(100vw-3rem)] max-w-sm overflow-hidden rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-lg"
              >
                {/* Bande couleur + header */}
                <div className="h-1 w-full" style={{ background: regimeColor }} />
                <div className="px-4 pt-4 pb-3 flex flex-col items-center text-center border-b dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Année {i + 1}</span>
                  {i === 0 && sim.state.acreEnabled && activeRegime !== 'Portage'
                    ? <span className="text-[8px] text-emerald-500 font-black mt-0.5">ACRE −50% cotis</span>
                    : i > 0
                      ? <span className="text-[8px] text-slate-400 font-bold mt-0.5">+CFE</span>
                      : null
                  }
                  <div className="text-3xl font-black mt-2 leading-none tracking-tighter" style={{ color: regimeColor }}>
                    {r ? fmt(r.net / 12) : '—'}
                    <span className="text-[11px] text-slate-400 font-bold ml-1">/mois</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold mt-0.5">{r ? fmt(r.net) : '—'} /an</div>
                  {r && r.cashInCompany != null && r.cashInCompany > 0 && (
                    <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                      Trésorerie société&nbsp;: {fmt(r.cashInCompany)} /an
                    </div>
                  )}
                  <div className="mt-3">
                    {r && <StackedBar ca={r.ca} fees={r.fees} cotis={r.cotis} ir={r.ir} net={r.net} />}
                  </div>
                </div>

                {/* Métriques */}
                <div className="px-4 py-3 space-y-1.5">
                  {rows.map((row) => {
                    let val = r ? (row.monthly ? r[row.key] / 12 : r[row.key]) : null;
                    if (r && row.key === 'portageCommission') {
                      if (activeRegime !== 'Portage') val = null;
                      else val = r.lines?.find((l: any) => l.id === 'portage_commission')?.amount ?? 0;
                    }
                    if (r && row.key === 'fees' && r.id === 'Micro') val = null;
                    if (r && row.key === 'cotis' && r.id === 'SASU') val = null;
                    if (r && row.key === 'cashInCompany' && (r.cashInCompany == null || r.cashInCompany === 0)) val = null;
                    const detailText = r ? getDetailText(r, row.key, row.monthly) : '';
                    const tooltipColor = getTooltipColor(row.key);
                    return (
                      <div key={row.label}>
                        <div className={`flex items-baseline justify-between gap-3 rounded-xl px-3 py-2 ${getRowBgClassCard(row)}`}>
                          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 flex-1">{row.key === 'beforeTax' ? getBeforeTaxRowLabel(activeRegime) : row.label}</p>
                          <span className={`text-[11px] font-black ${row.isFinal ? 'text-indigo-700 dark:text-indigo-300' : row.color || 'text-slate-800 dark:text-slate-100'}`}>
                            {val !== null && r ? (
                              <AmountTooltip
                                amount={val}
                                ca={r.ca}
                                detailText={detailText}
                                label={row.label}
                                color={tooltipColor}
                                position="bottom"
                              >
                                {row.prefix}{fmt(val)}
                                {row.monthly && <span className="text-[9px] text-slate-400 ml-1">/mois</span>}
                              </AmountTooltip>
                            ) : '—'}
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

        <ScrollDots total={simulations.length} active={activeYear} color={regimeColor} />
      </div>

      {/* Bloc analyse + CTA Je me lance */}
      {PROJECTION_ANALYSIS[activeRegime] && (
        <div className="px-4 md:px-6 pt-2 pb-3">
          <div className="max-w-[1600px] mx-auto mt-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 md:px-6 py-4 md:py-5">
            <div className="space-y-2">
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                Analyse sur 5 ans
              </p>
              <h3 className="text-sm md:text-base font-black tracking-tight text-slate-900 dark:text-slate-50">
                Points forts & vigilances pour {activeRegime}
              </h3>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-900/15 border border-emerald-100 dark:border-emerald-900/30 px-3 py-2.5">
                  <p className="text-[9px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-[0.16em] mb-1.5 flex items-center gap-1">
                    <span className="text-emerald-500">●</span> Points forts
                  </p>
                  <ul className="text-[10px] text-slate-700 dark:text-slate-200 space-y-1.5">
                    {PROJECTION_ANALYSIS[activeRegime]!.forts.map((f) => (
                      <li key={f} className="flex gap-1.5">
                        <span className="shrink-0 text-emerald-500">✓</span>
                        <span className="font-medium">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl bg-amber-50/70 dark:bg-amber-900/15 border border-amber-100 dark:border-amber-900/30 px-3 py-2.5">
                  <p className="text-[9px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-[0.16em] mb-1.5 flex items-center gap-1">
                    <span className="text-amber-500">●</span> Vigilances
                  </p>
                  <ul className="text-[10px] text-slate-700 dark:text-slate-200 space-y-1.5">
                    {PROJECTION_ANALYSIS[activeRegime]!.vigilance.map((v) => (
                      <li key={v} className="flex gap-1.5">
                        <span className="shrink-0 text-amber-500">!</span>
                        <span className="font-medium">{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <p className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Prêt à transformer cette simulation en réalité ? Trouvez des partenaires adaptés {getRegimePhrase(activeRegime)} pour vous accompagner.
                </p>
              </div>
              <div className="mt-2">
                <a
                  href={`/partenaires?regime=${encodeURIComponent(activeRegime)}`}
                  className="inline-flex items-center justify-center gap-2 w-full px-4 md:px-6 py-3 md:py-3.5 rounded-xl text-white font-black text-[10px] md:text-[11px] uppercase tracking-[0.22em] shadow-lg shadow-slate-900/25 hover:opacity-90 transition-all"
                  style={{ background: regimeColor }}
                >
                  <Rocket size={14} />
                  Je me lance en {activeRegime}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hypothèses et disclaimer */}
      <div className="px-4 md:px-6 py-4">
        <div className="max-w-[1600px] mx-auto rounded-xl border border-slate-200/80 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Hypothèses de calcul</span>
                <ul className="mt-1.5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400 list-disc pl-4">
                  <li>ACRE : allègement ~50% cotisations TNS/Micro la 1re année</li>
                  <li>CFE : ajoutée dès la 2e année d'activité</li>
                  <li>Croissance CA : appliquée année après année</li>
                  <li>EURL IS : IS 25% sur bénéfice. SASU : PFU 30% sur dividendes</li>
                </ul>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 italic border-t border-slate-200/80 dark:border-slate-700/50 pt-3">
              Simulation estimative basée sur les barèmes 2026. Consultez un expert-comptable pour votre situation personnelle.
            </p>
          </div>
        </div>
      </div>

      {/* ══ PDF — Business Plan (masqué) ══ */}
      <div style={{ display: 'none' }}>
        <div ref={printBizRef} style={{ fontFamily: 'Arial, sans-serif', padding: '12mm', fontSize: 10 }}>

          {/* En-tête */}
          <div style={{ textAlign: 'center', margin: '0 0 14px' }}>
            <h1 style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>Simulations 5 ans — Freelance</h1>
            <p style={{ fontSize: 9, color: '#666', margin: '4px 0 0' }}>
              Régime : <strong>{activeRegime}</strong> · TJM {sim.state.tjm} € · {sim.state.days} jours · {sim.state.taxParts} parts fiscales
            </p>
          </div>

          {/* Tableau simulations */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
            <thead>
              <tr style={{ background: '#eef2ff' }}>
                <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '2px solid #c7d2fe' }}>Indicateur</th>
                {simulations.map((_, i) => (
                  <th key={i} style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '2px solid #c7d2fe', color: '#4f46e5' }}>
                    Année {i + 1}{i === 0 && sim.state.acreEnabled && activeRegime !== 'Portage' ? ' (ACRE)' : i > 0 ? ' (+CFE)' : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  style={{ background: row.isFinal ? '#eef2ff' : i % 2 === 0 ? '#fff' : '#f8fafc' }}
                >
                  <td
                    style={{
                      padding: '4px 7px',
                      fontWeight: row.isFinal ? 900 : 600,
                      borderBottom: '1px solid #e2e8f0',
                      fontSize: 9,
                    }}
                  >
                    {row.key === 'beforeTax' ? getBeforeTaxRowLabel(activeRegime) : row.label}
                  </td>
                    {simulations.map((yr, j) => {
                    const r = yr.find((x: any) => x.id === activeRegime) as any;
                    let val: number | null = null;
                    if (row.key === 'optimisations') {
                      const lines = (r.lines as any[] | undefined) ?? [];
                      const ids = ['indemnites_km', 'loyer_percu', 'avantages'];
                      const sum = lines
                        .filter((l: any) => ids.includes(l.id))
                        .reduce((acc: number, l: any) => acc + (typeof l.amount === 'number' ? l.amount : 0), 0);
                      val = sum > 0 ? sum : null;
                    } else {
                      val = row.monthly ? r[row.key] / 12 : r[row.key];
                    }
                    if (row.key === 'portageCommission') {
                      if (activeRegime !== 'Portage') val = null;
                      else val = r.lines?.find((l: any) => l.id === 'portage_commission')?.amount ?? 0;
                    }
                    if (row.key === 'fees' && r.id === 'Micro') val = null;
                    if (row.key === 'cotis' && r.id === 'SASU') val = null;
                    if (row.key === 'cashInCompany' && (r.cashInCompany == null || r.cashInCompany === 0)) val = null;
                    return (
                      <td
                        key={j}
                        style={{
                          padding: '4px 7px',
                          textAlign: 'right',
                          fontWeight: row.isFinal ? 900 : 'normal',
                          borderBottom: '1px solid #e2e8f0',
                          fontSize: 9,
                          color: row.isFinal ? '#4f46e5' : 'inherit',
                        }}
                      >
                        {val === null ? '—' : `${row.prefix}${fmt(val)}${row.monthly ? '/mois' : ''}`}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Histogrammes — évolution sur 5 ans */}
          {(() => {
            return (
              <div style={{ marginTop: 16 }}>
                <h2 style={{ fontSize: 11, fontWeight: 900, margin: '0 0 8px', borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>Évolution du net disponible — {activeRegime}</h2>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  {simulations.map((yr, i) => {
                    const r = yr.find((x: any) => x.id === activeRegime) as any;
                    const total = Math.max(r.ca, 1);
                    const segs = [
                      { pct: (r.fees  / total) * 100, color: '#fb7185' },
                      { pct: (r.cotis / total) * 100, color: '#fbbf24' },
                      { pct: (r.ir    / total) * 100, color: '#f87171' },
                      { pct: (r.net   / total) * 100, color: '#34d399' },
                    ];
                    return (
                      <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ display: 'flex', width: '100%', height: 10, borderRadius: 3, overflow: 'hidden', background: '#e2e8f0' }}>
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
                        <p style={{ fontSize: 8, fontWeight: 900, color: '#34d399', margin: '3px 0 0' }}>{fmt(r.net / 12)}/m</p>
                        <p style={{ fontSize: 7, color: '#64748b', margin: 0 }}>An {i + 1}{i === 0 && sim.state.acreEnabled && activeRegime !== 'Portage' ? '*' : ''}</p>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  {[['#fb7185','Charges'],['#fbbf24','Cotis'],['#f87171','Impôts'],['#34d399','Net']].map(([c, l]) => (
                    <span key={l} style={{ fontSize: 7, color: c as string, fontWeight: 700 }}>■ {l}</span>
                  ))}
                  {sim.state.acreEnabled && activeRegime !== 'Portage' && <span style={{ fontSize: 7, color: '#94a3b8' }}>* ACRE an 1</span>}
                </div>
              </div>
            );
          })()}

          {/* Analyse */}
          {(() => {
            const analysis: Record<string, { forts: string[]; vigilance: string }> = {
              Portage:  { forts: ['Accès au chômage (ARE) en fin de mission','Protection sociale complète (régime salarié)','Zéro gestion administrative'], vigilance: "Les frais de gestion (5–15 % du CA, selon le contrat) réduisent directement votre net." },
              Micro:    { forts: ['Création instantanée, formalités nulles','Comptabilité ultra simplifiée','Charges proportionnelles au CA réel'], vigilance: "Plafond de CA à 77 700 € en BNC. Pas de déduction des charges réelles." },
              'EURL IR':{ forts: ['Déduction des charges professionnelles réelles','IR progressif : avantageux si revenus modérés','Structure souple'], vigilance: "Cotisations TNS calculées selon le barème réel (URSSAF/CIPAV). Comptabilité obligatoire." },
              'EURL IS':{ forts: ["Bénéfice non versé en salaire taxé à l'IS 25 %","Pilotage précis de la part en salaire TNS vs capitalisation en société","Création d’une trésorerie de société mobilisable plus tard"], vigilance: "IS 25 % sur le bénéfice restant + impôt sur le revenu sur le salaire TNS. Comptabilité exigeante." },
              SASU:     { forts: ['Protection assimilé-salarié (retraite, prévoyance)','Dividendes au PFU 30 %','Statut reconnu pour missions premium'], vigilance: "Bénéfice taxé à l'IS 20 % puis dividendes imposés au PFU 30 % (dont 17,2 % prélèvements sociaux). Pas d'accès à l'ARE en fin de mandat de président." },
            };
            const data = analysis[activeRegime];
            if (!data) return null;
            return (
              <div style={{ marginTop: 18 }}>
                <h2 style={{ fontSize: 11, fontWeight: 900, margin: '0 0 8px', borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>Analyse — {activeRegime}</h2>
                <div style={{ padding: '8px 10px', background: '#f8fafc', borderLeft: '3px solid #6366f1', borderRadius: 2 }}>
                  {data.forts.map((f, i) => (
                    <p key={i} style={{ fontSize: 9, margin: '2px 0', color: '#16a34a' }}>✓ {f}</p>
                  ))}
                  <p style={{ fontSize: 9, margin: '6px 0 0', color: '#dc2626' }}>⚠ {data.vigilance}</p>
                </div>
              </div>
            );
          })()}

          <p style={{ fontSize: 7, color: '#999', marginTop: 14 }}>Simulation estimative — barèmes 2026. Ces simulations ne constituent pas un conseil fiscal.</p>
        </div>
      </div>

      <ConnectorModal
        open={showConnectorModal}
        onClose={() => setShowConnectorModal(false)}
        title="Connectez-vous pour débloquer"
        message="Connectez-vous ou créez un compte pour exporter la simulation en PDF et accéder aux détails de calcul."
      />

    </div>
  );
}
