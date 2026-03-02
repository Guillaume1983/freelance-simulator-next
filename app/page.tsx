'use client';
import { useState } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import Header from '@/components/Header';
import TopCards from '@/components/TopCards';
import ExpandPanels from '@/components/ExpandPanels';
import ComparisonTable from '@/components/ComparisonTable';
import ProjectionSection from '@/components/ProjectionSection';
import SidePanel from '@/components/SidePanel';
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

          {/* ── Tableau projection + panneau analyse (toujours visibles) ── */}
          <div className="flex flex-col md:flex-row gap-6 items-start mt-6">

            {/* Tableau projection */}
            <div className="flex-1 min-w-0">
              <ProjectionSection
                sim={sim}
                activeRegime={projectionRegime}
                setActiveRegime={setProjectionRegime}
              />
            </div>

            {/* Panneau analyse (sticky, desktop uniquement) */}
            <div className="hidden md:block w-[300px] shrink-0">
              <SidePanel selectedId={projectionRegime} />
            </div>

          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
