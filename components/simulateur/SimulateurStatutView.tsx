'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import {
  ArrowLeft,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  PanelRightOpen,
  Rocket,
  Settings2,
  X,
} from 'lucide-react';
import { useSimulationContext } from '@/context/SimulationContext';
import { useUser } from '@/hooks/useUser';

import ConnectorModal from '@/components/ConnectorModal';
import PdfIcon from '@/components/PdfIcon';
import RegimeFinancialBreakdown, { RetirementBadge } from '@/components/comparateur/RegimeFinancialBreakdown';
import RegimeParamsInline from '@/components/RegimeParamsInline';
import { HistogramBarLabeled } from '@/components/simulateur/HistogramBarLabeled';
import { REGIME_COLORS, STATUT_HEADER_ICON, PDF_PAGE_STYLE } from '@/components/simulateur/regimeVisualTokens';
import {
  SimulationSettingsSidebar,
  type SidebarPanelId,
} from '@/components/simulation/SimulationSettingsSidebar';
import { PLAFOND_MICRO_BNC, PLAFOND_MICRO_BIC } from '@/lib/constants';
import { projeterSurNAns } from '@/lib/projections';
import { buildCaRepartitionSegments } from '@/lib/simulateur/caRepartitionColors';
import { buildComparateurQuery, STATUT_SLUG_TO_ID, VALID_STATUT_SLUGS } from '@/lib/simulateur/paliers';
import { cn, fmtEur } from '@/lib/utils';

const REGIME_HEX: Record<string, string> = {
  Portage: '#6366f1',
  Micro: '#f59e0b',
  'EURL IR': '#10b981',
  'EURL IS': '#3b82f6',
  SASU: '#8b5cf6',
};


/** Même gabarit que MiniNavBar (ComparateurView) — histogramme + libellé uniquement */
function SimulatorYearNavButton({
  regime,
  yearLabel,
  isActive,
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
  yearLabel: string;
  isActive: boolean;
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
      <span
        className={cn(
          'text-[8px] font-bold whitespace-nowrap transition-colors leading-none',
          isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400',
        )}
      >
        {yearLabel}
      </span>
    </button>
  );
}

function YearNavStrip({
  simulations,
  statutId,
  yearIndex,
  setYearIndex,
}: {
  simulations: ReturnType<typeof projeterSurNAns>;
  statutId: string;
  yearIndex: number;
  setYearIndex: (i: number) => void;
}) {
  return (
    <div className="p-2.5 rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/50 w-full min-w-0">
      <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
        {simulations.map((yr, idx) => {
          const r = yr.find((x: { id: string }) => x.id === statutId);
          if (!r) return null;
          return (
            <SimulatorYearNavButton
              key={idx}
              regime={r}
              yearLabel={`An ${idx + 1}`}
              isActive={idx === yearIndex}
              onClick={() => setYearIndex(idx)}
            />
          );
        })}
      </div>
    </div>
  );
}

