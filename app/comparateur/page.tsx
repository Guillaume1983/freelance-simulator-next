'use client';

import type { Metadata } from 'next';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSimulationContext } from '@/context/SimulationContext';
import ComparisonTable from '@/components/ComparisonTable';
import ControlsBar from '@/components/ControlsBar';
import Footer from '@/components/Footer';
import PdfIcon from '@/components/PdfIcon';
import { ArrowLeft, BarChart3, TrendingUp, Settings, AlertCircle, X, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Comparateur statuts freelance 2026 — Portage, Micro, EURL, SASU',
  description:
    'Comparez en temps réel votre revenu net en portage salarial, micro-entreprise, EURL IR/IS et SASU à partir de votre TJM, de vos charges et de votre situation fiscale.',
};

export default function ComparateurPage() {
  const sim = useSimulationContext();
  const ca = (sim.state.tjm ?? 0) * (sim.state.days ?? 0);
  // Initialiser depuis sessionStorage pour éviter un clignotement au changement de page (sinon 1er rendu = false, puis effet = true)
  const [showSettingsBanner, setShowSettingsBanner] = useState(() => {
    if (typeof window === 'undefined') return false;
    const hasVisited = sessionStorage.getItem('has-visited-settings');
    const dismissed = sessionStorage.getItem('settings-banner-dismissed');
    return !hasVisited && !dismissed;
  });

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
    <main className="min-h-screen bg-page-settings">
      {/* Bannière d'encouragement à configurer */}
      {showSettingsBanner && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-slate-900 font-black text-[11px] uppercase tracking-wide hover:bg-slate-100 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Configurer
                </Link>
                <button
                  type="button"
                  onClick={dismissBanner}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
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
                    <Link
                      href="/reglages?from=comparateur"
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-600"
                      title="Paramètres"
                      aria-label="Ouvrir les paramètres"
                    >
                      <Settings size={20} className="shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wide">Paramètres</span>
                    </Link>
                  </div>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">
                    Comparez les 5 statuts freelance en temps réel
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 italic">
                    Résultats estimatifs et pédagogiques, basés sur des hypothèses simplifiées et les barèmes 2026. Ne remplace pas un conseil personnalisé.
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
