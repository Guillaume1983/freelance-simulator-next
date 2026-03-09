'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Percent, Settings } from 'lucide-react';
import NumberInput from './NumberInput';
import { fmtEur } from '@/lib/utils';
import type { SimulationState, SimulationSetters } from '@/context/SimulationContext';
import RegimeParamsInline from '@/components/RegimeParamsInline';

export interface ControlsBarProps {
  sim: { state: SimulationState; setters: SimulationSetters; resultats?: any[] };
  ca: number;
  showGrowth?: boolean;
  pageSlug?: string;
  /** Optionnel — utilisé sur les pages simulateur pour ne montrer que le statut actif dans le panneau */
  activeRegimeId?: string;
  /** Optionnel — série 5 ans de croissance, utilisée dans le panneau des simulateurs */
  growthByYear?: number[];
  onChangeGrowthYear?: (index: number, value: number) => void;
}

export default function ControlsBar({
  sim,
  ca,
  showGrowth = false,
  pageSlug,
  activeRegimeId,
  growthByYear,
  onChangeGrowthYear,
}: ControlsBarProps) {
  const [showStatusPanel, setShowStatusPanel] = useState(false);
  return (
    <div className="bg-linear-to-r from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-850 border-b border-slate-200/80 dark:border-slate-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3">
          {/* Inputs TJM, Jours et Croissance optionnelle */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2.5">
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

      {/* Bandeau bas avec bouton centré sur la bordure + panneau éventuel */}
      <div className="border-t border-slate-200/80 dark:border-slate-700/50 bg-white/70 dark:bg-slate-950/80 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <button
            type="button"
            onClick={() => setShowStatusPanel(v => !v)}
            className="absolute left-1/2 -translate-x-1/2 -top-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-slate-300 dark:border-slate-600 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <span>{showStatusPanel ? 'Masquer paramétrage statuts' : 'Paramétrage par statut'}</span>
          </button>

          {showStatusPanel && (
            <div className="pt-6 pb-4">
              {/* Desktop : aligner visuellement les cartes sur les colonnes de statut */}
              {pageSlug === 'comparateur' && (
                <div
                  className="hidden md:grid gap-3"
                  style={{
                    gridTemplateColumns: `200px repeat(${sim.resultats?.length ?? 0}, minmax(0, 1fr))`,
                  }}
                >
                  {/* Colonne métriques (vide, pour l'alignement) */}
                  <div />
                  {sim.resultats?.map((r: any) => (
                    <div
                      key={r.id}
                      className="rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-900/60 px-3 py-3 flex flex-col gap-1.5"
                    >
                      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 text-center">
                        {r.id}
                      </div>
                      <RegimeParamsInline sim={sim} regimeId={r.id} align="center" variant="light" />
                    </div>
                  ))}
                </div>
              )}

              {/* Vue simulateur : grille Année 1–5 avec paramétrage et croissance alignés sur les colonnes */}
              {pageSlug && pageSlug.startsWith('simulateur/') && activeRegimeId && (
                <div
                  className="hidden md:grid gap-3"
                  style={{ gridTemplateColumns: '200px repeat(5, minmax(0, 1fr))' }}
                >
                  {/* Colonne Métriques (vide, pour aligner avec la première colonne du tableau) */}
                  <div />
                  {[0, 1, 2, 3, 4].map((index) => {
                    const value = growthByYear?.[index] ?? 0;
                    const isYearOne = index === 0;
                    return (
                      <div
                        key={index}
                        className="rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-900/60 px-3 py-3 flex flex-col gap-1.5"
                      >
                        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 text-center mb-1">
                          {isYearOne ? 'Paramétrage statut' : `Année ${index + 1}`}
                        </div>

                        {isYearOne ? (
                          activeRegimeId !== 'EURL IR' ? (
                            <RegimeParamsInline sim={sim} regimeId={activeRegimeId} align="center" variant="light" />
                          ) : (
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center italic">
                              Aucun paramètre spécifique pour ce statut.
                            </p>
                          )
                        ) : (
                          <div className="flex flex-col items-stretch gap-1.5">
                            <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 text-center">
                              Croissance CA
                            </span>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={0}
                                max={50}
                                step={1}
                                value={value}
                                onChange={(e) => onChangeGrowthYear?.(index, Number(e.target.value))}
                                className="h-2 rounded-full cursor-pointer accent-emerald-600 dark:accent-emerald-400 bg-slate-200 dark:bg-slate-700 flex-1"
                              />
                              <span className="w-10 text-right text-[10px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                                {value}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Vue mobile : pile de cartes (comparateur uniquement) */}
              {pageSlug === 'comparateur' && (
                <div className="grid md:hidden gap-3">
                  {sim.resultats?.map((r: any) => (
                    <div
                      key={r.id}
                      className="rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-900/60 px-3 py-3 flex flex-col gap-1.5"
                    >
                      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                        {r.id}
                      </div>
                      <RegimeParamsInline sim={sim} regimeId={r.id} align="left" variant="light" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
