'use client';
import { useState } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import Header from '@/components/Header';
import TopCards from '@/components/TopCards';
import ExpandPanels from '@/components/ExpandPanels';
import ComparisonTable from '@/components/ComparisonTable';
import SidePanel from '@/components/SidePanel'; // Nouveau
import Footer from '@/components/Footer';       // Nouveau

export default function Home() {
  const sim = useSimulation();
  const [isDark, setIsDark] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const togglePanel = (panelId: string) => setActivePanel(activePanel === panelId ? null : panelId);

  return (
    <div className={isDark ? 'dark' : ''}>
      <main className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500">
        
        <Header isDark={isDark} setIsDark={setIsDark} />
        
        <TopCards sim={sim} togglePanel={togglePanel} />

        <div className="max-w-[1600px] mx-auto px-6">
          <ExpandPanels activePanel={activePanel} sim={sim} />
          
          <div className="flex gap-6 items-start mt-4">
            <div className={`transition-all duration-500 ${selectedId ? 'w-[68%]' : 'w-full'}`}>
              <ComparisonTable 
                sim={sim} 
                selectedId={selectedId} 
                setSelectedId={setSelectedId} 
              />
            </div>

            {selectedId && (
              <div className="w-[32%]">
                <SidePanel 
                  selectedId={selectedId} 
                  setSelectedId={setSelectedId} 
                />
              </div>
            )}
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}