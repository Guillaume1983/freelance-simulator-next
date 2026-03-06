'use client';

import { useRef } from 'react';
import { useSimulationContext } from '@/context/SimulationContext';
import ComparisonTable from '@/components/ComparisonTable';
import Footer from '@/components/Footer';

export default function ComparateurPage() {
  const sim = useSimulationContext();

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

        <section
          id="parametres"
          className="section-projection-hero w-full pt-6 pb-4 md:pt-8 md:pb-6"
          aria-label="Comparatif des statuts freelance"
        >
          <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            <div className="flex-1 min-w-0 flex flex-col items-start justify-end">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Comparatif des statuts
              </h1>
              <p className="text-[10px] text-indigo-200 font-bold mt-0.5">
                Ajustez TJM et jours — le tableau se met à jour en temps réel
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
                    onFocus={(e) => (e.target as HTMLInputElement).select()}
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
                    onFocus={(e) => (e.target as HTMLInputElement).select()}
                    className="tjm-days-input w-16 py-1 px-2 text-xs font-bold rounded-lg bg-white/10 border border-white/20 text-white"
                  />
                  <div className="flex flex-col gap-0.5">
                    <button type="button" className="w-5 h-3 rounded bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white hover:bg-white/20" onMouseDown={() => startHold(() => sim.setters.setDays((p: number) => (p || 0) + 1))} onMouseUp={stopHold} onMouseLeave={stopHold} aria-label="+Jours">▲</button>
                    <button type="button" className="w-5 h-3 rounded bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white hover:bg-white/20" onMouseDown={() => startHold(() => sim.setters.setDays((p: number) => Math.max(0, (p || 0) - 1)))} onMouseUp={stopHold} onMouseLeave={stopHold} aria-label="-Jours">▼</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0 hidden sm:block" aria-hidden />
          </div>
        </section>

        <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 pb-8">
          <ComparisonTable sim={sim} />
        </div>

        <Footer />
      </main>
    </>
  );
}
