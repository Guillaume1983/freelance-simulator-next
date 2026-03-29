'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useReactToPrint } from 'react-to-print';
import {
  ArrowLeft,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  Settings2,
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

  const barH = 'min(52vh, 440px)';

  return (
    <div
      className="flex flex-col-reverse overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/60 shadow-inner"
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

      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-indigo-100 dark:border-slate-800 shrink-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
            >
              <ArrowLeft size={16} />
              Accueil
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={triggerPdf}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-600 min-h-[44px]"
                title="Exporter en PDF"
                aria-label="Exporter en PDF"
              >
                <PdfIcon size={22} className="shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wide hidden sm:inline">
                  PDF
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMobileSettingsOpen(true)}
                className="xl:hidden inline-flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 min-h-[44px] font-bold text-xs uppercase tracking-wide"
                aria-label="Ouvrir les paramètres"
              >
                <PanelRightOpen className="w-4 h-4" />
                Réglages
              </button>
              <button
                type="button"
                onClick={() => setDesktopPanelOpen((v) => !v)}
                className="hidden xl:inline-flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 min-h-[44px] font-bold text-xs uppercase tracking-wide"
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
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shrink-0">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Comparateur — vue histogramme
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Même moteur de calcul que le comparateur classique, présentation centrée sur un statut à la fois.
              </p>
              <Link
                href="/comparateur"
                className="inline-block mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Voir la vue tableau classique
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 min-w-0 w-full justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col xl:flex-row gap-8 xl:items-start">
          <div className="flex-1 min-w-0 flex flex-col">
            {!regime ? (
              <p className="text-slate-500 text-sm py-12 text-center">
                Chargement des résultats…
              </p>
            ) : (
              <>
                <div className="w-full text-center xl:text-left mb-6">
                  <div className="flex items-center justify-center xl:justify-start gap-2 flex-wrap">
                    <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {regime.id}
                    </span>
                    {regime.id === winnerId && !microPlafondExceeded && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                        Meilleur net
                      </span>
                    )}
                    {microPlafondExceeded && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                        Plafond micro dépassé
                      </span>
                    )}
                    {['Portage', 'Micro', 'EURL IS', 'SASU'].includes(regime.id) && (
                      <button
                        type="button"
                        onClick={() => setOpenRegimeSettings(regime.id)}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-500 hover:text-indigo-600 w-9 h-9 shadow-sm"
                        aria-label={`Options ${regime.id}`}
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-3xl md:text-4xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                    {fmtEur(regime.net / 12)}
                    <span className="text-sm font-bold text-slate-400 dark:text-slate-500 ml-2">
                      / mois
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {fmtEur(regime.net)} / an · CA {fmtEur(regime.ca)}
                  </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:items-end lg:justify-between w-full">
                  <div className="w-full lg:flex-1 lg:min-w-0 lg:max-w-[min(100%,28rem)]">
                    <RegimeFinancialBreakdown sim={sim} regime={regime} regimes={regimes} />
                  </div>
                  <div className="flex flex-row items-end justify-center gap-3 md:gap-5 shrink-0 pb-1 mx-auto lg:mx-0">
                    <button
                      type="button"
                      onClick={goPrev}
                      disabled={regimes.length <= 1}
                      className="shrink-0 flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                      aria-label="Statut précédent"
                    >
                      <ChevronLeft className="w-7 h-7" />
                    </button>
                    <HistogramBarOnly regime={regime} />
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={regimes.length <= 1}
                      className="shrink-0 flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                      aria-label="Statut suivant"
                    >
                      <ChevronRight className="w-7 h-7" />
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="mt-10 pt-4 border-t border-slate-200/80 dark:border-slate-800">
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Méthodologie&nbsp;:{' '}
                <Link
                  href="/hypotheses"
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  voir le détail
                </Link>
                .
              </p>
            </div>
          </div>

          {desktopPanelOpen && (
            <aside className="hidden xl:flex w-full xl:w-[400px] shrink-0 flex-col rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden max-h-[calc(100vh-10rem)] sticky top-24 self-start">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 shrink-0">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Paramètres
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                  Activité ouverte par défaut — un seul bloc ouvert à la fois
                </p>
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
          className="xl:hidden fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
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
          <div className="relative w-[min(100%,420px)] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <p className="font-bold text-slate-900 dark:text-white">Paramètres</p>
              <button
                type="button"
                onClick={() => setMobileSettingsOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600"
                aria-label="Fermer"
              >
                ✕
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
