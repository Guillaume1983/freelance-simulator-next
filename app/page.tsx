'use client';
import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
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
      <main className="min-h-screen relative transition-colors duration-500">
        {/* Fond : grille type comptabilité + dégradé chaleureux et pro */}
        <div className="absolute inset-0 -z-10 bg-page-pro" aria-hidden />
        <div className="absolute inset-0 -z-10 bg-page-pro-gradient" aria-hidden />

        <Header isDark={isDark} setIsDark={setIsDark} saveStatus={sim.saveStatus} />

        {/* ── Bandeau hero : image comptabilité derrière intro + TopCards + Comparatif stratégique ── */}
        <section
          className="section-comparatif-hero relative w-full pt-6 pb-10 md:pt-8 md:pb-14 overflow-hidden"
          aria-label="Simulateur et comparatif des statuts freelance"
        >
          <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1600')" }} />
          <div className="absolute inset-0 z-1 bg-slate-900/55 dark:bg-slate-950/65" aria-hidden />
          <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6">
            <p className="text-sm md:text-base text-white/95 font-medium leading-snug max-w-3xl" style={{ hyphens: 'none', wordBreak: 'normal' }}>
              Renseignez votre activité, vos dépenses et votre situation fiscale — les résultats se recalculent en temps réel.
            </p>
            <TopCards sim={sim} activePanel={activePanel} togglePanel={togglePanel} />
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-lg mt-8 md:mt-10">
              Comparatif stratégique
            </h2>
            <p className="text-base md:text-lg text-white/95 font-medium mt-2 max-w-3xl leading-snug drop-shadow-md" style={{ hyphens: 'none', wordBreak: 'normal' }}>
              Comparez les 5 statuts freelance sur l&apos;ensemble des indicateurs clés — la colonne 🏆 correspond au plus avantageux pour votre profil.
            </p>
          </div>
        </section>

        <div className="max-w-[1600px] mx-auto px-4 md:px-6">
          <ExpandPanels activePanel={activePanel} sim={sim} />
          <ComparisonTable sim={sim} />

          {/* ── Intro avant le tableau de projection ── */}
          <div className="mt-10 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-indigo-100/80 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400 shadow-sm">
                <TrendingUp size={18} />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-white tracking-tight">Projection sur 5 ans</h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                  ACRE an 1{sim.state.acreEnabled ? ' ✅' : ' ✗'} · CFE dès an 2
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-2 leading-relaxed overflow-visible hyphens-none" style={{ wordBreak: 'break-word' }}>
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
