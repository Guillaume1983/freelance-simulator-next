'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSimulationContext } from '@/context/SimulationContext';
import SimulationSection from '@/components/SimulationSection';
import ControlsBar from '@/components/ControlsBar';
import Footer from '@/components/Footer';
import PdfIcon from '@/components/PdfIcon';
import { ArrowLeft, Briefcase, Store, Building2, Building, Rocket, Settings, Sparkles, X } from 'lucide-react';

const REGIME_COLORS: Record<string, string> = {
  'Portage': '#6366f1',
  'Micro': '#f59e0b',
  'EURL IR': '#10b981',
  'EURL IS': '#3b82f6',
  'SASU': '#8b5cf6',
};

const STATUT_SLUG_TO_ID: Record<string, string> = {
  portage: 'Portage',
  micro: 'Micro',
  'eurl-ir': 'EURL IR',
  'eurl-is': 'EURL IS',
  sasu: 'SASU',
};

const STATUT_HEADER_ICON: Record<string, { Icon: typeof Briefcase; iconClass: string }> = {
  'Portage': { Icon: Briefcase, iconClass: 'bg-indigo-500 text-white' },
  'Micro': { Icon: Store, iconClass: 'bg-amber-500 text-white' },
  'EURL IR': { Icon: Building2, iconClass: 'bg-emerald-500 text-white' },
  'EURL IS': { Icon: Building2, iconClass: 'bg-blue-500 text-white' },
  'SASU': { Icon: Building, iconClass: 'bg-violet-500 text-white' },
};

const VALID_SLUGS = Object.keys(STATUT_SLUG_TO_ID);

