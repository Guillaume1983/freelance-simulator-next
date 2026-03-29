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
  PanelRightClose,
  PanelRightOpen,
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

// Couleurs par régime pour la navigation
const REGIME_COLORS: Record<string, { gradient: string; bg: string; border: string }> = {
  Portage: { gradient: 'from-violet-500 to-indigo-600', bg: 'bg-violet-500', border: 'border-violet-500' },
  Micro: { gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-500', border: 'border-amber-500' },
  'EURL IR': { gradient: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-500', border: 'border-emerald-500' },
  'EURL IS': { gradient: 'from-blue-400 to-cyan-500', bg: 'bg-blue-500', border: 'border-blue-500' },
  SASU: { gradient: 'from-rose-400 to-pink-500', bg: 'bg-rose-500', border: 'border-rose-500' },
};

const SIDEBAR_SECTIONS = [
  { id: 'activite' as const, label: 'Activité', description: 'CA, TJM, jours travaillés' },
  { id: 'charges' as const, label: 'Charges', description: 'Frais professionnels' },
  { id: 'amortissement' as const, label: 'Amortissement', description: 'Achat matériel année 1' },
  { id: 'vehicule' as const, label: 'Véhicule', description: 'Indemnités kilométriques' },
  { id: 'opti' as const, label: 'Optimisations', description: 'Loyer, avantages' },
  { id: 'cotisations' as const, label: 'Cotisations', description: 'ACRE, CFE' },
  { id: 'foyer' as const, label: 'Foyer', description: 'Situation familiale' },
] as const;

type SidebarPanelId = (typeof SIDEBAR_SECTIONS)[number]['id'];

/** Mini barre pour la navigation entre régimes */
function MiniNavBar({
  regime,
  isActive,
  isWinner,
  onClick,
}: {
  regime: {
    id: string;
    ca: number;
    fees: number;
    cotis: number;
    ir: number;
    net: number;
    lines?: { id?: string; amount?: number }[];
    cashInCompany?: number;
  };
  isActive: boolean;
  isWinner: boolean;
  onClick: () => void;
}) {
  const portageCommission =
    regime.lines?.find((l) => l.id === 'portage_commission')?.amount ?? 0;
  const segs = buildCaRepartitionSegments(
    regime.ca,
    { fees: regime.fees, cotis: regime.cotis, ir: regime.ir, net: regime.net },
    {
      regimeId: regime.id,
      portageCommission,
      lines: regime.lines,
      cashInCompany: regime.cashInCompany,
    },
  );

  const colors = REGIME_COLORS[regime.id] || REGIME_COLORS.Portage;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative group flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-300',
        isActive
          ? 'bg-white dark:bg-slate-800 shadow-lg scale-105 ring-2 ring-indigo-500 dark:ring-indigo-400'
          : 'hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-md',
      )}
    >
      {isWinner && (
        <div className="absolute -top-2 -right-1 z-10">
          <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
        </div>
      )}
      <div
        className={cn(
          'flex flex-col-reverse overflow-hidden rounded-lg border transition-all duration-300',
          isActive ? `border-2 ${colors.border}` : 'border-slate-200 dark:border-slate-600',
        )}
        style={{ width: 32, height: 64 }}
      >
        {segs.map((s) => (
          <div
            key={s.key}
            style={{ height: `${Math.max(0, s.pct)}%`, background: s.fill }}
            className="w-full min-h-0 transition-all duration-500"
          />
        ))}
      </div>
      <span
        className={cn(
          'text-[9px] font-bold whitespace-nowrap transition-colors',
          isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400',
        )}
      >
        {regime.id}
      </span>
    </button>
  );
}

/** Grande barre empilée seule (légende % dans la colonne détail à gauche). */
function HistogramBarOnly({
  regime,
}: {
  regime: {
    id: string;
    ca: number;
    fees: number;
    cotis: number;
    ir: number;
    net: number;
    lines?: { id?: string; amount?: number }[];
    cashInCompany?: number;
  };
}) {
  const portageCommission =
    regime.lines?.find((l) => l.id === 'portage_commission')?.amount ?? 0;
  const segs = buildCaRepartitionSegments(
    regime.ca,
    { fees: regime.fees, cotis: regime.cotis, ir: regime.ir, net: regime.net },
    {
      regimeId: regime.id,
      portageCommission,
      lines: regime.lines,
      cashInCompany: regime.cashInCompany,
    },
  );

  const colors = REGIME_COLORS[regime.id] || REGIME_COLORS.Portage;
  const barH = 'min(52vh, 440px)';

  return (
    <div className="relative">
      {/* Glow effect */}
      <div
        className={cn(
          'absolute -inset-3 rounded-3xl opacity-20 blur-xl transition-all duration-500',
          `bg-gradient-to-b ${colors.gradient}`,
        )}
      />
      <div
        className={cn(
          'relative flex flex-col-reverse overflow-hidden rounded-2xl border-2 shadow-xl transition-all duration-500',
          colors.border,
          'bg-slate-50 dark:bg-slate-900/60',
        )}
        style={{ width: 140, height: barH }}
      >
        {segs.map((s) => (
          <div
            key={s.key}
            style={{ height: `${Math.max(0, s.pct)}%`, background: s.fill }}
            className="w-full min-h-0 transition-all duration-500"
            title={`${s.label} : ${Math.round(s.pct)}%`}
          />
        ))}
      </div>
    </div>
  );
}

