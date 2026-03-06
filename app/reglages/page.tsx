'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, Receipt, Sparkles, Users, ArrowLeft } from 'lucide-react';
import { useSimulationContext } from '@/context/SimulationContext';
import ExpandPanels from '@/components/ExpandPanels';
import Footer from '@/components/Footer';

const TABS = [
  { id: 'activite', label: 'Activité', icon: Zap },
  { id: 'charges', label: 'Charges', icon: Receipt },
  { id: 'opti', label: 'Optimisations', icon: Sparkles },
  { id: 'fiscal', label: 'Situation fiscale', icon: Users },
] as const;

export default function ReglagesPage() {
  const ctx = useSimulationContext();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('activite');
  const sim = ctx.sim ?? ctx;

  return (
    <>
      <main className="relative z-10 min-h-screen bg-white dark:bg-slate-950">
        <div className="top-accent-bar" aria-hidden />

        {/* En-tête et onglets sur fond opaque */}
        <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8 md:py-10">
          <Link
            href="/comparateur"
            className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Retour au comparateur
          </Link>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Paramètres de simulation
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Modifiez votre profil (activité, charges, optimisations, situation fiscale). Ces réglages s’appliquent au comparateur et aux projections.
          </p>

          <div className="flex border-b border-slate-200 dark:border-slate-700 mt-8 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-[12px] font-bold uppercase tracking-wide whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Zone des panneaux : fond sombre pour lisibilité (ExpandPanels en text-white / bg-white/10) */}
        <section className="relative section-projection-hero w-full mt-0">
          <div className="relative z-10 max-w-[900px] mx-auto px-4 md:px-6 py-6 pb-12">
            <ExpandPanels activePanel={activeTab} sim={sim} />
          </div>
        </section>

        <div className="bg-white dark:bg-slate-950">
          <Footer />
        </div>
      </main>
    </>
  );
}