export default function SimulateurStatutPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ctx = useSimulationContext();
  const slug = (params?.statut as string)?.toLowerCase() ?? '';
  const statutId = STATUT_SLUG_TO_ID[slug];
  const [activeRegime, setActiveRegimeState] = useState(statutId ?? 'Portage');
  // Initialiser depuis sessionStorage pour éviter un clignotement au changement de page (ex. comparateur → simulation)
  const [showSettingsBanner, setShowSettingsBanner] = useState(() => {
    if (typeof window === 'undefined') return false;
    const hasVisited = sessionStorage.getItem('has-visited-settings');
    const dismissed = sessionStorage.getItem('settings-banner-dismissed-sim');
    return !hasVisited && !dismissed;
  });

  // Resynchroniser avec userId et sessionStorage
  useEffect(() => {
    const hasVisitedSettings = typeof window !== 'undefined' && sessionStorage.getItem('has-visited-settings');
    const dismissed = typeof window !== 'undefined' && sessionStorage.getItem('settings-banner-dismissed-sim');
    const sim = ctx.sim ?? ctx;
    setShowSettingsBanner(!sim.state.userId && !hasVisitedSettings && !dismissed);
  }, [(ctx.sim ?? ctx).state.userId]);

  const dismissBanner = () => {
    setShowSettingsBanner(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('settings-banner-dismissed-sim', 'true');
    }
  };

  const backLink = useMemo(() => {
    if (searchParams.get('from') === 'comparateur') {
      return { href: '/comparateur', label: 'Retour au comparateur' };
    }
    return { href: '/simulateur', label: 'Retour à la simulation 5 ans' };
  }, [searchParams]);

  useEffect(() => {
    if (statutId) setActiveRegimeState(statutId);
  }, [statutId]);

  useEffect(() => {
    if (params?.statut && !VALID_SLUGS.includes(slug)) {
      router.replace('/simulateur');
    }
  }, [params?.statut, slug, router]);

  const setActiveRegime = (id: string) => {
    const newSlug = Object.entries(STATUT_SLUG_TO_ID).find(([, v]) => v === id)?.[0];
    if (newSlug) router.push(`/simulateur/${newSlug}`);
  };

  if (!statutId && params?.statut) return null;

  const sim = ctx.sim ?? ctx;
  const ca = (sim.state.tjm ?? 0) * (sim.state.days ?? 0);

  // Croissance par année (5 ans) — utilisée à la fois dans la barre de contrôle et dans la section de simulation
  const [growthByYear, setGrowthByYear] = useState<number[]>(() =>
    Array.from({ length: 5 }, () => sim.state.growthRate ?? 0)
  );

  const updateGrowthYear = (index: number, next: number) => {
    setGrowthByYear(prev =>
      prev.map((v, i) => (i === index ? Math.min(50, Math.max(0, Math.round(next))) : v)),
    );
  };

  const handleExportPdf = () => {
    if (typeof document === 'undefined') return;
    document.getElementById('simulateur-pdf-btn')?.click();
  };

  return (
    <main className="min-h-screen bg-page-settings overflow-x-hidden min-w-0">
      {/* Bannière d'encouragement à configurer — mêmes conditions que comparateur / hub simulateur */}
      {showSettingsBanner && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-black text-sm">
                    Pour des résultats précis, configurez d&apos;abord votre profil !
                  </p>
                  <p className="text-[12px] opacity-90">
                    TJM, charges, véhicule, situation fiscale — vos paramètres alimentent toutes les simulations.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/reglages?from=simulateur/${slug}`}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-white text-slate-900 font-black text-[11px] uppercase tracking-wide hover:bg-slate-100 transition-colors min-h-[44px]"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Configurer
                </Link>
                <button
                  type="button"
                  onClick={dismissBanner}
                  className="p-2.5 rounded-lg hover:bg-white/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-indigo-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <Link
            href={backLink.href}
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeft size={16} />
            {backLink.label}
          </Link>
          <div className="mt-6 flex flex-col sm:flex-row sm:items-start gap-4">
            {statutId && STATUT_HEADER_ICON[statutId] && (() => {
              const { Icon, iconClass } = STATUT_HEADER_ICON[statutId];
              return (
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${iconClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
              );
            })()}
            <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Simulation sur 5 ans — {statutId}
                  </h1>
                  <span className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleExportPdf}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-slate-200 dark:border-slate-600 min-h-[44px]"
                      title="Exporter en PDF"
                      aria-label="Exporter la simulation en PDF"
                    >
                      <PdfIcon size={24} className="shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wide">PDF</span>
                    </button>
                    <Link
                      href={`/reglages?from=simulateur/${slug}`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-600 min-h-[44px]"
                      title="Paramètres"
                      aria-label="Ouvrir les paramètres"
                    >
                      <Settings size={20} className="shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wide">Paramètres</span>
                    </Link>
                  </span>
                </div>
                <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                  ACRE an 1{ctx.state?.acreEnabled ? ' activé' : ' désactivé'} · CFE dès an 2 · Croissance du CA ajustable dans le panneau de paramétrage sous le bandeau
                </p>
              </div>
              <Link
                href={`/partenaires?regime=${encodeURIComponent(statutId ?? '')}`}
                className="shrink-0 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-sm sm:text-base text-white shadow-lg hover:opacity-90 transition-opacity min-h-[48px] w-full sm:w-auto"
                style={{ backgroundColor: REGIME_COLORS[statutId ?? ''] ?? '#6366f1' }}
              >
                <Rocket size={20} />
                Je me lance en {statutId}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Seul le bandeau TJM/Jours est sticky ; chevauchement + ombre vers le haut pour supprimer tout interstice */}
      <div
        className="sticky z-40 border-b border-slate-200/80 dark:border-slate-700/50 bg-page-settings shadow-[0_-8px_0_0_var(--bandeau-sticky-bg)]"
        style={{ top: 'calc(var(--header-height, 56px) - 4px)' }}
      >
        <ControlsBar
            sim={sim}
            ca={ca}
            pageSlug={`simulateur/${slug}`}
            activeRegimeId={activeRegime}
            growthByYear={growthByYear}
            onChangeGrowthYear={updateGrowthYear}
          />
      </div>

      {/* Section simulation */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <SimulationSection
          sim={ctx}
          activeRegime={activeRegime}
          setActiveRegime={setActiveRegime}
          growthByYear={growthByYear}
          singleRegime
        />
      </div>

      <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <Footer />
      </div>
    </main>
  );
}