function SimulateurStatutViewContent({ children }: { children?: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ctx = useSimulationContext();
  const sim = ctx.sim ?? ctx;
  const slug = (params?.statut as string)?.toLowerCase() ?? '';
  const statutId = STATUT_SLUG_TO_ID[slug];

  const [yearIndex, setYearIndex] = useState(0);
  const [openSection, setOpenSection] = useState<SidebarPanelId | 'regime_options' | null>('activite');
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [showConnectorModal, setShowConnectorModal] = useState(false);
  const { isConnected } = useUser();

  const [growthByYear, setGrowthByYear] = useState<number[]>(() =>
    Array.from({ length: 5 }, () => sim.state.growthRate ?? 0),
  );

  const updateGrowthYear = useCallback((index: number, next: number) => {
    setGrowthByYear((prev) =>
      prev.map((v, i) => (i === index ? Math.min(50, Math.max(0, Math.round(next))) : v)),
    );
  }, []);

  useEffect(() => {
    if (statutId) return;
    if (params?.statut && !VALID_STATUT_SLUGS.includes(slug)) {
      router.replace('/simulateur/portage');
    }
  }, [params?.statut, slug, router, statutId]);

  /** Nouveau statut dans l’URL → repartir sur l’année 1 */
  useEffect(() => {
    setYearIndex(0);
  }, [slug]);

  const backLink = useMemo(() => {
    if (searchParams.get('from') === 'comparateur') {
      return { href: '/comparateur', label: 'Retour au comparateur' };
    }
    return { href: '/', label: "Retour à l'accueil" };
  }, [searchParams]);

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
        growthByYear.map((v) => (v ?? 0) / 100),
      ),
    [sim.state, growthByYear],
  );

  const safeYear = Math.min(Math.max(yearIndex, 0), 4);
  const regime = simulations[safeYear]?.find((x: { id: string }) => x.id === statutId);
  const regimesForBreakdown = useMemo(() => {
    const list = simulations
      .map((yr) => yr.find((x: { id: string }) => x.id === statutId))
      .filter(Boolean);
    return list as NonNullable<(typeof list)[number]>[];
  }, [simulations, statutId]);

  const typeMicro = sim.state?.typeActiviteMicro ?? 'BNC';
  const plafondMicro = typeMicro === 'BNC' ? PLAFOND_MICRO_BNC : PLAFOND_MICRO_BIC;
  const microPlafondExceeded = regime?.id === 'Micro' && regime.ca > plafondMicro;

  const colors = regime ? REGIME_COLORS[regime.id] ?? REGIME_COLORS.Portage : REGIME_COLORS.Portage;

  const comparateurHref = regime
    ? `/comparateur${buildComparateurQuery(regime.ca, slug)}`
    : '/comparateur';

  const printRef = useRef<HTMLDivElement>(null);
  const growthInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (safeYear > 0 && typeof window !== 'undefined' && window.innerWidth >= 768) {
      growthInputRef.current?.focus();
    }
  }, [safeYear]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Simulation-5-ans-${statutId ?? 'statut'}-FreelanceSimulateur`,
    pageStyle: PDF_PAGE_STYLE,
  });

  const triggerPdf = () => document.getElementById('simulateur-pdf-btn')?.click();

  if (!statutId && params?.statut) return null;

  const headerIcon = statutId ? STATUT_HEADER_ICON[statutId] : null;

  return (
    <main className="min-h-screen bg-page-settings min-w-0 flex flex-col">
      <button
        id="simulateur-pdf-btn"
        type="button"
        onClick={() => (isConnected ? handlePrint() : setShowConnectorModal(true))}
        className="sr-only"
      >
        PDF
      </button>

      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-indigo-100 dark:border-slate-800 shrink-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-3">
            <Link
              href={backLink.href}
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
            >
              <ArrowLeft size={16} className="shrink-0" />
              <span className="hidden sm:inline">{backLink.label}</span>
            </Link>
            <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                Simulation — {statutId}
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
                  aria-label="Exporter la simulation en PDF"
                >
                  <PdfIcon size={20} className="shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wide">PDF</span>
                </button>
                <Link
                  href={comparateurHref}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-600 text-[10px] font-bold uppercase tracking-wide"
                >
                  <BarChart3 size={14} className="shrink-0" />
                  Comparer
                </Link>
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
                    CA année {safeYear + 1}
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
              Une année à la fois · histogramme et paramètres intégrés · mise à jour en direct
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
              <Link
                href={comparateurHref}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-600 min-h-[44px] text-xs font-bold uppercase tracking-wide"
              >
                Comparer les statuts
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-w-0 w-full justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6">
          {!regime ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-500 animate-pulse" />
              <p className="text-slate-500 text-sm">Chargement des résultats…</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 xl:grid xl:grid-cols-[minmax(0,1fr)_min(460px,42vw)] xl:items-start xl:gap-x-8 xl:gap-y-5">
              <div className="flex flex-col md:flex-row md:items-stretch gap-4 xl:hidden">
                <YearNavStrip
                  simulations={simulations}
                  statutId={statutId}
                  yearIndex={safeYear}
                  setYearIndex={setYearIndex}
                />
                <Link
                  href={`/partenaires?regime=${encodeURIComponent(statutId)}`}
                  className="shrink-0 inline-flex items-center justify-center gap-2.5 px-5 py-3.5 md:py-3 rounded-xl font-black text-sm text-white shadow-lg hover:opacity-90 transition-opacity min-h-[48px] self-stretch text-center md:max-w-[220px] w-full md:w-auto whitespace-normal"
                  style={{ backgroundColor: REGIME_HEX[statutId] ?? '#6366f1' }}
                >
                  <Rocket size={20} className="shrink-0" />
                  Je me lance en {statutId}
                </Link>
              </div>

              <div className="hidden xl:block min-w-0 xl:row-start-1 xl:col-start-1 xl:self-stretch">
                <YearNavStrip
                  simulations={simulations}
                  statutId={statutId}
                  yearIndex={safeYear}
                  setYearIndex={setYearIndex}
                />
              </div>

              <div className="hidden xl:flex min-h-0 min-w-0 xl:row-start-1 xl:col-start-2 xl:self-stretch">
                <Link
                  href={`/partenaires?regime=${encodeURIComponent(statutId)}`}
                  className="flex h-full min-h-[48px] w-full items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-black text-sm text-white shadow-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                  style={{ backgroundColor: REGIME_HEX[statutId] ?? '#6366f1' }}
                >
                  <Rocket size={20} className="shrink-0" />
                  Je me lance en {statutId}
                </Link>
              </div>

              <div className="min-w-0 w-full xl:row-start-2 xl:col-start-1 xl:self-start">
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden flex flex-col h-full">
                  <div className={cn('h-1.5 w-full bg-linear-to-r shrink-0', colors.gradient)} />

                  <div className="p-5 md:p-6 flex flex-col gap-6 flex-1 min-h-0">
                    <div className="flex items-start justify-center gap-2 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => setYearIndex((y) => (y - 1 + 5) % 5)}
                        className="shrink-0 mt-1 flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
                        aria-label="Année précédente"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <div className="flex-1 min-w-0 text-center px-1">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {headerIcon && (
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${headerIcon.iconClass}`}
                            >
                              <headerIcon.Icon className="w-5 h-5" />
                            </div>
                          )}
                          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                              Année {safeYear + 1}
                            </h2>
                            {safeYear > 0 && (
                              <span
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-300/90 dark:border-emerald-700 bg-emerald-50/90 dark:bg-emerald-950/40 px-2 py-1 shadow-sm"
                                title="Taux de croissance du CA par rapport à l'année précédente"
                              >
                                <input
                                  ref={growthInputRef}
                                  type="number"
                                  min={0}
                                  max={50}
                                  step={1}
                                  inputMode="numeric"
                                  value={(growthByYear[safeYear] ?? 0) || ''}
                                  placeholder="0"
                                  onChange={(e) => updateGrowthYear(safeYear, Number(e.target.value))}
                                  className="w-10 min-w-0 text-center text-[12px] font-bold py-0.5 rounded border-0 bg-transparent text-emerald-900 dark:text-emerald-100 placeholder:text-emerald-400/70 focus:outline-none focus:bg-emerald-100/30 dark:focus:bg-emerald-900/40 tabular-nums"
                                  aria-label={`Croissance du chiffre d'affaires pour l'année ${safeYear + 1} (par rapport à l'année précédente)`}
                                />
                                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 whitespace-nowrap">% CA</span>
                              </span>
                            )}
                          </div>
                          {microPlafondExceeded && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              Plafond micro dépassé
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
                          <RetirementBadge quarters={regime.retirementQuarters ?? 0} regimeId={regime.id} />
                        </div>
                        <div className="mt-3">
                          <RegimeParamsInline sim={sim} regimeId={regime.id} align="center" />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setYearIndex((y) => (y + 1) % 5)}
                        className="shrink-0 mt-1 flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
                        aria-label="Année suivante"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      <div className="flex-1 min-w-0 lg:max-w-[min(100%,28rem)] lg:self-stretch flex min-h-0">
                        <div className="w-full min-h-0">
                          <RegimeFinancialBreakdown sim={sim} regime={regime} regimes={regimesForBreakdown} />
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
                      sim={ctx}
                      activeRegimeId={statutId}
                      openSection={openSection}
                      setOpenSection={setOpenSection}
                      suppressNonApplicablePanels
                    />
                  </div>
                </div>
              </aside>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 min-w-0 xl:row-start-3 xl:col-start-1">
                Hypothèses détaillées&nbsp;:{' '}
                <Link href="/hypotheses" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                  voir la méthodologie
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="sr-only" aria-hidden>
        <div ref={printRef} className="p-6 text-slate-900">
          <h1 className="text-lg font-black">Freelance Simulateur — Simulation 5 ans ({statutId})</h1>
          {regime && (
            <div className="mt-4 space-y-2 text-sm">
              <p>
                <strong>Année :</strong> {safeYear + 1}
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
                sim={ctx}
                activeRegimeId={statutId}
                openSection={openSection}
                setOpenSection={setOpenSection}
                suppressNonApplicablePanels
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

export default function SimulateurStatutView({ children }: { children?: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-page-settings flex items-center justify-center px-4">
          <p className="text-slate-500 text-sm">Chargement…</p>
        </main>
      }
    >
      <SimulateurStatutViewContent>{children}</SimulateurStatutViewContent>
    </Suspense>
  );
}