function SettingsSidebarBody({
  sim,
  openSection,
  setOpenSection,
}: {
  sim: ReturnType<typeof useSimulationContext>;
  openSection: SidebarPanelId | null;
  setOpenSection: (id: SidebarPanelId | null) => void;
}) {
  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-700 border-t border-slate-200 dark:border-slate-700">
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
  const [openSection, setOpenSection] = useState<SidebarPanelId | null>('activite');
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [openRegimeSettings, setOpenRegimeSettings] = useState<string | null>(null);
  const [desktopPanelOpen, setDesktopPanelOpen] = useState(true);
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

  const goPrev = useCallback(() => {
    setIndex((i) => (regimes.length ? (i - 1 + regimes.length) % regimes.length : 0));
  }, [regimes.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (regimes.length ? (i + 1) % regimes.length : 0));
  }, [regimes.length]);

  const typeMicro = sim.state?.typeActiviteMicro ?? 'BNC';
  const plafondMicro = typeMicro === 'BNC' ? PLAFOND_MICRO_BNC : PLAFOND_MICRO_BIC;
  const microPlafondExceeded =
    regime?.id === 'Micro' && regime.ca > plafondMicro;

  const winnerId = useMemo(() => {
    const eligible = regimes.filter(
      (r: { id: string; ca: number; net: number }) =>
        !(r.id === 'Micro' && r.ca > plafondMicro),
    );
    if (eligible.length === 0) return null;
    return [...eligible].sort((a: { net: number }, b: { net: number }) => b.net - a.net)[0]
      .id as string;
  }, [regimes, plafondMicro]);

  const triggerPdf = () => {
    document.getElementById('comparateur2-pdf-btn')?.click();
  };

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

      {/* Header avec gradient subtil */}
      <header className="relative bg-gradient-to-r from-slate-50 via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 border-b border-indigo-100 dark:border-slate-800 shrink-0 overflow-hidden">
        {/* Decorative gradient blob */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100/40 to-transparent dark:from-indigo-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-5">
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
                <span className="text-xs font-bold uppercase tracking-wide hidden sm:inline">
                  PDF
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMobileSettingsOpen(true)}
                className="xl:hidden inline-flex items-center gap-2 rounded-xl px-3 py-2 text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-md hover:shadow-lg min-h-[44px] font-bold text-xs uppercase tracking-wide transition-all"
                aria-label="Ouvrir les paramètres"
              >
                <Settings2 className="w-4 h-4" />
                Réglages
              </button>
              <button
                type="button"
                onClick={() => setDesktopPanelOpen((v) => !v)}
                className={cn(
                  'hidden xl:inline-flex items-center gap-2 rounded-xl px-3 py-2 min-h-[44px] font-bold text-xs uppercase tracking-wide transition-all',
                  desktopPanelOpen
                    ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800'
                    : 'text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md',
                )}
                aria-expanded={desktopPanelOpen}
                aria-label={desktopPanelOpen ? 'Masquer le panneau' : 'Afficher le panneau'}
              >
                {desktopPanelOpen ? (
                  <PanelRightClose className="w-4 h-4" />
                ) : (
                  <PanelRightOpen className="w-4 h-4" />
                )}
                Panneau
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/50 shrink-0">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Comparateur interactif
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  Nouveau
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Explorez chaque statut en détail avec une vue focalisée et personnalisez vos paramètres en temps réel.
              </p>
              <div className="flex items-center gap-4 mt-2">
                <Link
                  href="/comparateur"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Vue tableau classique
                </Link>
                <Link
                  href="/simulateur"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Simulation détaillée
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 min-w-0 w-full justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col xl:flex-row gap-6 xl:gap-8 xl:items-start">
          <div className="flex-1 min-w-0 flex flex-col">
            {!regime ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 animate-pulse" />
                <p className="text-slate-500 text-sm">Chargement des résultats…</p>
              </div>
            ) : (
              <>
                {/* Navigation par mini-barres */}
                <div className="mb-6 p-3 rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/50">
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

                {/* Carte principale du régime sélectionné */}
                <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
                  {/* Bande de couleur en haut */}
                  <div
                    className={cn(
                      'h-1.5 w-full bg-gradient-to-r',
                      REGIME_COLORS[regime.id]?.gradient || 'from-indigo-500 to-violet-500',
                    )}
                  />
                  
                  <div className="p-5 md:p-6">
                    {/* En-tête du régime */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {regime.id}
                          </h2>
                          {regime.id === winnerId && !microPlafondExceeded && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                              <Crown className="w-3 h-3" />
                              Meilleur net
                            </span>
                          )}
                          {microPlafondExceeded && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-sm">
                              Plafond dépassé
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex items-baseline gap-2 flex-wrap">
                          <span className="text-3xl md:text-4xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                            {fmtEur(regime.net / 12)}
                          </span>
                          <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
                            / mois net
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                          {fmtEur(regime.net)} / an · CA annuel {fmtEur(regime.ca)}
                        </p>
                      </div>
                      
                      {['Portage', 'Micro', 'EURL IS', 'SASU'].includes(regime.id) && (
                        <button
                          type="button"
                          onClick={() => setOpenRegimeSettings(regime.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
                          aria-label={`Options ${regime.id}`}
                        >
                          <Settings2 className="w-4 h-4" />
                          <span className="text-xs font-bold">Options</span>
                        </button>
                      )}
                    </div>

                    {/* Contenu : breakdown + histogramme */}
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-stretch">
                      {/* Breakdown détaillé */}
                      <div className="flex-1 min-w-0">
                        <RegimeFinancialBreakdown sim={sim} regime={regime} regimes={regimes} />
                      </div>
                      
                      {/* Histogramme avec navigation */}
                      <div className="flex flex-col items-center justify-center gap-4 shrink-0 lg:pl-4 lg:border-l border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                          Répartition du CA
                        </p>
                        <div className="flex flex-row items-center justify-center gap-3 md:gap-4">
                          <button
                            type="button"
                            onClick={goPrev}
                            disabled={regimes.length <= 1}
                            className="shrink-0 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 disabled:opacity-30 disabled:pointer-events-none transition-all"
                            aria-label="Statut précédent"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <HistogramBarOnly regime={regime} />
                          <button
                            type="button"
                            onClick={goNext}
                            disabled={regimes.length <= 1}
                            className="shrink-0 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 disabled:opacity-30 disabled:pointer-events-none transition-all"
                            aria-label="Statut suivant"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center">
                          {safeIndex + 1} / {regimes.length} statuts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Lien méthodologie */}
            <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800">
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Méthodologie de calcul&nbsp;:{' '}
                <Link
                  href="/hypotheses"
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  voir le détail des hypothèses
                </Link>
              </p>
            </div>
          </div>

          {desktopPanelOpen && (
            <aside className="hidden xl:flex w-full xl:w-[380px] shrink-0 flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden max-h-[calc(100vh-10rem)] sticky top-24 self-start shadow-lg">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-800/50 dark:to-indigo-900/20 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                    <Settings2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                      Paramètres
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Personnalisez votre simulation
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain">
                <SettingsSidebarBody
                  sim={sim}
                  openSection={openSection}
                  setOpenSection={setOpenSection}
                />
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Impression PDF (contenu minimal) */}
      <div className="sr-only" aria-hidden>
        <div ref={printRef} className="p-6 text-slate-900">
          <h1 className="text-lg font-black">Freelance Simulateur — Comparateur (histogramme)</h1>
          {regime && (
            <div className="mt-4 space-y-2 text-sm">
              <p>
                <strong>Statut :</strong> {regime.id}
              </p>
              <p>
                <strong>Net mensuel :</strong> {fmtEur(regime.net / 12)}
              </p>
              <p>
                <strong>Net annuel :</strong> {fmtEur(regime.net)}
              </p>
              <p>
                <strong>CA :</strong> {fmtEur(regime.ca)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile / tablette : overlay réglages */}
      {mobileSettingsOpen && (
        <div
          className="xl:hidden fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Paramètres"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Fermer"
            onClick={() => setMobileSettingsOpen(false)}
          />
          <div className="relative w-[min(100%,420px)] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-800/50 dark:to-indigo-900/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg">
                  <Settings2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Paramètres</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Personnalisez votre simulation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileSettingsOpen(false)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                aria-label="Fermer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <SettingsSidebarBody
                sim={sim}
                openSection={openSection}
                setOpenSection={setOpenSection}
              />
            </div>
          </div>
        </div>
      )}

      {openRegimeSettings && (
        <div
          className="fixed inset-0 z-9998 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => setOpenRegimeSettings(null)}
        >
          <div
            className="max-w-md w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.16em]">
                Paramètres {openRegimeSettings}
              </h3>
              <button
                type="button"
                onClick={() => setOpenRegimeSettings(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <RegimeParamsInline
              sim={sim}
              regimeId={openRegimeSettings}
              align="left"
              variant="light"
            />
          </div>
        </div>
      )}

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
