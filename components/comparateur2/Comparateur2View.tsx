'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useReactToPrint } from 'react-to-print';
import {
  ArrowLeft,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Crown,
  Settings2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useSimulationContext } from '@/context/SimulationContext';
import { useComparateurUrlSync } from '@/hooks/useComparateurUrlSync';
import { useUser } from '@/hooks/useUser';
import Footer from '@/components/Footer';
import ExpandPanels from '@/components/ExpandPanels';
import RegimeFinancialBreakdown from '@/components/comparateur2/RegimeFinancialBreakdown';
import ConnectorModal from '@/components/ConnectorModal';
import RegimeParamsInline from '@/components/RegimeParamsInline';
import PdfIcon from '@/components/PdfIcon';
import { PLAFOND_MICRO_BNC, PLAFOND_MICRO_BIC } from '@/lib/constants';
import { buildCaRepartitionSegments } from '@/lib/simulateur/caRepartitionColors';
import { cn, fmtEur } from '@/lib/utils';

// Couleurs par régime
const REGIME_COLORS: Record<string, { gradient: string; bg: string; border: string; ring: string }> = {
  Portage: { gradient: 'from-violet-500 to-indigo-600', bg: 'bg-violet-500', border: 'border-violet-400', ring: 'ring-violet-400' },
  Micro:   { gradient: 'from-amber-400 to-orange-500',  bg: 'bg-amber-500',  border: 'border-amber-400',  ring: 'ring-amber-400'  },
  'EURL IR': { gradient: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-500', border: 'border-emerald-400', ring: 'ring-emerald-400' },
  'EURL IS': { gradient: 'from-blue-400 to-cyan-500',    bg: 'bg-blue-500',    border: 'border-blue-400',    ring: 'ring-blue-400'    },
  SASU:    { gradient: 'from-rose-400 to-pink-500',    bg: 'bg-rose-500',    border: 'border-rose-400',    ring: 'ring-rose-400'    },
};

const SIDEBAR_SECTIONS = [
  { id: 'activite'     as const, label: 'Activité',       description: 'CA, TJM, jours travaillés'  },
  { id: 'charges'      as const, label: 'Charges',        description: 'Frais professionnels'        },
  { id: 'amortissement'as const, label: 'Amortissement',  description: 'Achat matériel année 1'      },
  { id: 'vehicule'     as const, label: 'Véhicule',       description: 'Indemnités kilométriques'    },
  { id: 'opti'         as const, label: 'Optimisations',  description: 'Loyer, avantages'            },
  { id: 'cotisations'  as const, label: 'Cotisations',    description: 'ACRE, CFE'                   },
  { id: 'foyer'        as const, label: 'Foyer',          description: 'Situation familiale'         },
] as const;

type SidebarPanelId = (typeof SIDEBAR_SECTIONS)[number]['id'];

// Régimes qui ont des options spécifiques dans RegimeParamsInline
const REGIMES_WITH_OPTIONS = ['Portage', 'Micro', 'EURL IS', 'SASU'];

/** Mini barre empilée pour la navigation entre régimes */
function MiniNavBar({
  regime,
  isActive,
  isWinner,
  onClick,
}: {
  regime: {
    id: string; ca: number; fees: number; cotis: number; ir: number; net: number;
    lines?: { id?: string; amount?: number }[]; cashInCompany?: number;
  };
  isActive: boolean;
  isWinner: boolean;
  onClick: () => void;
}) {
  const portageCommission = regime.lines?.find((l) => l.id === 'portage_commission')?.amount ?? 0;
  const segs = buildCaRepartitionSegments(
    regime.ca,
    { fees: regime.fees, cotis: regime.cotis, ir: regime.ir, net: regime.net },
    { regimeId: regime.id, portageCommission, lines: regime.lines, cashInCompany: regime.cashInCompany },
  );
  const colors = REGIME_COLORS[regime.id] ?? REGIME_COLORS.Portage;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative group flex flex-col items-center gap-1.5 px-2 py-2 rounded-xl transition-all duration-200',
        isActive
          ? `bg-white dark:bg-slate-800 shadow-md ring-2 ${colors.ring} scale-105`
          : 'hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-sm',
      )}
    >
      {isWinner && (
        <div className="absolute -top-1.5 -right-0.5 z-10">
          <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
        </div>
      )}
      <div
        className={cn(
          'flex flex-col-reverse overflow-hidden rounded-md border transition-all duration-200',
          isActive ? `border-2 ${colors.border}` : 'border-slate-200 dark:border-slate-600',
        )}
        style={{ width: 28, height: 52 }}
      >
        {segs.map((s) => (
          <div
            key={s.key}
            style={{ height: `${Math.max(0, s.pct)}%`, background: s.fill }}
            className="w-full min-h-0 transition-all duration-500"
          />
        ))}
      </div>
      <span className={cn(
        'text-[8px] font-bold whitespace-nowrap transition-colors leading-none',
        isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400',
      )}>
        {regime.id}
      </span>
    </button>
  );
}

