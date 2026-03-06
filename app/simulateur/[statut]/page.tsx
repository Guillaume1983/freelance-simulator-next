'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSimulationContext } from '@/context/SimulationContext';
import ProjectionSection from '@/components/ProjectionSection';
import RegimeParamsInline from '@/components/RegimeParamsInline';
import Footer from '@/components/Footer';

const STATUT_SLUG_TO_ID: Record<string, string> = {
  'portage': 'Portage',
  'micro': 'Micro',
  'eurl-ir': 'EURL IR',
  'eurl-is': 'EURL IS',
  'sasu': 'SASU',
};

const VALID_SLUGS = Object.keys(STATUT_SLUG_TO_ID);

export default function SimulateurStatutPage() {
  const params = useParams();
  const router = useRouter();
  const ctx = useSimulationContext();
  const slug = (params?.statut as string)?.toLowerCase() ?? '';
  const statutId = STATUT_SLUG_TO_ID[slug];
  const [activeRegime, setActiveRegimeState] = useState(statutId ?? 'Portage');

  useEffect(() => {
    if (statutId) setActiveRegimeState(statutId);
  }, [statutId]);

  // Rediriger si slug invalide
  useEffect(() => {
    if (params?.statut && !VALID_SLUGS.includes(slug)) {
      router.replace('/simulateur/sasu');
    }
  }, [params?.statut, slug, router]);

  const setActiveRegime = (id: string) => {
    const newSlug = Object.entries(STATUT_SLUG_TO_ID).find(([, v]) => v === id)?.[0];
    if (newSlug) router.push(`/simulateur/${newSlug}`);
  };

  if (!statutId && params?.statut) return null; // en attendant la redirection

  const sim = ctx.sim ?? ctx;
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startHold = (fn: () => void) => {
    fn();
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    if (holdDelayRef.current) clearTimeout(holdDelayRef.current);
    holdDelayRef.current = setTimeout(() => { holdTimerRef.current = setInterval(fn, 120); }, 300);
  };
  const stopHold = () => {
    if (holdDelayRef.current) clearTimeout(holdDelayRef.current);
    holdDelayRef.current = null;
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    holdTimerRef.current = null;
  };

  return (
    <>
      <div className="page-blob-1" aria-hidden />
      <div className="page-blob-2" aria-hidden />
      <div className="bg-page-grid" aria-hidden />

      <main className="relative z-10 min-h-screen">
        <div className="top-accent-bar" aria-hidden />

        <section className="section-projection-hero w-full pt-6 pb-4 md:pt-8 md:pb-6">
          <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            <div className="shrink-0">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Projection sur 5 ans — {statutId}
              </h1>
              <p className="text-[10px] text-indigo-200 font-bold mt-0.5">
                ACRE an 1{ctx.state?.acreEnabled ? ' ✅' : ' ✗'} · CFE dès an 2
              </p>
            </div>
            <div className="flex-1 flex justify-center items-end">
              <div className="flex flex-wrap items-center justify-center gap-4 text-white">
                <div className="flex items-center gap-1.5">
                  <label className="text-[10px] font-bold text-white/90 uppercase">TJM</label>
                  <input
                    type="number"
                    value={sim.state.tjm ?? ''}
                    onChange={(e) => sim.setters.setTjm(Math.max(0, Number(e.target.value) || 0))}
                    onFocus={(e) => e.target.select()}
                    className="tjm-days-input w-16 py-1 px-2 text-xs font-bold rounded-lg bg-white/10 border border-white/20 text-white"
                  />
                  <div className="flex flex-col gap-0.5">
                    <button type="button" className="w-5 h-3 rounded bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white hover:bg-white/20" onMouseDown={() => startHold(() => sim.setters.setTjm((p: number) => (p || 0) + 1))} onMouseUp={stopHold} onMouseLeave={stopHold} aria-label="+TJM">▲</button>
                    <button type="button" className="w-5 h-3 rounded bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white hover:bg-white/20" onMouseDown={() => startHold(() => sim.setters.setTjm((p: number) => Math.max(0, (p || 0) - 1)))} onMouseUp={stopHold} onMouseLeave={stopHold} aria-label="-TJM">▼</button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <label className="text-[10px] font-bold text-white/90 uppercase">Jours</label>
                  <input
                    type="number"
                    value={sim.state.days ?? ''}
                    onChange={(e) => sim.setters.setDays(Math.max(0, Number(e.target.value) || 0))}
                    onFocus={(e) => e.target.select()}
                    className="tjm-days-input w-16 py-1 px-2 text-xs font-bold rounded-lg bg-white/10 border border-white/20 text-white"
                  />
                  <div className="flex flex-col gap-0.5">
                    <button type="button" className="w-5 h-3 rounded bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white hover:bg-white/20" onMouseDown={() => startHold(() => sim.setters.setDays((p: number) => (p || 0) + 1))} onMouseUp={stopHold} onMouseLeave={stopHold} aria-label="+Jours">▲</button>
                    <button type="button" className="w-5 h-3 rounded bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white hover:bg-white/20" onMouseDown={() => startHold(() => sim.setters.setDays((p: number) => Math.max(0, (p || 0) - 1)))} onMouseUp={stopHold} onMouseLeave={stopHold} aria-label="-Jours">▼</button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <label className="text-[10px] font-bold text-white/90 uppercase">Croissance</label>
                  <span className="text-[10px] font-bold text-white/90 w-5">{sim.state.growthRate}%</span>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={1}
                    value={sim.state.growthRate}
                    onChange={(e) => sim.setters.setGrowthRate(Number(e.target.value))}
                    className="w-20 accent-indigo-400 h-1.5"
                    aria-label="Croissance CA par an"
                  />
                </div>
              </div>
            </div>
            <div className="shrink-0 flex justify-center sm:justify-end">
              <RegimeParamsInline sim={sim} regimeId={statutId} align="left" variant="dark" />
            </div>
          </div>
        </section>

        <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 pb-8">
          <ProjectionSection
            sim={ctx}
            activeRegime={activeRegime}
            setActiveRegime={setActiveRegime}
            singleRegime
          />
        </div>

        <Footer />
      </main>
    </>
  );
}
