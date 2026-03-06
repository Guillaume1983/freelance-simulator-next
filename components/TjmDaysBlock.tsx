'use client';

import { useRef } from 'react';
import { Zap, CheckCircle2 } from 'lucide-react';

export default function TjmDaysBlock({ sim }: { sim: any }) {
  const fmt = (v: number) => Math.round((v || 0)).toLocaleString() + ' €';

  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startHold = (fn: () => void) => {
    fn();
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdDelayRef.current) {
      clearTimeout(holdDelayRef.current);
    }
    holdDelayRef.current = setTimeout(() => {
      holdTimerRef.current = setInterval(fn, 120);
    }, 300);
  };

  const stopHold = () => {
    if (holdDelayRef.current) {
      clearTimeout(holdDelayRef.current);
      holdDelayRef.current = null;
    }
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const ca = Math.round((sim.state.tjm || 0) * (sim.state.days || 0));

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 mb-4 mt-2 md:mt-6">
      {/* Carte Activité (style capture) : en-tête + TJM × jours = CA, puis deux champs avec coche */}
      <div className="card-pro rounded-2xl border border-indigo-300/60 dark:border-indigo-500/70 bg-white/10 dark:bg-slate-900/60 text-white px-4 md:px-6 py-4 md:py-5 shadow-xl">
        {/* En-tête : icône + ACTIVITÉ + formule + montant */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/10 rounded-xl text-indigo-200 shrink-0">
              <Zap size={20} className="md:w-5 md:h-5" />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.18em] text-white/90">Activité</h3>
              <p className="text-[10px] md:text-xs text-white/70 font-medium mt-1">TJM × jours travaillés = chiffre d&apos;affaires annuel</p>
            </div>
          </div>
          <p className="text-lg md:text-xl font-black text-white shrink-0">{fmt(ca)}</p>
        </div>

        {/* Champs TJM et Jours côte à côte (checkmark + label + unité + input + steppers) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl px-3 py-2.5 bg-white/10 dark:bg-slate-900/60 border border-white/15 flex items-center justify-between gap-2 text-white">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-800 uppercase tracking-tight text-white/90">TJM</span>
                <span className="text-[9px] text-white/65">€ / jour</span>
              </div>
            </div>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="number"
                value={sim.state.tjm ?? ''}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  sim.setters.setTjm(Number.isNaN(v) ? 0 : Math.max(0, v));
                }}
                onFocus={(e) => e.target.select()}
                className="tjm-days-input w-20 md:w-24 pr-5 py-1.5 text-[10px] font-bold text-right rounded-lg bg-white/5 border border-white/20"
                placeholder="0"
              />
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white hover:bg-white/20"
                  onMouseDown={() => startHold(() => sim.setters.setTjm((prev: number) => (prev || 0) + 1))}
                  onMouseUp={stopHold}
                  onMouseLeave={stopHold}
                  onTouchStart={() => startHold(() => sim.setters.setTjm((prev: number) => (prev || 0) + 1))}
                  onTouchEnd={stopHold}
                  onTouchCancel={stopHold}
                  aria-label="Augmenter le TJM"
                >▲</button>
                <button
                  type="button"
                  className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white hover:bg-white/20"
                  onMouseDown={() => startHold(() => sim.setters.setTjm((prev: number) => Math.max(0, (prev || 0) - 1)))}
                  onMouseUp={stopHold}
                  onMouseLeave={stopHold}
                  onTouchStart={() => startHold(() => sim.setters.setTjm((prev: number) => Math.max(0, (prev || 0) - 1)))}
                  onTouchEnd={stopHold}
                  onTouchCancel={stopHold}
                  aria-label="Diminuer le TJM"
                >▼</button>
              </div>
            </div>
          </div>
          <div className="rounded-2xl px-3 py-2.5 bg-white/10 dark:bg-slate-900/60 border border-white/15 flex items-center justify-between gap-2 text-white">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-800 uppercase tracking-tight text-white/90">Jours</span>
                <span className="text-[9px] text-white/65">travail / an</span>
              </div>
            </div>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="number"
                value={sim.state.days ?? ''}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  sim.setters.setDays(Number.isNaN(v) ? 0 : Math.max(0, v));
                }}
                onFocus={(e) => e.target.select()}
                className="tjm-days-input w-20 md:w-24 pr-5 py-1.5 text-[10px] font-bold text-right rounded-lg bg-white/5 border border-white/20"
                placeholder="0"
              />
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white hover:bg-white/20"
                  onMouseDown={() => startHold(() => sim.setters.setDays((prev: number) => (prev || 0) + 1))}
                  onMouseUp={stopHold}
                  onMouseLeave={stopHold}
                  onTouchStart={() => startHold(() => sim.setters.setDays((prev: number) => (prev || 0) + 1))}
                  onTouchEnd={stopHold}
                  onTouchCancel={stopHold}
                  aria-label="Augmenter les jours"
                >▲</button>
                <button
                  type="button"
                  className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white hover:bg-white/20"
                  onMouseDown={() => startHold(() => sim.setters.setDays((prev: number) => Math.max(0, (prev || 0) - 1)))}
                  onMouseUp={stopHold}
                  onMouseLeave={stopHold}
                  onTouchStart={() => startHold(() => sim.setters.setDays((prev: number) => Math.max(0, (prev || 0) - 1)))}
                  onTouchEnd={stopHold}
                  onTouchCancel={stopHold}
                  aria-label="Diminuer les jours"
                >▼</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
