'use client';
import React, { useRef, useMemo, useState } from 'react';

import { useReactToPrint } from 'react-to-print';
import { projeterSurNAns } from '@/lib/projections';
import { getDetailTextFromLines } from '@/lib/financial';
import { fmtEur } from '@/lib/utils';
import { FileText, Percent } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import ConnectorModal from '@/components/ConnectorModal';
import AmountTooltip from '@/components/AmountTooltip';
import {
  CA_REPARTITION_INK,
  CA_REPARTITION_HISTOGRAM_LEXICON,
  PORTAGE_COMMISSION,
  buildCaRepartitionSegments,
  tooltipColorForRowKey,
} from '@/lib/simulateur/caRepartitionColors';

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
      'Les frais de gestion (taux paramétrable dans Réglages) pèsent sur le net à long terme.',
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

/* ── Histogramme : une barre rectangulaire segmentée + légende à droite (points + libellés + %) ── */
function StackedBar({
  ca,
  fees,
  cotis,
  ir,
  net,
  variant = 'default',
  portageCommissionAmount = 0,
  activeRegime,
  lines,
  cashInCompany,
}: {
  ca: number;
  fees: number;
  cotis: number;
  ir: number;
  net: number;
  /** hero = pages palier « article » : histogramme large */
  variant?: 'default' | 'hero' | 'article';
  /** Commission portage (€) — segment + ligne de légende si Portage */
  portageCommissionAmount?: number;
  activeRegime?: string;
  /** Lignes financières (CFE, IS société, etc.) — pour répartition complète SASU / EURL IS */
  lines?: { id?: string; amount?: number }[];
  cashInCompany?: number;
}) {
  const amounts = { fees, cotis, ir, net };
  const chartOpts = {
    regimeId: activeRegime,
    portageCommission: portageCommissionAmount,
    lines,
    cashInCompany,
  };
  const segs = buildCaRepartitionSegments(ca, amounts, chartOpts);
  const barW = variant === 'hero' ? 120 : variant === 'article' ? 132 : 56;
  const barH = variant === 'hero' ? 200 : variant === 'article' ? 240 : 88;
  const gap = variant === 'hero' ? 'gap-6' : 'gap-3';
  const legendGap = variant === 'hero' ? 'gap-3' : 'gap-1.5';
  const labelClass =
    variant === 'hero'
      ? 'text-sm sm:text-base font-black leading-tight whitespace-nowrap'
      : 'text-[8px] font-black leading-none whitespace-nowrap';
  const dotClass = variant === 'hero' ? 'w-3 h-3 rounded-sm' : 'w-2 h-2 rounded-sm';

  /** Palier article : une seule barre + légende (commission en premier si portage) */
  if (variant === 'article') {
    const articleSegs = buildCaRepartitionSegments(ca, amounts, chartOpts);

    return (
      <div className="stacked-bar flex w-full max-w-full items-stretch gap-3 py-1 md:gap-4">
        <div
          className="flex shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-inner dark:border-slate-600 dark:bg-slate-900/50"
          style={{ width: barW, height: barH }}
        >
          {articleSegs.map((s) => (
            <div
              key={s.key}
              style={{
                height: `${Math.max(0, s.pct)}%`,
                background: s.fill,
                minHeight: s.pct > 0 ? '2px' : undefined,
              }}
              className="min-h-0 w-full transition-all duration-500"
              title={`${s.label} : ${s.pct < 10 && s.pct > 0 ? s.pct.toFixed(1) : Math.round(s.pct)} %`}
            />
          ))}
        </div>
        <div className={`flex min-w-0 flex-1 flex-col justify-center ${legendGap}`}>
          {articleSegs.map((s) => (
            <div key={s.key} className="flex items-baseline gap-2 text-left">
              <span className="h-2 w-2 shrink-0 rounded-sm md:h-2.5 md:w-2.5" style={{ background: s.fill }} />
              <span
                className="min-w-0 flex-1 text-[9px] font-black uppercase leading-tight tracking-tight md:text-[10px]"
                style={{ color: s.ink }}
              >
                {s.label}
              </span>
              <span
                className="shrink-0 text-[9px] font-black tabular-nums md:text-[10px]"
                style={{ color: s.ink }}
              >
                {s.pct < 10 && s.pct > 0 ? s.pct.toFixed(1) : Math.round(s.pct)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /** Comparateur / simulateur : barres avec coins arrondis (mode palier `article` : barre séparée, aussi arrondie). */
  const barShell =
    'stacked-bar-inner overflow-hidden shrink-0 rounded-xl border border-slate-200 bg-slate-50 shadow-inner dark:border-slate-700 dark:bg-slate-900/50';

  return (
    <div
      className={`stacked-bar flex items-center ${gap} py-1 ${
        variant === 'hero' ? 'justify-center md:justify-start' : ''
      }`}
    >
      <div className={barShell} style={{ width: barW, height: barH }}>
        {segs.map((s) => (
          <div
            key={s.key}
            style={{ height: `${Math.max(0, s.pct)}%`, background: s.fill }}
            className="stacked-bar-segment transition-all duration-500 w-full"
            title={`${s.label} : ${Math.round(s.pct)}%`}
          />
        ))}
      </div>
      <div className={`stacked-bar-legend flex flex-col ${legendGap}`}>
        {segs.map((s) => (
          <span key={s.key} className={`flex items-center gap-2 ${labelClass}`} style={{ color: s.ink }}>
            <span className={`${dotClass} shrink-0`} style={{ background: s.fill }} />
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
  /** Pages SEO palier CA : une seule colonne (année 1), même projection que le simulateur */
  palierMode = false,
  /** Tableau type « capture » à gauche, histogramme XXL à droite (desktop) */
  articleSplitLayout = false,
  growthByYear,
  onChangeGrowthYear,
}: {
  sim: any;
  activeRegime: string;
  setActiveRegime: (id: string) => void;
  /** true sur les pages simulateur (un seul statut) : masque les pastilles et le bloc SIMULATIONS / nom / +% */
  singleRegime?: boolean;
  palierMode?: boolean;
  articleSplitLayout?: boolean;
  growthByYear: number[];
  onChangeGrowthYear?: (index: number, value: number) => void;
}) {
  const printBizRef    = useRef<HTMLDivElement>(null);
  const yearScrollRef  = useRef<HTMLDivElement>(null);
  const [activeYear, setActiveYear]     = useState(0);
  const [openGrowthYear, setOpenGrowthYear] = useState<number | null>(null);
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

  const yrsForUi = palierMode ? simulations.slice(0, 1) : simulations;
  const splitArticle = Boolean(palierMode && articleSplitLayout);

  // Alias vers fmtEur — formatage identique partout, sans hydratation mismatch
  const fmt = fmtEur;

  const onYearScroll = () => {
    const el = yearScrollRef.current;
    if (!el) return;
    const count = yrsForUi.length;
    const idx = Math.round(el.scrollLeft / (el.scrollWidth / count || 1));
    setActiveYear(Math.min(Math.max(idx, 0), Math.max(count - 1, 0)));
  };

  const scrollToYear = (index: number) => {
    const el = yearScrollRef.current;
    const count = yrsForUi.length;
    if (!el || count === 0) return;
    const safeIndex = Math.min(Math.max(index, 0), count - 1);
    const cardWidth = el.scrollWidth / count || 0;
    el.scrollTo({ left: safeIndex * cardWidth, behavior: 'smooth' });
    setActiveYear(safeIndex);
  };

  const getBeforeTaxRowLabel = (regimeId: string) => {
    if (regimeId === 'EURL IR') return 'Revenu imposable (avant IR)';
    if (regimeId === 'SASU') return 'Revenu brut (avant IR/PFU)';
    return 'Rémunération nette (avant IR)';
  };

  const optimisationsLabel =
    activeRegime === 'Portage'
      ? 'Dont optimisations (IK remboursées)'
      : 'Dont optimisations (IK, loyer, avantages)';

  const baseRows = [
    { label: 'CA annuel brut',               key: 'ca',        prefix: '',  color: '',               highlight: false, isFinal: false, monthly: false },
    { label: 'Commission de portage',        key: 'portageCommission', prefix: '-', color: 'text-cyan-700 dark:text-cyan-400', highlight: false, isFinal: false, monthly: false },
    {
      label: splitArticle
        ? 'Charges professionnelles'
        : 'Charges (dépenses + optimisations)',
      key: 'fees',
      prefix: '-',
      color: 'text-rose-500',
      highlight: false,
      isFinal: false,
      monthly: false,
    },
    { label: 'Cotisations sociales',         key: 'cotis',     prefix: '-', color: 'text-amber-600', highlight: false, isFinal: false, monthly: false },
    { label: 'Base avant impôt',             key: 'beforeTax', prefix: '',  color: '',               highlight: true,  isFinal: false, monthly: false },
    { label: 'Prélèvement fiscal perso (IR / PFU)', key: 'ir',  prefix: '-', color: 'text-indigo-600 dark:text-indigo-400',  highlight: false, isFinal: false, monthly: false },
    { label: 'DISPONIBLE FINAL ANNUEL',      key: 'net',       prefix: '',  color: 'text-emerald-600 dark:text-emerald-400', highlight: false, isFinal: true,  monthly: false, bigAmount: false, separatorAbove: true },
    { label: optimisationsLabel, key: 'optimisations', prefix: '', color: 'text-emerald-600', highlight: false, isFinal: false, monthly: false },
    { label: 'Trésorerie société (après IS)', key: 'cashInCompany', prefix: '',  color: 'text-slate-500', highlight: false, isFinal: false, monthly: false },
    { label: 'DISPONIBLE FINAL MENSUEL',     key: 'net',       prefix: '',  color: 'text-emerald-600 dark:text-emerald-400', highlight: false, isFinal: true,  monthly: true,  bigAmount: true },
  ];

  // Masquer certaines lignes si elles sont vides (sur la période affichée) pour le régime actif
  const hasAnyCashInCompany = yrsForUi.some(yr => {
    const r = yr.find((x: any) => x.id === activeRegime) as any;
    return r && r.cashInCompany != null && r.cashInCompany > 0;
  });
  const hasAnyFees = yrsForUi.some(yr => {
    const r = yr.find((x: any) => x.id === activeRegime) as any;
    if (!r) return false;
    if (activeRegime === 'Micro') return false;
    return r.fees != null && r.fees > 0;
  });
  const hasAnyOptimisations = yrsForUi.some(yr => {
    const r = yr.find((x: any) => x.id === activeRegime) as any;
    if (!r) return false;
    const lines = (r.lines as any[] | undefined) ?? [];
    const ids = ['indemnites_km', 'loyer_percu', 'avantages'];
    const sum = lines
      .filter((l: any) => ids.includes(l.id))
      .reduce((acc: number, l: any) => acc + (typeof l.amount === 'number' ? l.amount : 0), 0);
    return sum > 0;
  });

  const hasAnyCotis = yrsForUi.some(yr => {
    const r = yr.find((x: any) => x.id === activeRegime) as any;
    return r && typeof r.cotis === 'number' && r.cotis > 0;
  });

  const currentGrowthIndex = openGrowthYear ?? 0;
  const currentGrowthValue = growthByYear[currentGrowthIndex] ?? 0;

  const handleOpenGrowthModal = (index: number) => {
    if (!onChangeGrowthYear) return;
    setOpenGrowthYear(index);
  };

  const handleChangeGrowth = (value: number) => {
    if (openGrowthYear == null || !onChangeGrowthYear) return;
    onChangeGrowthYear(openGrowthYear, value);
  };
  const hasAnyPortageCommission = yrsForUi.some(yr => {
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
    // SASU : pas de cotisations sociales "classiques" => masquer la ligne
    if (row.key === 'cotis') return hasAnyCotis;
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

  const getDetailText = (r: any, key: string, monthly = false): string =>
    getDetailTextFromLines(r, key, sim, monthly);

  const getTooltipColor = (key: string): string => {
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
  };

  const getRowBgClass = (row: (typeof rows)[number]) => {
    if (row.isFinal) return 'bg-emerald-50/60 dark:bg-emerald-900/30';
    if (row.highlight) return 'bg-slate-50/60 dark:bg-slate-800/30';
    if (row.key === 'optimisations') return 'bg-emerald-50/50 dark:bg-emerald-900/25';
    if (row.key === 'cashInCompany') return 'bg-slate-50/50 dark:bg-slate-800/25';
    return '';
  };

  const getRowBgClassCard = (row: (typeof rows)[number]) => {
    if (row.isFinal) return 'bg-emerald-50/70 dark:bg-emerald-900/35';
    if (row.highlight) return 'bg-slate-50/70 dark:bg-slate-800/35';
    if (row.key === 'optimisations') return 'bg-emerald-50/60 dark:bg-emerald-900/30';
    if (row.key === 'cashInCompany') return 'bg-slate-50/60 dark:bg-slate-800/30';
    return 'bg-slate-50/40 dark:bg-slate-900/20';
  };

  const rArticleBar = splitArticle
    ? (yrsForUi[0]?.find((x: any) => x.id === activeRegime) as any)
    : null;

  const cardShell =
    'overflow-visible bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none';

  return (
    <>
    <div className={splitArticle ? 'overflow-visible' : cardShell}>

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

      {/* ── Tableau Simulations (desktop) — même code que ComparisonTable ── */}
      <div
        className={`hidden md:block w-full ${
          splitArticle
            ? 'flex flex-col overflow-hidden rounded-2xl border border-slate-300/80 bg-white shadow-sm ring-1 ring-slate-900/5 dark:border-slate-600 dark:bg-slate-900'
            : ''
        }`}
      >
        {/* Layout « article » : une seule barre d’en-tête pour tout le bloc (table + histogramme) */}
        {splitArticle && (
          <>
            <button
              id="simulateur-pdf-btn"
              type="button"
              onClick={() => (isConnected ? handlePrintBiz() : setShowConnectorModal(true))}
              className={`sr-only ${PDF_BTN}`}
            >
              <FileText size={11} /> Exporter PDF
            </button>
            <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-slate-100/90 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/90">
              <span className="flex shrink-0 gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-[#ec6a5e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#f4bf4f]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#61c554]" />
              </span>
              <span className="min-w-0 truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Aperçu — année 1 · {activeRegime}
              </span>
            </div>
          </>
        )}

        <div className={splitArticle ? 'min-w-0 w-full' : ''}>
          <div className={splitArticle ? 'min-w-0' : ''}>
            {!splitArticle ? (
              <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-200 bg-linear-to-r from-slate-50 to-slate-100/50 px-6 py-3 dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-900/50">
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
            ) : null}
          <table
            className={`w-full border-separate border-spacing-0 table-fixed ${splitArticle ? 'text-[11px] md:text-[11px]' : ''}`}
          >
            {splitArticle && (() => {
              const nRest = yrsForUi.length + (rArticleBar ? 1 : 0);
              const wFirst = 20;
              const wEach = nRest > 0 ? (100 - wFirst) / nRest : 0;
              return (
                <colgroup>
                  <col style={{ width: `${wFirst}%` }} />
                  {yrsForUi.map((_, i) => (
                    <col key={`y-${i}`} style={{ width: `${wEach}%` }} />
                  ))}
                  {rArticleBar ? <col key="hist" style={{ width: `${wEach}%` }} /> : null}
                </colgroup>
              );
            })()}
            <thead>
              <tr className="bg-white dark:bg-slate-900">
                <th
                  scope="col"
                  className={`text-left border-b border-slate-100 dark:border-slate-800 align-bottom ${
                    splitArticle ? 'p-2' : 'p-4 w-[200px]'
                  }`}
                />
                {yrsForUi.map((yr, i) => {
                  const r = yr.find((x: any) => x.id === activeRegime);
                  return (
                    <th
                      key={i}
                      className={`relative border-b border-slate-100 dark:border-slate-800 align-top ${
                        splitArticle ? 'px-2 pt-7 pb-1' : 'px-3 pt-10 pb-1.5'
                      }`}
                    >
                      <div className={`header-band band-${regimeClass}`} />
                      {!palierMode && i > 0 && (
                        <button
                          type="button"
                          onClick={() => handleOpenGrowthModal(i)}
                          className="absolute right-2 top-2 inline-flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 text-slate-500 hover:text-emerald-600 hover:border-emerald-400 shadow-sm w-7 h-7"
                          aria-label={`Régler la croissance de l'année ${i + 1}`}
                        >
                          <Percent className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className={`flex flex-col items-center ${splitArticle ? 'gap-0.5' : 'gap-1.5'}`}>
                        <span
                          className={`font-black text-slate-800 dark:text-white uppercase tracking-tight ${
                            splitArticle ? 'text-xs' : 'text-sm'
                          }`}
                        >
                          Année {i + 1}
                        </span>
                        <div className={`flex flex-col items-center justify-center ${splitArticle ? 'min-h-[36px]' : 'min-h-[42px]'}`}>
                          <span
                            className={`font-black text-slate-900 dark:text-white leading-none tabular-nums ${
                              splitArticle ? 'text-lg' : 'text-2xl'
                            }`}
                          >
                            {r ? fmt(r.net / 12) : '—'}
                          </span>
                          <span className="text-[10px] font-bold leading-tight text-slate-400 mt-0.5">net / mois</span>
                          {r && r.cashInCompany != null && r.cashInCompany > 0 ? (
                            <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                              + {fmt(r.cashInCompany)} trésorerie
                            </span>
                          ) : (
                            <span className="mt-1 invisible text-[8px] leading-none">—</span>
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}
                {splitArticle && rArticleBar && (
                  <th
                    scope="col"
                    className="relative border-b border-l border-slate-100 bg-white px-2 pt-7 pb-1 align-top dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className={`header-band band-${regimeClass}`} />
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-center text-xs font-black uppercase tracking-tight text-slate-800 dark:text-white">
                        Répartition CA
                      </span>
                      <div className="flex min-h-[36px] flex-col items-center justify-center">
                        <span className="invisible text-lg leading-none tabular-nums">0</span>
                        <span className="invisible text-[10px] font-bold leading-tight text-slate-400">net / mois</span>
                        <span className="invisible mt-1 text-[8px] leading-none">—</span>
                      </div>
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="text-slate-700 dark:text-slate-300">
              {rows.map((row, idx) => {
                const isLast = idx === rows.length - 1;
                const isFinal = (row as any).isFinal;
                return (
                  <React.Fragment key={idx}>
                    <tr className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30 ${getRowBgClass(row)} ${isFinal && !isLast ? 'border-b-2 border-emerald-100 dark:border-emerald-900/50' : ''}`}>
                      <td
                        className={`border-r border-slate-100 dark:border-slate-800 ${splitArticle ? 'px-2 py-1.5' : 'px-5 py-3'}`}
                      >
                        <div
                          className={`font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide leading-tight ${
                            splitArticle ? 'text-[8px]' : 'text-[10px]'
                          }`}
                        >
                          {row.label}
                        </div>
                      </td>
                      {yrsForUi.map((yr, i) => {
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
                        if (row.key === 'cashInCompany' && (r?.cashInCompany == null || r?.cashInCompany === 0)) val = null;
                        const detailText = r ? getDetailText(r, row.key, row.monthly) : '';
                        const tooltipColor = getTooltipColor(row.key);
                        return (
                          <td
                            key={i}
                            className={`${splitArticle ? 'px-1.5 py-1.5' : 'px-3 py-3'} ${(row as any).color || ''}`}
                          >
                            <div className="w-full flex justify-center">
                              {(() => {
                                if (val === null) {
                                  return (
                                    <span
                                      className={`inline-flex justify-end tabular-nums font-bold text-slate-300 dark:text-slate-600 ${
                                        splitArticle ? 'text-xs w-[68px]' : 'text-sm w-[88px]'
                                      }`}
                                    >
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
                                    <span
                                      className={
                                        isFinal
                                          ? 'text-emerald-600 dark:text-emerald-400'
                                          : ''
                                      }
                                    >
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
                                    <div
                                      className={`inline-flex flex-col items-end tabular-nums font-bold ${
                                        splitArticle ? 'text-xs w-[68px]' : 'text-sm w-[88px]'
                                      }`}
                                    >
                                      {content}
                                    </div>
                                  </AmountTooltip>
                                );
                              })()}
                            </div>
                          </td>
                        );
                      })}
                      {splitArticle && rArticleBar && idx === 0 && (
                        <td
                          rowSpan={rows.length}
                          className="border-l border-slate-100 bg-white align-middle dark:border-slate-800 dark:bg-slate-900"
                        >
                          <div className="flex h-full flex-col items-center justify-center px-2 py-3 md:px-3">
                            <StackedBar
                              variant="article"
                              ca={rArticleBar.ca ?? 0}
                              fees={rArticleBar.fees ?? 0}
                              cotis={rArticleBar.cotis ?? 0}
                              ir={rArticleBar.ir ?? 0}
                              net={rArticleBar.net ?? 0}
                              activeRegime={activeRegime}
                              portageCommissionAmount={
                                rArticleBar?.lines?.find((l: { id?: string }) => l.id === 'portage_commission')
                                  ?.amount ?? 0
                              }
                              lines={rArticleBar?.lines as { id?: string; amount?: number }[] | undefined}
                              cashInCompany={rArticleBar?.cashInCompany}
                            />
                          </div>
                        </td>
                      )}
                    </tr>
                  </React.Fragment>
                );
              })}

              {/* ── Ligne Trimestres retraite validés (masquée en layout « article ») ── */}
              {!splitArticle && (
              <tr className="bg-white dark:bg-slate-900">
                <td className="border-r border-slate-100 dark:border-slate-800 align-top px-4 py-3">
                  <div className="font-black text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-widest leading-tight">
                    Trimestres retraite<br />validés
                  </div>
                </td>
                {yrsForUi.map((yr, i) => {
                  const r = yr.find((x: any) => x.id === activeRegime) as any;
                  return (
                    <td key={i} className="text-center px-3 py-3">
                      {r ? (
                        <RetirementBadge quarters={r.retirementQuarters ?? 0} regimeId={activeRegime} />
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
              )}

              {/* ── Ligne Répartitions (masquée en layout « article » : histogramme à part) ── */}
              {!splitArticle && (
              <tr className="bg-slate-50/20 dark:bg-slate-900/10">
                <td className="p-4">
                  <div className="font-black text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-widest leading-tight">Répartitions</div>
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1.5">
                    {CA_REPARTITION_HISTOGRAM_LEXICON.map((item) => (
                      <span key={item.key} className="flex items-center gap-1 text-[7px] font-bold" style={{ color: item.ink }}>
                        <span className="w-2 h-2 rounded-sm inline-block opacity-90" style={{ background: item.fill }} />
                        {item.label}
                      </span>
                    ))}
                  </div>
                </td>
                {yrsForUi.map((yr, i) => {
                  const r = yr.find((x: any) => x.id === activeRegime) as any;
                  return (
                    <td key={i} className="px-4 py-3">
                      <div className="flex justify-center">
                        <StackedBar
                          ca={r?.ca ?? 0}
                          fees={r?.fees ?? 0}
                          cotis={r?.cotis ?? 0}
                          ir={r?.ir ?? 0}
                          net={r?.net ?? 0}
                          activeRegime={activeRegime}
                          portageCommissionAmount={
                            r?.lines?.find((l: { id?: string }) => l.id === 'portage_commission')?.amount ?? 0
                          }
                          lines={r?.lines as { id?: string; amount?: number }[] | undefined}
                          cashInCompany={r?.cashInCompany}
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>

      {/* Analyse (masquée en layout « article » — texte dans la page palier) */}
      {PROJECTION_ANALYSIS[activeRegime] && !splitArticle && (
        <div className="hidden md:block border-t border-slate-200 dark:border-slate-700">
          <div className="p-4 md:p-5">
          <h3 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.18em] mb-1">
            {palierMode ? 'Analyse (année 1)' : 'Analyse sur 5 ans'}
          </h3>
          <p className="text-sm font-black text-slate-900 dark:text-slate-50 mb-3">
            Points forts & vigilances pour {activeRegime}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
        </div>
        </div>
      )}

      {/* ── Vue mobile : cartes par année ── */}
      <div className="block md:hidden p-4 pt-5">
        {yrsForUi.length > 1 && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium px-1 mb-2">
          Faites glisser pour voir l&apos;évolution année par année.
        </p>
        )}

        {/* ── Navigation par tabs cliquables (mobile) ── */}
        {yrsForUi.length > 1 && (
        <div className="flex gap-1 overflow-x-auto justify-center pt-3 pb-4 -mx-4 px-4 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden snap-x">
          {yrsForUi.map((_, i: number) => (
            <button
              key={i}
              onClick={() => scrollToYear(i)}
              className={`shrink-0 px-3 py-1.5 rounded-full font-bold text-xs uppercase tracking-wide transition-all duration-200 snap-center ${
                activeYear === i
                  ? 'text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50'
              }`}
              style={{
                background: activeYear === i ? regimeColor : undefined,
              }}
              aria-current={activeYear === i ? 'page' : undefined}
            >
              An {i + 1}
            </button>
          ))}
        </div>
        )}

        <div className="relative">
          <div
            ref={yearScrollRef}
            onScroll={onYearScroll}
            className={`px-7 flex gap-4 min-w-0 ${yrsForUi.length > 1 ? 'overflow-x-auto snap-x snap-mandatory pb-2 pt-4 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden' : 'pb-2 pt-4 justify-center'}`}
          >
            {yrsForUi.map((yr, i) => {
              const r = yr.find((x: any) => x.id === activeRegime) as any;
              return (
                <div
                  key={i}
                  className="snap-center shrink-0 w-[min(calc(100vw-3.5rem),22rem)] max-w-sm relative border border-slate-200 dark:border-slate-700 overflow-hidden rounded-2xl bg-white dark:bg-[#020617] shadow-lg"
                >
                {/* Bande couleur + header */}
                <div className="h-1 w-full" style={{ background: regimeColor }} />
                <div className="px-4 pt-4 pb-3 flex flex-col items-center text-center border-b dark:border-slate-800">
                  <div className="w-full flex items-start justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Année {i + 1}
                    </span>
                    {!palierMode && i > 0 && (
                      <button
                        type="button"
                        onClick={() => handleOpenGrowthModal(i)}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 text-slate-500 hover:text-emerald-600 hover:border-emerald-400 shadow-sm w-7 h-7"
                        aria-label={`Régler la croissance de l'année ${i + 1}`}
                      >
                        <Percent className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {i === 0 && sim.state.acreEnabled && activeRegime !== 'Portage'
                    ? <span className="text-[8px] text-emerald-500 font-black mt-0.5">ACRE ~−25% cotis</span>
                    : i > 0
                      ? <span className="text-[8px] text-slate-400 font-bold mt-0.5">+CFE</span>
                      : null
                  }
                  <div className="text-3xl font-black mt-2 leading-none tracking-tighter" style={{ color: regimeColor }}>
                    {r ? fmt(r.net / 12) : '—'}
                    <span className="text-[11px] text-slate-400 font-bold ml-1">/m</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold mt-0.5">{r ? fmt(r.net) : '—'} /an</div>
                  {r && r.cashInCompany != null && r.cashInCompany > 0 && (
                    <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                      Trésorerie société&nbsp;: {fmt(r.cashInCompany)} /an
                    </div>
                  )}
                  <div className="mt-3">
                    {r && !splitArticle && (
                      <StackedBar
                        ca={r.ca}
                        fees={r.fees}
                        cotis={r.cotis}
                        ir={r.ir}
                        net={r.net}
                        activeRegime={activeRegime}
                        portageCommissionAmount={
                          r.lines?.find((l: { id?: string }) => l.id === 'portage_commission')?.amount ?? 0
                        }
                        lines={r.lines as { id?: string; amount?: number }[] | undefined}
                        cashInCompany={r.cashInCompany}
                      />
                    )}
                  </div>
                </div>

                {/* Lignes du simulateur */}
                <div className="px-4 py-3 space-y-1.5">
                  {rows.map((row) => {
                    let val = r ? (row.monthly ? r[row.key] / 12 : r[row.key]) : null;
                    if (r && row.key === 'portageCommission') {
                      if (activeRegime !== 'Portage') val = null;
                      else val = r.lines?.find((l: any) => l.id === 'portage_commission')?.amount ?? 0;
                    }
                    if (r && row.key === 'fees' && r.id === 'Micro') val = null;
                    if (r && row.key === 'cashInCompany' && (r.cashInCompany == null || r.cashInCompany === 0)) val = null;
                    const detailText = r ? getDetailText(r, row.key, row.monthly) : '';
                    const tooltipColor = getTooltipColor(row.key);
                    return (
                      <div key={row.label}>
                        <div className={`flex items-baseline justify-between gap-3 rounded-xl px-3 py-2 ${getRowBgClassCard(row)}`}>
                          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 flex-1">{row.key === 'beforeTax' ? getBeforeTaxRowLabel(activeRegime) : row.label}</p>
                          <span className={`text-[11px] font-black ${row.isFinal ? 'text-emerald-700 dark:text-emerald-300' : row.color || 'text-slate-800 dark:text-slate-100'}`}>
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
                                {row.monthly && <span className="text-[9px] text-slate-400 ml-1">/m</span>}
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
        </div>
        {splitArticle && rArticleBar && (
          <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-linear-to-br from-slate-50 to-white dark:from-slate-900/80 dark:to-slate-900 p-6">
            <div className="flex flex-col items-center gap-3">
              <span className="text-center text-xs font-black uppercase tracking-tight text-slate-800 dark:text-white">
                Répartition CA
              </span>
              <StackedBar
                variant="article"
                ca={rArticleBar.ca ?? 0}
                fees={rArticleBar.fees ?? 0}
                cotis={rArticleBar.cotis ?? 0}
                ir={rArticleBar.ir ?? 0}
                net={rArticleBar.net ?? 0}
                activeRegime={activeRegime}
                portageCommissionAmount={
                  rArticleBar?.lines?.find((l: { id?: string }) => l.id === 'portage_commission')?.amount ?? 0
                }
                lines={rArticleBar?.lines as { id?: string; amount?: number }[] | undefined}
                cashInCompany={rArticleBar?.cashInCompany}
              />
            </div>
          </div>
        )}
      </div>

    </div>

      {/* Modale de réglage de la croissance par année */}
      {openGrowthYear != null && onChangeGrowthYear && (
        <div
          className="fixed inset-0 z-9998 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => setOpenGrowthYear(null)}
        >
          <div
            className="max-w-md w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.16em]">
                Croissance année {currentGrowthIndex + 1}
              </h3>
              <button
                type="button"
                onClick={() => setOpenGrowthYear(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Ajuste le taux de croissance du chiffre d&apos;affaires pour cette année uniquement.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={50}
                step={1}
                inputMode="numeric"
                value={currentGrowthValue}
                onChange={(e) => handleChangeGrowth(Number(e.target.value))}
                className="w-24 text-center text-sm font-bold py-2 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/50 transition-all"
                aria-label={`Croissance CA année ${currentGrowthIndex + 1}`}
              />
              <span className="w-12 text-right text-sm font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                {currentGrowthValue}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ══ PDF — Business Plan (masqué) ══ */}
      <div style={{ display: 'none' }}>
        <div ref={printBizRef} style={{ fontFamily: 'Arial, sans-serif', padding: '12mm', fontSize: 10 }}>

          {/* En-tête */}
          <div style={{ textAlign: 'center', margin: '0 0 14px' }}>
            <h1 style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>
              {palierMode ? 'Simulation année 1 (palier CA) — Freelance' : 'Simulations 5 ans — Freelance'}
            </h1>
            <p style={{ fontSize: 9, color: '#666', margin: '4px 0 0' }}>
              Régime : <strong>{activeRegime}</strong> · TJM {sim.state.tjm} € · {sim.state.days} jours · {sim.state.taxParts} parts fiscales
            </p>
          </div>

          {/* Tableau simulations */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
            <thead>
              <tr style={{ background: '#eef2ff' }}>
                <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '2px solid #c7d2fe' }}>Indicateur</th>
                {yrsForUi.map((_, i) => (
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
                  style={{ background: row.isFinal ? '#ecfdf5' : i % 2 === 0 ? '#fff' : '#f8fafc' }}
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
                    {yrsForUi.map((yr, j) => {
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
                          color: row.isFinal
                            ? CA_REPARTITION_INK.net
                            : row.key === 'portageCommission'
                              ? PORTAGE_COMMISSION.ink
                              : row.key === 'ir'
                                ? CA_REPARTITION_INK.ir
                                : 'inherit',
                        }}
                      >
                        {val === null ? '—' : `${row.prefix}${fmt(val)}${row.monthly ? '/m' : ''}`}
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
                  {yrsForUi.map((yr, i) => {
                    const r = yr.find((x: any) => x.id === activeRegime) as any;
                    const portageComm =
                      activeRegime === 'Portage'
                        ? (r.lines?.find((l: { id?: string }) => l.id === 'portage_commission')?.amount ?? 0)
                        : 0;
                    const segs = buildCaRepartitionSegments(
                      r.ca,
                      { fees: r.fees, cotis: r.cotis, ir: r.ir, net: r.net },
                      {
                        regimeId: activeRegime,
                        portageCommission: portageComm,
                        lines: r.lines as { id?: string; amount?: number }[] | undefined,
                        cashInCompany: r.cashInCompany,
                      },
                    );
                    return (
                      <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ display: 'flex', width: '100%', height: 10, borderRadius: 0, overflow: 'hidden', background: '#e2e8f0' }}>
                          {segs.map((s) => (
                            <div
                              key={s.key}
                              style={{
                                width: `${Math.max(0, s.pct)}%`,
                                background: s.fill,
                              }}
                            />
                          ))}
                        </div>
                        <p style={{ fontSize: 8, fontWeight: 900, color: CA_REPARTITION_INK.net, margin: '3px 0 0' }}>{fmt(r.net / 12)}/m</p>
                        <p style={{ fontSize: 7, color: '#64748b', margin: 0 }}>An {i + 1}{i === 0 && sim.state.acreEnabled && activeRegime !== 'Portage' ? '*' : ''}</p>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
                  {CA_REPARTITION_HISTOGRAM_LEXICON.map((s) => (
                    <span key={s.key} style={{ fontSize: 7, color: s.ink, fontWeight: 700 }}>
                      ■ {s.label}
                    </span>
                  ))}
                  {sim.state.acreEnabled && activeRegime !== 'Portage' && <span style={{ fontSize: 7, color: '#94a3b8' }}>* ACRE an 1</span>}
                </div>
              </div>
            );
          })()}

          {/* Analyse */}
          {(() => {
            const analysis: Record<string, { forts: string[]; vigilance: string }> = {
              Portage:  { forts: ['Accès au chômage (ARE) en fin de mission','Protection sociale complète (régime salarié)','Zéro gestion administrative'], vigilance: "Les frais de gestion (taux paramétrable dans Réglages) réduisent directement votre net." },
              Micro:    { forts: ['Création instantanée, formalités nulles','Comptabilité ultra simplifiée','Charges proportionnelles au CA réel'], vigilance: "Plafond de CA à 83 600 € en BNC (2026). Pas de déduction des charges réelles." },
              'EURL IR':{ forts: ['Déduction des charges professionnelles réelles','IR progressif : avantageux si revenus modérés','Structure souple'], vigilance: "Cotisations TNS calculées selon le barème réel (URSSAF/CIPAV). Comptabilité obligatoire." },
              'EURL IS':{ forts: ["Bénéfice non versé en salaire taxé à l'IS 25 %","Pilotage précis de la part en salaire TNS vs capitalisation en société","Création d’une trésorerie de société mobilisable plus tard"], vigilance: "IS 25 % sur le bénéfice restant + impôt sur le revenu sur le salaire TNS. Comptabilité exigeante." },
              SASU:     { forts: ['Protection assimilé-salarié (retraite, prévoyance)','Mix salaire + dividendes optimisable','Dividendes au PFU 30 % avantageux à haut CA'], vigilance: "Cotisations assimilé-salarié élevées (~82 % du net) sur la part salaire. IS PME (15 %/25 %) + PFU 30 % sur la part dividendes." },
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
        message="Connectez-vous ou créez un compte pour exporter la simulation en PDF et sauvegarder vos paramètres."
      />

    </>
  );
}
