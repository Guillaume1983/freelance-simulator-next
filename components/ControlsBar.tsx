'use client';
import React from 'react';
import NumberInput from './NumberInput';
import { fmtEur } from '@/lib/utils';
import type { SimulationState, SimulationSetters } from '@/context/SimulationContext';

export interface ControlsBarProps {
  sim: { state: SimulationState; setters: SimulationSetters; resultats?: any[] };
  ca: number;
  pageSlug?: string;
  activeRegimeId?: string;
  growthByYear?: number[];
  onChangeGrowthYear?: (index: number, value: number) => void;
  /** Quand true, pas de fond propre (bandeau coloré en fond) */
  transparentBg?: boolean;
  /** Quand true, labels et CA en blanc (sur bandeau coloré) */
  lightText?: boolean;
}

export default function ControlsBar({
  sim,
  ca,
  pageSlug,
  activeRegimeId,
  transparentBg = false,
  lightText = false,
}: ControlsBarProps) {
  const labelClass = lightText
    ? 'text-[9px] font-bold text-white uppercase tracking-wider whitespace-nowrap'
    : 'text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap';

  // Le paramètre statut n'est visible QUE sur les pages simulateur/
  const isSimulateur = Boolean(pageSlug?.startsWith('simulateur/'));

  const statutLabel = isSimulateur
    ? activeRegimeId === 'Portage'
      ? 'Frais de gestion'
      : activeRegimeId === 'Micro'
        ? 'Micro'
        : activeRegimeId === 'EURL IS'
          ? 'Part en salaire'
          : activeRegimeId === 'SASU'
            ? 'Dividendes'
            : null
    : null;

  const showStatut = Boolean(statutLabel);
  const showPrelevLiberatoire = showStatut && activeRegimeId === 'Micro';

  // Nombre exact de colonnes (croissance = au niveau du tableau, pas dans le bandeau)
  const cols = 2 + (showStatut ? 1 : 0) + (showPrelevLiberatoire ? 1 : 0);

  const s = sim.state;

  const statutControl = showStatut ? (() => {
    if (activeRegimeId === 'Portage') {
      const v = Math.max(0, Math.min(20, s.portageComm ?? 0));
      return (
        <div className="flex items-center gap-1.5">
          <input type="range" min={0} max={20} step={1} value={v}
            onChange={e => sim.setters.setPortageComm(Number(e.target.value))}
            className="w-20 h-2 rounded-full accent-violet-500 dark:accent-violet-300 bg-slate-200 dark:bg-slate-700"
          />
          <span className={`w-8 text-right text-[10px] font-bold tabular-nums ${lightText ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>{Math.round(v)}%</span>
        </div>
      );
    }
    if (activeRegimeId === 'Micro') {
      return null; // Micro : select et toggle rendus séparément dans la grille (2 colonnes)
    }
    if (activeRegimeId === 'EURL IS') {
      const v = Math.round((s.remunerationDirigeantMensuelle ?? 1) * 100);
      return (
        <div className="flex items-center gap-1.5">
          <input type="range" min={0} max={100} step={5} value={v}
            onChange={e => sim.setters.setRemunerationDirigeantMensuelle(Number(e.target.value) / 100)}
            className="w-20 h-2 rounded-full accent-blue-500 dark:accent-blue-400 bg-slate-200 dark:bg-slate-700"
          />
          <span className={`w-8 text-right text-[10px] font-bold tabular-nums ${lightText ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>{v}%</span>
        </div>
      );
    }
    if (activeRegimeId === 'SASU') {
      const v = s.repartitionRemuneration ?? 100;
      return (
        <div className="flex items-center gap-1.5">
          <input type="range" min={0} max={100} step={5} value={v}
            onChange={e => sim.setters.setRepartitionRemuneration(Number(e.target.value))}
            className="w-20 h-2 rounded-full accent-violet-500 dark:accent-violet-400 bg-slate-200 dark:bg-slate-700"
          />
          <span className={`w-8 text-right text-[10px] font-bold tabular-nums ${lightText ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>{v}%</span>
        </div>
      );
    }
    return null;
  })() : null;

  return (
    <div className={transparentBg ? 'bg-transparent' : 'bg-linear-to-r from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-850 border-b border-slate-200/80 dark:border-slate-700/50 shadow-sm'}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3">

          {/*
            Grille stricte : exactement `cols` colonnes, 2 lignes.
            Ligne 1 = labels, ligne 2 = contrôles.
            Chaque label est dans la même colonne que son contrôle.
            Le nombre de labels == le nombre de contrôles == cols, toujours.
          */}
          <div
            className="grid gap-y-1.5 gap-x-5"
            style={{ gridTemplateColumns: `repeat(${cols}, auto)` }}
          >
            {/* ── Ligne 1 : labels ── */}
            <span className={labelClass}>TJM</span>
            <span className={labelClass}>Jours</span>
            {showStatut && <span className={labelClass}>{statutLabel}</span>}
            {showPrelevLiberatoire && <span className={labelClass}>Prélèvement libératoire</span>}

            {/* ── Ligne 2 : contrôles (même ordre, même nombre) ── */}
            <NumberInput
              value={s.tjm ?? 0}
              onChange={(v) => sim.setters.setTjm(v)}
              onIncrement={() => sim.setters.setTjm((p: number) => (p || 0) + 10)}
              onDecrement={() => sim.setters.setTjm((p: number) => Math.max(0, (p || 0) - 10))}
              suffix="€"
              label="TJM"
              inputClassName="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white w-16"
            />
            <NumberInput
              value={s.days ?? 0}
              onChange={(v) => sim.setters.setDays(v)}
              onIncrement={() => sim.setters.setDays((p: number) => Math.min(365, (p || 0) + 5))}
              onDecrement={() => sim.setters.setDays((p: number) => Math.max(0, (p || 0) - 5))}
              suffix="j"
              label="Jours"
              inputClassName="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white w-16"
            />
            {showStatut && activeRegimeId === 'Micro' && (
              <select
                value={s.typeActiviteMicro}
                onChange={e => sim.setters.setTypeActiviteMicro(e.target.value as 'BNC' | 'BIC_SERVICE' | 'BIC_COMMERCE')}
                className="text-[9px] py-1 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 cursor-pointer"
              >
                <option value="BNC">BNC</option>
                <option value="BIC_SERVICE">BIC Service</option>
                <option value="BIC_COMMERCE">BIC Commerce</option>
              </select>
            )}
            {showPrelevLiberatoire && (
              <button
                type="button"
                onClick={() => sim.setters.setPrelevementLiberatoire(!s.prelevementLiberatoire)}
                className="flex items-center justify-center cursor-pointer select-none"
                aria-label="Prélèvement libératoire"
              >
                <span
                  className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                    s.prelevementLiberatoire ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 rounded-full bg-white shadow-sm transform transition-transform ${
                      s.prelevementLiberatoire ? 'translate-x-3' : 'translate-x-1'
                    }`}
                  />
                </span>
              </button>
            )}
            {showStatut && activeRegimeId !== 'Micro' && statutControl}
          </div>

          {/* CA calculé */}
          <div className="flex flex-col items-start md:items-end">
            <span className={labelClass}>CA annuel</span>
            <span className={`text-lg md:text-xl font-black tabular-nums ${lightText ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              {fmtEur(ca)}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
