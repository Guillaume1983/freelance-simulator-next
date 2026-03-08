'use client';

import Link from 'next/link';
import { useSimulationContext } from '@/context/SimulationContext';
import ComparisonTable from '@/components/ComparisonTable';
import Footer from '@/components/Footer';
import NumberInput from '@/components/NumberInput';
import { ArrowLeft, BarChart3, Settings, TrendingUp, Calculator } from 'lucide-react';

export default function ComparateurPage() {
  const sim = useSimulationContext();
  const ca = (sim.state.tjm ?? 0) * (sim.state.days ?? 0);

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
                  Comparez les 5 statuts freelance en temps réel
                </p>
              </div>
          </div>
        </div>
      </header>

      {/* Barre de controle TJM / Jours intégrée */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-850 border-b border-slate-200/80 dark:border-slate-700/50 shadow-md shadow-slate-200/30 dark:shadow-slate-900/20">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
            {/* Inputs TJM et Jours */}
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
            </div>

            {/* CA calculé + lien paramètres */}
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">CA annuel</span>
                <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(ca)}
                </span>
              </div>

              <div className="hidden md:block w-px h-10 bg-slate-200 dark:bg-slate-700" />

              <Link
                href="/reglages"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm font-semibold transition-all"
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Paramètres</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau comparatif */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
        <ComparisonTable sim={sim} />
      </div>

      <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <Footer />
      </div>
    </main>
  );
}
