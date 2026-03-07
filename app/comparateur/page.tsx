'use client';

import Link from 'next/link';
import { useSimulationContext } from '@/context/SimulationContext';
import ComparisonTable from '@/components/ComparisonTable';
import Footer from '@/components/Footer';
import NumberInput from '@/components/NumberInput';
import { ArrowLeft, BarChart3, Settings } from 'lucide-react';

export default function ComparateurPage() {
  const sim = useSimulationContext();

  return (
    <main className="min-h-screen bg-page-settings">
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Retour à l&apos;accueil
            </Link>
            <div className="mt-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Comparatif des statuts
                </h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  Ajustez TJM et jours — le tableau se met à jour en temps réel.
                </p>
              </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <Link
                  href="/reglages"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
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

        <div className="relative z-10 mt-8">
          <ComparisonTable sim={sim} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <Footer />
      </div>
    </main>
  );
}