/** Grande barre empilée avec labels et % inscrits dans chaque segment */
function HistogramBarLabeled({
  regime,
}: {
  regime: {
    id: string; ca: number; fees: number; cotis: number; ir: number; net: number;
    lines?: { id?: string; amount?: number }[]; cashInCompany?: number;
  };
}) {
  const portageCommission = regime.lines?.find((l) => l.id === 'portage_commission')?.amount ?? 0;
  const segs = buildCaRepartitionSegments(
    regime.ca,
    { fees: regime.fees, cotis: regime.cotis, ir: regime.ir, net: regime.net },
    { regimeId: regime.id, portageCommission, lines: regime.lines, cashInCompany: regime.cashInCompany },
  );
  const colors = REGIME_COLORS[regime.id] ?? REGIME_COLORS.Portage;

  return (
    <div className="relative flex-1 min-w-0" style={{ minWidth: 180 }}>
      {/* Glow */}
      <div
        className={cn(
          'absolute -inset-4 rounded-3xl opacity-15 blur-2xl pointer-events-none',
          `bg-gradient-to-b ${colors.gradient}`,
        )}
      />
      <div
        className={cn(
          'relative flex flex-col-reverse overflow-hidden rounded-2xl border-2 shadow-xl w-full transition-all duration-500',
          colors.border,
          'bg-slate-50 dark:bg-slate-900/60',
        )}
        style={{ height: 'min(56vh, 480px)' }}
      >
        {segs.map((s) => (
          <div
            key={s.key}
            style={{ height: `${Math.max(0, s.pct)}%`, background: s.fill }}
            className="w-full min-h-0 transition-all duration-500 relative flex items-center justify-center overflow-hidden"
          >
            {/* Label + % inscrit dans le segment si assez grand */}
            {s.pct >= 6 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center px-1 pointer-events-none">
                <span
                  className="text-[9px] font-black leading-tight text-center drop-shadow"
                  style={{ color: s.ink, textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}
                >
                  {s.label}
                </span>
                <span
                  className="text-[11px] font-black leading-tight mt-0.5 drop-shadow"
                  style={{ color: s.ink, textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}
                >
                  {Math.round(s.pct)}%
                </span>
              </div>
            )}
            {/* Petit point si segment trop petit */}
            {s.pct > 0 && s.pct < 6 && (
              <div className="absolute right-1 top-1/2 -translate-y-1/2">
                <span className="text-[8px] font-black" style={{ color: s.ink }}>
                  {Math.round(s.pct)}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Panneau latéral : paramètres globaux + options du régime actif */
function SettingsSidebarBody({
  sim,
  activeRegimeId,
  openSection,
  setOpenSection,
}: {
  sim: ReturnType<typeof useSimulationContext>;
  activeRegimeId: string | undefined;
  openSection: SidebarPanelId | 'regime_options' | null;
  setOpenSection: (id: SidebarPanelId | 'regime_options' | null) => void;
}) {
  const hasRegimeOptions = activeRegimeId && REGIMES_WITH_OPTIONS.includes(activeRegimeId);

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-700">
      {/* Options spécifiques au régime actif — en premier */}
      {hasRegimeOptions && (
        <div>
          <button
            type="button"
            onClick={() => setOpenSection(openSection === 'regime_options' ? null : 'regime_options')}
            className={cn(
              'w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors',
              openSection === 'regime_options'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100',
            )}
            aria-expanded={openSection === 'regime_options'}
          >
            <span>
              <span className="block font-bold text-sm">Options {activeRegimeId}</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Paramètres spécifiques à ce statut
              </span>
            </span>
            <ChevronRight
              className={cn(
                'w-5 h-5 shrink-0 text-slate-400 transition-transform',
                openSection === 'regime_options' && 'rotate-90',
              )}
            />
          </button>
          {openSection === 'regime_options' && (
            <div className="px-4 pb-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <RegimeParamsInline
                sim={sim}
                regimeId={activeRegimeId}
                align="left"
                variant="light"
              />
            </div>
          )}
        </div>
      )}

      {/* Sections globales */}
      {SIDEBAR_SECTIONS.map((section) => {
        const isOpen = openSection === section.id;
        return (
          <div key={section.id}>
            <button
              type="button"
              onClick={() => setOpenSection(isOpen ? null : section.id)}
              className={cn(
                'w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors',
                isOpen
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100',
              )}
              aria-expanded={isOpen}
            >
              <span>
                <span className="block font-bold text-sm">{section.label}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {section.description}
                </span>
              </span>
              <ChevronRight
                className={cn(
                  'w-5 h-5 shrink-0 text-slate-400 transition-transform',
                  isOpen && 'rotate-90',
                )}
              />
            </button>
            {isOpen && (
              <div className="px-3 pb-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 max-h-[min(65vh,520px)] overflow-y-auto overscroll-contain">
                <ExpandPanels activePanel={section.id} sim={sim} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Comparateur2ViewContent() {
  const sim = useSimulationContext();
  const urlFocus = useComparateurUrlSync(sim.setters);
  const { isConnected } = useUser();

  const regimes = sim.resultats ?? [];
  const [index, setIndex] = useState(0);
  const [openSection, setOpenSection] = useState<SidebarPanelId | 'regime_options' | null>('activite');
  const [showConnectorModal, setShowConnectorModal] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Comparatif-Statuts-FreelanceSimulateur',
    pageStyle: `
      @page { size: A4 portrait; margin: 8mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    `,
  });

  const safeIndex = Math.min(Math.max(index, 0), Math.max(regimes.length - 1, 0));
  const regime = regimes[safeIndex];

  const lastUrlFocusRef = useRef('');
  useEffect(() => {
    if (!urlFocus.key || !urlFocus.regimeId || regimes.length === 0) return;
    const sig = `${urlFocus.key}|${urlFocus.regimeId}`;
    if (lastUrlFocusRef.current === sig) return;
    const idx = regimes.findIndex((r: { id: string }) => r.id === urlFocus.regimeId);
    if (idx < 0) return;
    lastUrlFocusRef.current = sig;
    setIndex(idx);
  }, [urlFocus.key, urlFocus.regimeId, regimes]);

  // Quand on change de régime, ouvrir automatiquement la section options si disponible
  useEffect(() => {
    if (regime && REGIMES_WITH_OPTIONS.includes(regime.id)) {
      setOpenSection('regime_options');
    } else {
      setOpenSection('activite');
    }
  }, [regime?.id]);

  const goPrev = useCallback(() => {
    setIndex((i) => (regimes.length ? (i - 1 + regimes.length) % regimes.length : 0));
  }, [regimes.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (regimes.length ? (i + 1) % regimes.length : 0));
  }, [regimes.length]);

  const typeMicro = sim.state?.typeActiviteMicro ?? 'BNC';
  const plafondMicro = typeMicro === 'BNC' ? PLAFOND_MICRO_BNC : PLAFOND_MICRO_BIC;
  const microPlafondExceeded = regime?.id === 'Micro' && regime.ca > plafondMicro;

  const winnerId = useMemo(() => {
    const eligible = regimes.filter(
      (r: { id: string; ca: number; net: number }) => !(r.id === 'Micro' && r.ca > plafondMicro),
    );
    if (eligible.length === 0) return null;
    return [...eligible].sort((a: { net: number }, b: { net: number }) => b.net - a.net)[0].id as string;
  }, [regimes, plafondMicro]);

  const triggerPdf = () => document.getElementById('comparateur2-pdf-btn')?.click();

  const colors = regime ? (REGIME_COLORS[regime.id] ?? REGIME_COLORS.Portage) : REGIME_COLORS.Portage;

  return (
    <main className="min-h-screen bg-page-settings min-w-0 flex flex-col">
      <button
        id="comparateur2-pdf-btn"
        type="button"
        onClick={() => (isConnected ? handlePrint() : setShowConnectorModal(true))}
        className="sr-only"
      >
        PDF
      </button>

      {/* Header */}
      <header className="relative bg-gradient-to-r from-slate-50 via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 border-b border-indigo-100 dark:border-slate-800 shrink-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100/40 to-transparent dark:from-indigo-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative max-w-[1600px] mx-auto px-4 md:px-6 py-4 md:py-5">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Accueil
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={triggerPdf}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md border border-slate-200 dark:border-slate-700 min-h-[44px] transition-all"
                title="Exporter en PDF"
                aria-label="Exporter en PDF"
              >
                <PdfIcon size={20} className="shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wide hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Comparateur interactif
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  Nouveau
                </span>
              </div>
              <div className="flex items-center gap-4 mt-0.5">
                <Link
                  href="/comparateur"
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <BarChart3 className="w-3 h-3" />
                  Vue tableau classique
                </Link>
                <Link
                  href="/simulateur"
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                >
                  <TrendingUp className="w-3 h-3" />
                  Simulation détaillée
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Corps principal : contenu + panneau latéral */}
      <div className="flex flex-1 min-h-0 min-w-0 w-full">
        <div className="flex-1 min-w-0 flex flex-col">
          {!regime ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 animate-pulse" />
              <p className="text-slate-500 text-sm">Chargement des résultats…</p>
            </div>
          ) : (
            <div className="flex flex-col h-full px-4 md:px-6 py-4 md:py-6 gap-4 max-w-[960px] w-full mx-auto xl:mx-0 xl:max-w-none">

              {/* Navigation par mini-barres */}
              <div className="p-2.5 rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                  {regimes.map((r: any, idx: number) => {
                    const isMicroExceeded = r.id === 'Micro' && r.ca > plafondMicro;
                    return (
                      <MiniNavBar
                        key={r.id}
                        regime={r}
                        isActive={idx === safeIndex}
                        isWinner={r.id === winnerId && !isMicroExceeded}
                        onClick={() => setIndex(idx)}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Carte principale */}
              <div className="flex-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden flex flex-col">
                {/* Bande de couleur */}
                <div className={cn('h-1.5 w-full bg-gradient-to-r shrink-0', colors.gradient)} />

                <div className="flex-1 p-5 md:p-6 flex flex-col gap-6 min-h-0">
                  {/* En-tête statut : fleches + nom + montant */}
                  <div className="flex items-center gap-3">
                    {/* Flèche gauche */}
                    <button
                      type="button"
                      onClick={goPrev}
                      disabled={regimes.length <= 1}
                      className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                      aria-label="Statut précédent"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Nom + montant */}
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                          {regime.id}
                        </h2>
                        {regime.id === winnerId && !microPlafondExceeded && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <Crown className="w-3 h-3" />
                            Meilleur net
                          </span>
                        )}
                        {microPlafondExceeded && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            Plafond dépassé
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-2xl md:text-3xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                          {fmtEur(regime.net / 12)}
                        </span>
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">/mois net</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
                          · {fmtEur(regime.net)}/an
                        </span>
                      </div>
                    </div>

                    {/* Flèche droite */}
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={regimes.length <= 1}
                      className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                      aria-label="Statut suivant"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Breakdown + Histogramme côte à côte */}
                  <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 flex-1 min-h-0">
                    {/* Breakdown */}
                    <div className="lg:w-[320px] xl:w-[360px] shrink-0">
                      <RegimeFinancialBreakdown sim={sim} regime={regime} regimes={regimes} />
                    </div>

                    {/* Histogramme labellisé — prend tout l'espace restant */}
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        Répartition du CA · {fmtEur(regime.ca)}
                      </p>
                      <div className="flex-1 min-h-0" style={{ minHeight: 240 }}>
                        <HistogramBarLabeled regime={regime} />
                      </div>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center">
                        {safeIndex + 1} / {regimes.length} statuts — utilisez les flèches ou cliquez sur une mini-barre
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lien méthodologie */}
              <div className="pt-1 pb-2">
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Méthodologie de calcul&nbsp;:{' '}
                  <Link href="/hypotheses" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    voir le détail des hypothèses
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Panneau latéral — toujours visible sur desktop */}
        <aside className="hidden xl:flex w-[360px] 2xl:w-[400px] shrink-0 flex-col border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden sticky top-0 self-start" style={{ height: '100vh', maxHeight: '100vh' }}>
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-800/50 dark:to-indigo-900/20 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <Settings2 className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                  Paramètres
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                  Simulation en temps réel
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain">
            <SettingsSidebarBody
              sim={sim}
              activeRegimeId={regime?.id}
              openSection={openSection}
              setOpenSection={setOpenSection}
            />
          </div>
        </aside>
      </div>

      {/* Impression PDF */}
      <div className="sr-only" aria-hidden>
        <div ref={printRef} className="p-6 text-slate-900">
          <h1 className="text-lg font-black">Freelance Simulateur — Comparateur (histogramme)</h1>
          {regime && (
            <div className="mt-4 space-y-2 text-sm">
              <p><strong>Statut :</strong> {regime.id}</p>
              <p><strong>Net mensuel :</strong> {fmtEur(regime.net / 12)}</p>
              <p><strong>Net annuel :</strong> {fmtEur(regime.net)}</p>
              <p><strong>CA :</strong> {fmtEur(regime.ca)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile : overlay réglages */}
      <button
        type="button"
        onClick={() => {/* mobile settings TBD */}}
        className="xl:hidden fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-300/40 dark:shadow-indigo-900/40 font-bold text-sm"
        aria-label="Paramètres"
      >
        <Settings2 className="w-4 h-4" />
        Réglages
      </button>

      <ConnectorModal
        open={showConnectorModal}
        onClose={() => setShowConnectorModal(false)}
        title="Connectez-vous pour exporter en PDF"
        message="Connectez-vous ou créez un compte pour exporter en PDF et sauvegarder vos paramètres."
      />
      <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <Footer />
      </div>
    </main>
  );
}

export default function Comparateur2View() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-page-settings flex items-center justify-center px-4">
          <p className="text-slate-500 text-sm">Chargement…</p>
        </main>
      }
    >
      <Comparateur2ViewContent />
    </Suspense>
  );
}
