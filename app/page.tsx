'use client';
import { useState } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import Header from '@/components/Header';
import TopCards from '@/components/TopCards';
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
        
        <TopCards sim={sim} activePanel={activePanel} togglePanel={togglePanel} />

        <div className="max-w-[1600px] mx-auto px-4 md:px-6">
          
          <div className="flex flex-col md:flex-row gap-6 items-start mt-4">
            <div className={`transition-all duration-500 w-full ${selectedId ? 'md:w-[68%]' : 'md:w-full'}`}>
              <ComparisonTable 
                sim={sim} 
                selectedId={selectedId} 
                setSelectedId={setSelectedId} 
              />
            </div>

            {selectedId && (
              <div className="hidden md:block md:w-[32%] md:mt-0">
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