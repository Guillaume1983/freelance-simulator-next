'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSimulationContext } from '@/context/SimulationContext';
import ComparisonTable from '@/components/ComparisonTable';
import ControlsBar from '@/components/ControlsBar';
import Footer from '@/components/Footer';
import PdfIcon from '@/components/PdfIcon';
import { ArrowLeft, BarChart3, TrendingUp, Settings, AlertCircle, X, Sparkles } from 'lucide-react';

export default function ComparateurPage() {
  const sim = useSimulationContext();
  const ca = (sim.state.tjm ?? 0) * (sim.state.days ?? 0);
  const [showSettingsBanner, setShowSettingsBanner] = useState(false);

  // Resynchroniser avec userId (contexte peut arriver après le 1er rendu) et avec sessionStorage
  useEffect(() => {
    const hasVisitedSettings = typeof window !== 'undefined' && sessionStorage.getItem('has-visited-settings');
    const dismissed = typeof window !== 'undefined' && sessionStorage.getItem('settings-banner-dismissed');
    setShowSettingsBanner(!sim.state.userId && !hasVisitedSettings && !dismissed);
  }, [sim.state.userId]);

  const dismissBanner = () => {
    setShowSettingsBanner(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('settings-banner-dismissed', 'true');
    }
  };

  const handleExportPdf = () => {
    if (typeof document === 'undefined') return;
    document.getElementById('comparateur-pdf-btn')?.click();
  };

  return (
    <main className="min-h-screen bg-page-settings overflow-x-hidden min-w-0">
      {/* Bannière d'encouragement à configurer */}
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
                    Personnalisez vos résultats !
                  </p>
                  <p className="text-[12px] opacity-90">
                    Configurez votre TJM, charges et situation pour un comparatif adapté à votre profil.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/reglages?from=comparateur"
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
            <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Comparatif des statuts
                  </h1>
                  <span className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleExportPdf}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-slate-200 dark:border-slate-600 min-h-[44px]"
                      title="Exporter en PDF"
                      aria-label="Exporter le comparatif en PDF"
                    >
                      <PdfIcon size={24} className="shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wide">PDF</span>
                    </button>
                    <Link
                      href="/reglages?from=comparateur"
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
                  Comparez les 5 statuts freelance en temps réel
                </p>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 italic">
                  Résultats estimatifs et pédagogiques, basés sur des hypothèses simplifiées et les barèmes 2026. Ne remplace pas un conseil personnalisé.
                </p>
              </div>
              <Link
                href="/simulateur"
                className="shrink-0 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-sm sm:text-base text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-colors min-h-[48px] w-full sm:w-auto"
              >
                <TrendingUp size={20} />
                Je lance une simulation
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
        <ControlsBar sim={sim} ca={ca} pageSlug="comparateur" />
      </div>

      {/* Tableau comparatif */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <ComparisonTable sim={sim} />
      </div>

      {/* Lien discret vers la méthodologie */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-4">
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Méthodologie de calcul&nbsp;:&nbsp;
          <Link href="/hypotheses" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            voir le détail
          </Link>
          .
        </p>
      </div>

      <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <Footer />
      </div>
    </main>
  );
}
