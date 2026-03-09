'use client';

import Link from 'next/link';
import { useSimulationContext } from '@/context/SimulationContext';
import ComparisonTable from '@/components/ComparisonTable';
import ControlsBar from '@/components/ControlsBar';
import Footer from '@/components/Footer';
import PdfIcon from '@/components/PdfIcon';
import { ArrowLeft, BarChart3, TrendingUp } from 'lucide-react';

export default function ComparateurPage() {
  const sim = useSimulationContext();
  const ca = (sim.state.tjm ?? 0) * (sim.state.days ?? 0);

  const handleExportPdf = () => {
    if (typeof document === 'undefined') return;
    document.getElementById('comparateur-pdf-btn')?.click();
  };

  return (
    <main className="min-h-screen bg-page-settings">
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Retour à l&apos;accueil
            </Link>
            <div className="mt-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none shrink-0">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 flex items-start justify-between gap-4 min-w-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Comparatif des statuts
                    </h1>
                    <button
                      type="button"
                      onClick={handleExportPdf}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-slate-200 dark:border-slate-600"
                      title="Exporter en PDF"
                      aria-label="Exporter le comparatif en PDF"
                    >
                      <PdfIcon size={24} className="shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wide">PDF</span>
                    </button>
                  </div>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">
                    Comparez les 5 statuts freelance en temps réel
                  </p>
                </div>
                <Link
                  href="/simulateur"
                  className="shrink-0 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-base text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-colors"
                >
                  <TrendingUp size={20} />
                  Je lance une simulation
                </Link>
              </div>
            </div>
        </div>
      </header>

      {/* Barre de contrôles sticky */}
      <div className="sticky top-[var(--header-height,60px)] z-40">
        <ControlsBar sim={sim} ca={ca} pageSlug="comparateur" />
      </div>

      {/* Tableau comparatif */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <ComparisonTable sim={sim} />
      </div>

      <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <Footer />
      </div>
    </main>
  );
}
