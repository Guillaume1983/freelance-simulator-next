'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSimulationContext } from '@/context/SimulationContext';
import SimulationSection from '@/components/SimulationSection';
import Footer from '@/components/Footer';
import NumberInput from '@/components/NumberInput';
import { ArrowLeft, Settings, Briefcase, Store, Building2, Building, Calculator, TrendingUp, Percent } from 'lucide-react';

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

const STATUT_COLORS: Record<string, { bg: string; accent: string }> = {
  'Portage': { bg: 'from-indigo-950 via-indigo-900 to-slate-900', accent: 'indigo' },
  'Micro': { bg: 'from-amber-950 via-amber-900 to-slate-900', accent: 'amber' },
  'EURL IR': { bg: 'from-emerald-950 via-emerald-900 to-slate-900', accent: 'emerald' },
  'EURL IS': { bg: 'from-blue-950 via-blue-900 to-slate-900', accent: 'blue' },
  'SASU': { bg: 'from-violet-950 via-violet-900 to-slate-900', accent: 'violet' },
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
  const colors = STATUT_COLORS[statutId] ?? STATUT_COLORS['Portage'];

  return (
    <main className="min-h-screen bg-page-settings">
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          <Link
              href={backLink.href}
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
            >
              <ArrowLeft size={16} />
              {backLink.label}
            </Link>
            <div className="mt-6 flex items-start gap-4">
              {statutId && STATUT_HEADER_ICON[statutId] && (() => {
                const { Icon, iconClass } = STATUT_HEADER_ICON[statutId];
                return (
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${iconClass}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                );
              })()}
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Simulation sur 5 ans — {statutId}
                </h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  ACRE an 1{ctx.state?.acreEnabled ? ' ✅' : ' ✗'} · CFE dès an 2
                </p>
              </div>
            </div>
          </div>
      </header>

      {/* Barre de controle sticky */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-850 border-b border-slate-200/80 dark:border-slate-700/50 shadow-md shadow-slate-200/30 dark:shadow-slate-900/20">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
            {/* Inputs TJM, Jours et Croissance */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <Calculator size={16} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">TJM</span>
                  <NumberInput
                    value={sim.state.tjm ?? 0}
                    onChange={(v) => sim.setters.setTjm(v)}
                    onIncrement={() => sim.setters.setTjm((p: number) => (p || 0) + 10)}
                    onDecrement={() => sim.setters.setTjm((p: number) => Math.max(0, (p || 0) - 10))}
                    suffix="€"
                    label="TJM"
                    inputClassName="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white w-20"
                  />
                </div>
              </div>

              <div className="hidden md:block w-px h-10 bg-slate-200 dark:bg-slate-700" />

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <TrendingUp size={16} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jours / an</span>
                  <NumberInput
                    value={sim.state.days ?? 0}
                    onChange={(v) => sim.setters.setDays(v)}
                    onIncrement={() => sim.setters.setDays((p: number) => Math.min(365, (p || 0) + 5))}
                    onDecrement={() => sim.setters.setDays((p: number) => Math.max(0, (p || 0) - 5))}
                    suffix="j"
                    label="Jours"
                    inputClassName="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white w-20"
                  />
                </div>
              </div>

              <div className="hidden md:block w-px h-10 bg-slate-200 dark:bg-slate-700" />

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <Percent size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Croissance / an</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={50}
                      step={1}
                      value={sim.state.growthRate ?? 2}
                      onChange={(e) => sim.setters.setGrowthRate(Number(e.target.value))}
                      className="w-20 h-2 rounded-full accent-indigo-600 dark:accent-indigo-400 bg-slate-200 dark:bg-slate-700"
                      aria-label="Croissance CA par an"
                    />
                    <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums w-8">
                      {sim.state.growthRate ?? 2}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CA calculé + lien paramètres */}
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">CA an 1</span>
                <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(ca)}
                </span>
              </div>

              <div className="hidden md:block w-px h-10 bg-slate-200 dark:bg-slate-700" />

              <Link
                href={`/reglages?from=simulateur&statut=${slug}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm font-semibold transition-all"
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Paramètres</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Section simulation */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
        <SimulationSection
          sim={ctx}
          activeRegime={activeRegime}
          setActiveRegime={setActiveRegime}
          singleRegime
        />
      </div>

      <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <Footer />
      </div>
    </main>
  );
}
