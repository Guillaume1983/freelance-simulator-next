'use client';

import Link from 'next/link';
import { useSimulationContext } from '@/context/SimulationContext';
import ComparisonTable from '@/components/ComparisonTable';
import Footer from '@/components/Footer';
import NumberInput from '@/components/NumberInput';
import { BarChart3, Settings } from 'lucide-react';

export default function ComparateurPage() {
  const sim = useSimulationContext();

  return (
    <>
      <div className="top-accent-bar" aria-hidden />

      <main className="min-h-screen bg-page-settings">
        {/* En-tête + paramètres dans une carte blanche */}
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 pt-6 pb-4 md:pt-8 md:pb-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-none p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <BarChart3 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  Comparatif des statuts
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Ajustez TJM et jours — le tableau se met à jour en temps réel
                </p>
                <Link
                  href="/reglages"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  <Settings size={16} />
                  Paramètres
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-6">
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
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 pb-8">
          <ComparisonTable sim={sim} />
        </div>

        <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
          <Footer />
        </div>
      </main>
    </>
  );
}
