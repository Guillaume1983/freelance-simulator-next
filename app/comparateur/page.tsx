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
      <div className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-500/20 shadow-lg shadow-indigo-900/20">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
            {/* Inputs TJM et Jours */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Calculator size={16} className="text-indigo-300" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-indigo-300/70 uppercase tracking-wider">TJM</span>
                  <NumberInput
                    value={sim.state.tjm ?? 0}
                    onChange={(v) => sim.setters.setTjm(v)}
                    onIncrement={() => sim.setters.setTjm((p: number) => (p || 0) + 10)}
                    onDecrement={() => sim.setters.setTjm((p: number) => Math.max(0, (p || 0) - 10))}
                    suffix="€"
                    label="TJM"
                    inputClassName="!bg-white/10 !border-white/20 !text-white !w-20"
                  />
                </div>
              </div>

              <div className="hidden md:block w-px h-10 bg-indigo-500/30" />

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <TrendingUp size={16} className="text-amber-300" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-amber-300/70 uppercase tracking-wider">Jours / an</span>
                  <NumberInput
                    value={sim.state.days ?? 0}
                    onChange={(v) => sim.setters.setDays(v)}
                    onIncrement={() => sim.setters.setDays((p: number) => Math.min(365, (p || 0) + 5))}
                    onDecrement={() => sim.setters.setDays((p: number) => Math.max(0, (p || 0) - 5))}
                    suffix="j"
                    label="Jours"
                    inputClassName="!bg-white/10 !border-white/20 !text-white !w-20"
                  />
                </div>
              </div>
            </div>

            {/* CA calculé + lien paramètres */}
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-emerald-300/70 uppercase tracking-wider">CA annuel</span>
                <span className="text-xl md:text-2xl font-black text-white tabular-nums">
                  {ca.toLocaleString('fr-FR')} <span className="text-emerald-400 text-base">€</span>
                </span>
              </div>

              <div className="hidden md:block w-px h-10 bg-indigo-500/30" />

              <Link
                href="/reglages"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold transition-all"
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
