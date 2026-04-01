'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useReactToPrint } from 'react-to-print';
import { ArrowLeft, ChevronLeft, ChevronRight, Crown, PanelRightOpen, Settings2, TrendingUp, X } from 'lucide-react';
import { useSimulationContext } from '@/context/SimulationContext';
import { useComparateurUrlSync } from '@/hooks/useComparateurUrlSync';
import { useUser } from '@/hooks/useUser';

import RegimeFinancialBreakdown, {
  RetirementBadge,
} from '@/components/comparateur2/RegimeFinancialBreakdown';
import { HistogramBarLabeled } from '@/components/simulateur/HistogramBarLabeled';
import { REGIME_COLORS, PDF_PAGE_STYLE } from '@/components/simulateur/regimeVisualTokens';
import ConnectorModal from '@/components/ConnectorModal';
import PdfIcon from '@/components/PdfIcon';
import { PLAFOND_MICRO_BNC, PLAFOND_MICRO_BIC } from '@/lib/constants';
import { buildCaRepartitionSegments } from '@/lib/simulateur/caRepartitionColors';
import { regimeIdToStatutSlug } from '@/lib/simulateur/paliers';
import { cn, fmtEur } from '@/lib/utils';
import {
  SimulationSettingsSidebar,
  type SidebarPanelId,
} from '@/components/simulation/SimulationSettingsSidebar';

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
        'relative group flex flex-col items-center gap-1.5 px-2 py-2 rounded-xl transition-all duration-200 min-w-[52px]',
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

function MiniNavStrip({
  regimes,
  safeIndex,
  setIndex,
  winnerId,
  plafondMicro,
}: {
  regimes: any[];
  safeIndex: number;
  setIndex: (i: number) => void;
  winnerId: string | null;
  plafondMicro: number;
}) {
  return (
    <div className="p-2.5 rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/50 w-full min-w-0">
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
  );
}

