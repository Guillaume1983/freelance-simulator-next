'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSimulationContext } from '@/context/SimulationContext';
import ProjectionSection from '@/components/ProjectionSection';
import Footer from '@/components/Footer';
import NumberInput from '@/components/NumberInput';
import { ArrowLeft, TrendingUp, Settings } from 'lucide-react';

const STATUT_SLUG_TO_ID: Record<string, string> = {
  portage: 'Portage',
  micro: 'Micro',
  'eurl-ir': 'EURL IR',
  'eurl-is': 'EURL IS',
  sasu: 'SASU',
};

const VALID_SLUGS = Object.keys(STATUT_SLUG_TO_ID);

export default function SimulateurStatutPage() {
  const params = useParams();
  const router = useRouter();
  const ctx = useSimulationContext();
  const slug = (params?.statut as string)?.toLowerCase() ?? '';
  const statutId = STATUT_SLUG_TO_ID[slug];
  const [activeRegime, setActiveRegimeState] = useState(statutId ?? 'Portage');

  useEffect(() => {
    if (statutId) setActiveRegimeState(statutId);
  }, [statutId]);

  useEffect(() => {
    if (params?.statut && !VALID_SLUGS.includes(slug)) {
      router.replace('/simulateur/sasu');
    }
  }, [params?.statut, slug, router]);

  const setActiveRegime = (id: string) => {
    const newSlug = Object.entries(STATUT_SLUG_TO_ID).find(([, v]) => v === id)?.[0];
    if (newSlug) router.push(`/simulateur/${newSlug}`);
  };

  if (!statutId && params?.statut) return null;

  const sim = ctx.sim ?? ctx;

  return (
    <main className="min-h-screen bg-page-settings">
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          <Link
              href="/comparateur"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Retour au comparateur
            </Link>
            <div className="mt-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Projection sur 5 ans — {statutId}
                </h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  ACRE an 1{ctx.state?.acreEnabled ? ' ✅' : ' ✗'} · CFE dès an 2
                </p>
              </div>
            </div>
          </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 flex-wrap">
              <div>
                <Link
                  href="/reglages"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  <Settings size={16} />
                  Paramètres
                </Link>
              </div>
              <div className="flex flex-wrap items-end gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                    TJM (€/jour)
                  </label>
                  <NumberInput
                    value={sim.state.tjm ?? 0}
                    onChange={(v) => sim.setters.setTjm(v)}
                    onIncrement={() => sim.setters.setTjm((p: number) => (p || 0) + 10)}
                    onDecrement={() => sim.setters.setTjm((p: number) => Math.max(0, (p || 0) - 10))}
                    suffix="€"
                    label="TJM"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                    Jours / an
                  </label>
                  <NumberInput
                    value={sim.state.days ?? 0}
                    onChange={(v) => sim.setters.setDays(v)}
                    onIncrement={() => sim.setters.setDays((p: number) => Math.min(365, (p || 0) + 5))}
                    onDecrement={() => sim.setters.setDays((p: number) => Math.max(0, (p || 0) - 5))}
                    suffix="j"
                    label="Jours"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                    Croissance CA (%/an)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={50}
                      step={1}
                      value={sim.state.growthRate ?? 2}
                      onChange={(e) => sim.setters.setGrowthRate(Number(e.target.value))}
                      className="w-24 h-2 rounded-full accent-indigo-500 bg-slate-200 dark:bg-slate-600"
                      aria-label="Croissance CA par an"
                    />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums w-8">
                      {sim.state.growthRate ?? 2}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-8">
          <ProjectionSection
            sim={ctx}
            activeRegime={activeRegime}
            setActiveRegime={setActiveRegime}
            singleRegime
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <Footer />
      </div>
    </main>
  );
}
