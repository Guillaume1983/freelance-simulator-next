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

        <Header isDark={isDark} setIsDark={setIsDark} />
        <TopCards sim={sim} activePanel={activePanel} togglePanel={togglePanel} />

        <div className="max-w-[1600px] mx-auto px-4 md:px-6">
          <ExpandPanels activePanel={activePanel} sim={sim} />

          {/* ── Tableau comparatif (pleine largeur) ── */}
          <ComparisonTable sim={sim} />

          {/* ── Tableau de projection 5 ans (contient le SidePanel intégré) ── */}
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
