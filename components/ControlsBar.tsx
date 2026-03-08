'use client';
import React from 'react';
import Link from 'next/link';
import { Calculator, TrendingUp, Percent, Settings } from 'lucide-react';
import NumberInput from './NumberInput';
import { fmtEur } from '@/lib/utils';
import type { SimulationState, SimulationSetters } from '@/context/SimulationContext';

export interface ControlsBarProps {
  sim: { state: SimulationState; setters: SimulationSetters };
  ca: number;
  showGrowth?: boolean;
  pageSlug?: string;
}

export default function ControlsBar({ sim, ca, showGrowth = false, pageSlug }: ControlsBarProps) {
  return (
    <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-850 border-b border-slate-200/80 dark:border-slate-700/50 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3">
          {/* Inputs TJM, Jours et Croissance optionnelle */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                <Calculator size={14} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">TJM</span>
                <NumberInput
                  value={sim.state.tjm ?? 0}
                  onChange={(v) => sim.setters.setTjm(v)}
                  onIncrement={() => sim.setters.setTjm((p: number) => (p || 0) + 10)}
                  onDecrement={() => sim.setters.setTjm((p: number) => Math.max(0, (p || 0) - 10))}
                  suffix="€"
                  label="TJM"
                  inputClassName="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white w-16"
                />
              </div>
            </div>

            <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <TrendingUp size={14} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jours</span>
                <NumberInput
                  value={sim.state.days ?? 0}
                  onChange={(v) => sim.setters.setDays(v)}
                  onIncrement={() => sim.setters.setDays((p: number) => Math.min(365, (p || 0) + 5))}
                  onDecrement={() => sim.setters.setDays((p: number) => Math.max(0, (p || 0) - 5))}
                  suffix="j"
                  label="Jours"
                  inputClassName="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white w-16"
                />
              </div>
            </div>

            {showGrowth && (
              <>
                <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-700" />
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <Percent size={14} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Croissance</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="range"
                        min={0}
                        max={50}
                        step={1}
                        value={sim.state.growthRate ?? 2}
                        onChange={(e) => sim.setters.setGrowthRate(Number(e.target.value))}
                        className="w-16 h-2 rounded-full accent-indigo-600 dark:accent-indigo-400 bg-slate-200 dark:bg-slate-700"
                        aria-label="Croissance CA par an"
                      />
                      <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums w-6">
                        {sim.state.growthRate ?? 2}%
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* CA calculé + lien paramètres */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">CA annuel</span>
              <span className="text-lg md:text-xl font-black text-slate-900 dark:text-white tabular-nums">
                {fmtEur(ca)}
              </span>
            </div>

            <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-700" />

            <Link
              href={pageSlug ? `/reglages?from=${pageSlug}` : '/reglages'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-xs font-semibold transition-all shrink-0"
            >
              <Settings size={14} />
              <span className="hidden sm:inline">Paramètres</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
