'use client';
import { useState } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import Header from '@/components/Header';
import TopCards from '@/components/TopCards';
import ExpandPanels from '@/components/ExpandPanels';
import ComparisonTable from '@/components/ComparisonTable';
import ProjectionSection from '@/components/ProjectionSection';
import Footer from '@/components/Footer';

export default function Home() {
  const sim = useSimulation();
  const [isDark, setIsDark]           = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [projectionRegime, setProjectionRegime] = useState('Portage');

  const togglePanel = (panelId: string) =>
    setActivePanel(activePanel === panelId ? null : panelId);

  return (
    <div className={isDark ? 'dark' : ''}>
      <main className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500">

        <Header isDark={isDark} setIsDark={setIsDark} saveStatus={sim.saveStatus} />

        {/* ── Intro avant les 4 blocs de paramètres ── */}
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 mt-6 mb-2">
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-semibold">
            Renseignez votre TJM, votre foyer et vos charges — les résultats se recalculent en temps réel.
          </p>
        </div>

        <TopCards sim={sim} activePanel={activePanel} togglePanel={togglePanel} />

        <div className="max-w-[1600px] mx-auto px-4 md:px-6">
          <ExpandPanels activePanel={activePanel} sim={sim} />

          {/* ── Intro avant le tableau comparatif ── */}
          <div className="mt-8 mb-2">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-tight dark:text-white">Comparatif stratégique</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
              Comparez les 5 statuts freelance sur l&apos;ensemble des indicateurs clés — la colonne 🏆 correspond au plus avantageux pour votre profil.
            </p>
          </div>

          <ComparisonTable sim={sim} />

          {/* ── Intro avant le tableau de projection ── */}
          <div className="mt-10 mb-2">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-tight dark:text-white">Trajectoire sur 5 ans</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
              Visualisez votre business plan sur 5 ans — sélectionnez un statut et ajustez le taux de croissance annuel du CA.
            </p>
          </div>

          <ProjectionSection
            sim={sim}
            activeRegime={projectionRegime}
            setActiveRegime={setProjectionRegime}
          />
        </div>

        <Footer />
      </main>
    </div>
  );
}