function Comparateur2ViewContent({ children }: { children?: React.ReactNode }) {
  const sim = useSimulationContext();
  const urlFocus = useComparateurUrlSync(sim.setters);
  const { isConnected } = useUser();

  const regimes = sim.resultats ?? [];
  const [index, setIndex] = useState(0);
  const [openSection, setOpenSection] = useState<SidebarPanelId | 'regime_options' | null>('activite');
  const [showConnectorModal, setShowConnectorModal] = useState(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Comparatif-Statuts-FreelanceSimulateur',
    pageStyle: PDF_PAGE_STYLE,
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
  const microPlafondExceeded = regime?.id === 'Micro' && regime.ca > plafondMicro;

  const winnerId = useMemo(() => {
    const eligible = regimes.filter(
      (r: { id: string; ca: number; net: number }) => !(r.id === 'Micro' && r.ca > plafondMicro),
    );
    if (eligible.length === 0) return null;
    return [...eligible].sort((a: { net: number }, b: { net: number }) => b.net - a.net)[0].id as string;
  }, [regimes, plafondMicro]);

  const simulationHref = useMemo(() => {
    const slug = regime?.id ? regimeIdToStatutSlug(regime.id) ?? 'sasu' : 'sasu';
    return `/simulateur/${slug}?from=comparateur`;
  }, [regime?.id]);

  const triggerPdf = () => document.getElementById('comparateur-pdf-btn')?.click();

  const colors = regime ? (REGIME_COLORS[regime.id] ?? REGIME_COLORS.Portage) : REGIME_COLORS.Portage;

  return (
    <main className="min-h-screen bg-page-settings min-w-0 flex flex-col">
      <button
        id="comparateur-pdf-btn"
        type="button"
        onClick={() => (isConnected ? handlePrint() : setShowConnectorModal(true))}
        className="sr-only"
      >
        PDF
      </button>

      {/* Header — grille 1fr / auto / 1fr : titre centré ; retour à gauche ; CA à droite (≥sm) */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-indigo-100 dark:border-slate-800 shrink-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
            >
              <ArrowLeft size={16} className="shrink-0" />
              <span className="hidden sm:inline">Retour à l&apos;accueil</span>
            </Link>
            <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                Comparatif des statuts
              </h1>
              {regime && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-black tabular-nums text-slate-700 dark:text-slate-200 sm:hidden">
                  {fmtEur(regime.ca)}
                  <span className="text-[9px] font-bold text-slate-400">/an</span>
                </span>
              )}
              <span className="hidden md:inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={triggerPdf}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-slate-200 dark:border-slate-600 min-h-0"
                  title="Exporter en PDF"
                  aria-label="Exporter le comparatif en PDF"
                >
                  <PdfIcon size={20} className="shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wide">PDF</span>
                </button>
              </span>
            </div>
            <div
              className={cn(
                'hidden sm:block justify-self-end text-right',
                !regime && 'sm:min-h-0',
              )}
              aria-hidden={!regime}
            >
              {regime ? (
                <>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    CA annuel
                  </p>
                  <p className="text-xl sm:text-2xl font-black tabular-nums text-slate-900 dark:text-white leading-none mt-0.5">
                    {fmtEur(regime.ca)}
                  </p>
                </>
              ) : null}
            </div>
          </div>
          <div className="mt-1 flex flex-col items-center text-center">
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-snug">
              Histogramme interactif et paramètres intégrés — comparez les 5 statuts en temps réel
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 md:hidden">
              <button
                type="button"
                onClick={triggerPdf}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-600 min-h-[44px]"
                title="Exporter en PDF"
                aria-label="Exporter en PDF"
              >
                <PdfIcon size={24} className="shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wide">PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Corps : grille — ligne 1 pleine largeur (statuts + CTA), ligne 2 = carte | panneau paramètres alignés */}
      <div className="flex flex-1 min-w-0 w-full justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6">
          {!regime ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-500 animate-pulse" />
              <p className="text-slate-500 text-sm">Chargement des résultats…</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 xl:grid xl:grid-cols-[minmax(0,1fr)_min(460px,42vw)] xl:items-start xl:gap-x-8 xl:gap-y-5">
              <div className="flex flex-col md:flex-row md:items-stretch gap-4 xl:hidden">
                <MiniNavStrip
                  regimes={regimes}
                  safeIndex={safeIndex}
                  setIndex={setIndex}
                  winnerId={winnerId}
                  plafondMicro={plafondMicro}
                />
                <Link
                  href={simulationHref}
                  className="shrink-0 inline-flex items-center justify-center gap-2.5 px-5 py-3.5 md:py-3 rounded-xl font-black text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-colors min-h-[48px] self-stretch whitespace-normal text-center md:max-w-[200px] lg:max-w-none lg:whitespace-nowrap w-full md:w-auto"
                >
                  <TrendingUp size={20} className="shrink-0" />
                  Je lance une simulation
                </Link>
              </div>

              <div className="hidden xl:block min-w-0 xl:row-start-1 xl:col-start-1 xl:self-stretch">
                <MiniNavStrip
                  regimes={regimes}
                  safeIndex={safeIndex}
                  setIndex={setIndex}
                  winnerId={winnerId}
                  plafondMicro={plafondMicro}
                />
              </div>

              <div className="hidden xl:flex min-h-0 min-w-0 xl:row-start-1 xl:col-start-2 xl:self-stretch">
                <Link
                  href={simulationHref}
                  className="flex h-full min-h-[48px] w-full items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-black text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-colors whitespace-nowrap"
                >
                  <TrendingUp size={20} className="shrink-0" />
                  Je lance une simulation
                </Link>
              </div>

              <div className="min-w-0 w-full xl:row-start-2 xl:col-start-1 xl:self-start">
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg overflow-visible xl:overflow-hidden flex flex-col h-full xl:max-h-[min(85vh,920px)]">
                  <div className={cn('h-1.5 w-full bg-linear-to-r shrink-0', colors.gradient)} />

                  <div className="p-5 md:p-6 flex flex-col gap-6 flex-1 min-h-0">
                    <div className="flex items-start justify-center gap-2 sm:gap-4">
                      <button
                        type="button"
                        onClick={goPrev}
                        disabled={regimes.length <= 1}
                        className="shrink-0 mt-1 flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                        aria-label="Statut précédent"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <div className="flex-1 min-w-0 text-center px-1">
                        <div className="flex flex-wrap items-center justify-center gap-2">
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
                        <p className="mt-2 text-3xl md:text-4xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                          {fmtEur(regime.net / 12)}
                          <span className="text-sm font-bold text-slate-400 dark:text-slate-500 ml-2">/ mois net</span>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {fmtEur(regime.net)} / an · CA {fmtEur(regime.ca)}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                          <RetirementBadge
                            quarters={regime.retirementQuarters ?? 0}
                            regimeId={regime.id}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={goNext}
                        disabled={regimes.length <= 1}
                        className="shrink-0 mt-1 flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                        aria-label="Statut suivant"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      <div className="flex-1 min-w-0 lg:max-w-[min(100%,28rem)] lg:self-stretch flex min-h-0">
                        <div className="w-full min-h-0">
                          <RegimeFinancialBreakdown sim={sim} regime={regime} regimes={regimes} />
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-end lg:justify-center shrink-0 w-full lg:w-[min(240px,30vw)]">
                        <HistogramBarLabeled regime={regime} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="hidden xl:flex min-h-0 w-full max-h-[min(85vh,920px)] flex-col overflow-hidden xl:row-start-2 xl:col-start-2 xl:sticky xl:self-start" style={{ top: 'calc(var(--header-height, 0px) + 1.5rem)' }}>
                <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm w-full">
                  <div className="hidden px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/50 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                        <Settings2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                          Paramètres
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                          Un bloc ouvert à la fois
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 p-0 overflow-y-auto">
                    <SimulationSettingsSidebar
                      sim={sim}
                      activeRegimeId={regime?.id}
                      openSection={openSection}
                      setOpenSection={setOpenSection}
                    />
                  </div>
                </div>
              </aside>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 min-w-0 xl:row-start-3 xl:col-start-1">
                Méthodologie de calcul&nbsp;:{' '}
                <Link href="/hypotheses" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                  voir le détail des hypothèses
                </Link>
              </p>
            </div>
          )}
        </div>
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

      {/* Mobile / tablette : accès paramètres */}
      <button
        type="button"
        onClick={() => setMobileSettingsOpen(true)}
        className="xl:hidden fixed bottom-20 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl bg-linear-to-r from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-300/40 dark:shadow-indigo-900/40 font-bold text-sm"
        aria-label="Ouvrir les paramètres"
      >
        <PanelRightOpen className="w-4 h-4" />
        Réglages
      </button>

      {mobileSettingsOpen && (
        <div
          className="xl:hidden fixed inset-0 z-[110] flex justify-end bg-black/40 backdrop-blur-sm"
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
          <div className="relative w-[min(100%,min(420px,100vw))] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-700 overflow-y-auto overscroll-y-contain">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 shrink-0 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <span className="text-sm font-black text-slate-900 dark:text-white">Réglages</span>
              <button
                type="button"
                onClick={() => setMobileSettingsOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors"
                aria-label="Fermer les réglages"
              >
                <X size={14} />
                Fermer
              </button>
            </div>
            <div className="p-0 pb-8">
              <SimulationSettingsSidebar
                sim={sim}
                activeRegimeId={regime?.id}
                openSection={openSection}
                setOpenSection={setOpenSection}
              />
            </div>
          </div>
        </div>
      )}

      <ConnectorModal
        open={showConnectorModal}
        onClose={() => setShowConnectorModal(false)}
        title="Connectez-vous pour exporter en PDF"
        message="Connectez-vous ou créez un compte pour exporter en PDF et sauvegarder vos paramètres."
      />
      {children}
    </main>
  );
}

export default function Comparateur2View({ children }: { children?: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-page-settings flex items-center justify-center px-4">
          <p className="text-slate-500 text-sm">Chargement…</p>
        </main>
      }
    >
      <Comparateur2ViewContent>{children}</Comparateur2ViewContent>
    </Suspense>
  );
}
