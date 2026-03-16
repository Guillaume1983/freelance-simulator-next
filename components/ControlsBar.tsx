'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Percent, X, SlidersHorizontal } from 'lucide-react';
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
  const [showModal, setShowModal] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (showModal) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [showModal]);

  // Fermer sur clic sur le backdrop
  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      setShowModal(false);
    }
  };

  const modalTitle =
    activeRegimeId
      ? `Paramétrage — ${activeRegimeId}`
      : 'Paramétrage par statut';

  return (
    <>
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

            {/* CA calculé + bouton paramétrage */}
            <div className="flex items-center gap-3 md:gap-4">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors min-h-[36px]"
                aria-label="Ouvrir le paramétrage par statut"
              >
                <SlidersHorizontal size={13} />
                <span className="hidden sm:inline">Paramétrage</span>
              </button>

              <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-700" />

              <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">CA annuel</span>
                <span className="text-lg md:text-xl font-black text-slate-900 dark:text-white tabular-nums">
                  {fmtEur(ca)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal native */}
      <dialog
        ref={dialogRef}
        onClick={handleDialogClick}
        onClose={() => setShowModal(false)}
        className="m-auto w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm open:flex open:flex-col"
        aria-labelledby="modal-params-title"
        aria-modal="true"
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center">
              <SlidersHorizontal size={15} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2
              id="modal-params-title"
              className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide"
            >
              {modalTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Contenu */}
        <div className="px-6 py-5 overflow-y-auto max-h-[70vh]">
          {/* Comparateur : une carte par statut */}
          {pageSlug === 'comparateur' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sim.resultats?.map((r: any) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-4 flex flex-col gap-2"
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    {r.id}
                  </div>
                  <RegimeParamsInline sim={sim} regimeId={r.id} align="left" variant="light" />
                </div>
              ))}
            </div>
          )}

          {/* Simulateur : paramétrage statut + croissance par année */}
          {pageSlug && pageSlug.startsWith('simulateur/') && activeRegimeId && (
            <div className="flex flex-col gap-4">
              {/* Paramétrage statut */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-4 flex flex-col gap-2">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-1">
                  Paramétrage — {activeRegimeId}
                </div>
                {activeRegimeId !== 'EURL IR' ? (
                  <RegimeParamsInline sim={sim} regimeId={activeRegimeId} align="left" variant="light" />
                ) : (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                    Aucun paramètre spécifique pour ce statut.
                  </p>
                )}
              </div>

              {/* Croissance par année */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-4 flex flex-col gap-3">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Croissance CA par année
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((yearOffset) => {
                    const index = yearOffset; // Années 2–5 (index 1–4)
                    const value = growthByYear?.[index] ?? 0;
                    return (
                      <div key={index} className="flex flex-col gap-1.5">
                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Année {index + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={0}
                            max={50}
                            step={1}
                            value={value}
                            onChange={(e) => onChangeGrowthYear?.(index, Number(e.target.value))}
                            className="flex-1 h-2 rounded-full cursor-pointer accent-emerald-600 dark:accent-emerald-400"
                          />
                          <span className="w-8 text-right text-[10px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                            {value}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pied */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wide transition-colors min-h-[40px]"
          >
            Fermer
          </button>
        </div>
      </dialog>
    </>
  );
}
