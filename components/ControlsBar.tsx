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

  // Style historique (inputs opaques, cohérents avec TJM/Jours)
  const inputOpaqueClass =
    'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white w-16';
  const microSelectOpaqueClass =
    'text-[9px] py-1 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 cursor-pointer w-[120px]';

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
        <NumberInput
          value={v}
          onChange={(next) => sim.setters.setPortageComm(Math.max(0, Math.min(20, next)))}
          onIncrement={() => sim.setters.setPortageComm((p: number) => Math.min(20, (p ?? 0) + 1))}
          onDecrement={() => sim.setters.setPortageComm((p: number) => Math.max(0, (p ?? 0) - 1))}
          suffix="%"
          label="Frais de gestion"
          inputClassName={inputOpaqueClass}
        />
      );
    }
    if (activeRegimeId === 'Micro') {
      return null; // Micro : select et toggle rendus séparément dans la grille (2 colonnes)
    }
    if (activeRegimeId === 'EURL IS') {
      const v = Math.max(0, Math.min(100, Math.round((s.remunerationDirigeantMensuelle ?? 0) * 100)));
      return (
        <NumberInput
          value={v}
          onChange={(next) =>
            sim.setters.setRemunerationDirigeantMensuelle(Math.max(0, Math.min(100, next)) / 100)
          }
          onIncrement={() =>
            sim.setters.setRemunerationDirigeantMensuelle((p: number) => {
              const percent = Math.round((p ?? 0) * 100);
              return Math.min(100, percent + 5) / 100;
            })
          }
          onDecrement={() =>
            sim.setters.setRemunerationDirigeantMensuelle((p: number) => {
              const percent = Math.round((p ?? 0) * 100);
              return Math.max(0, percent - 5) / 100;
            })
          }
          suffix="%"
          label="Part en salaire"
          inputClassName={inputOpaqueClass}
        />
      );
    }
    if (activeRegimeId === 'SASU') {
      const v = Math.max(0, Math.min(100, s.repartitionRemuneration ?? 100));
      return (
        <NumberInput
          value={v}
          onChange={(next) => sim.setters.setRepartitionRemuneration(Math.max(0, Math.min(100, next)))}
          onIncrement={() => sim.setters.setRepartitionRemuneration((p: number) => Math.min(100, (p ?? 0) + 5))}
          onDecrement={() => sim.setters.setRepartitionRemuneration((p: number) => Math.max(0, (p ?? 0) - 5))}
          suffix="%"
          label="Dividendes"
          inputClassName={inputOpaqueClass}
        />
      );
    }
    return null;
  })() : null;

  return (
    <div className={transparentBg ? 'bg-transparent' : 'bg-linear-to-r from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-850 border-b border-slate-200/80 dark:border-slate-700/50 shadow-sm'}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3">

          {/* Mobile : wrap pour éviter chevauchements */}
          <div className="md:hidden flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-0.5 min-w-[150px]">
              <span className={labelClass}>TJM</span>
              <NumberInput
                value={s.tjm ?? 0}
                onChange={(v) => sim.setters.setTjm(v)}
                onIncrement={() => sim.setters.setTjm((p: number) => (p || 0) + 10)}
                onDecrement={() => sim.setters.setTjm((p: number) => Math.max(0, (p || 0) - 10))}
                suffix="€"
                label="TJM"
                inputClassName={inputOpaqueClass}
              />
            </div>

            <div className="flex flex-col gap-0.5 min-w-[150px]">
              <span className={labelClass}>Jours</span>
              <NumberInput
                value={s.days ?? 0}
                onChange={(v) => sim.setters.setDays(v)}
                onIncrement={() => sim.setters.setDays((p: number) => Math.min(365, (p || 0) + 5))}
                onDecrement={() => sim.setters.setDays((p: number) => Math.max(0, (p || 0) - 5))}
                suffix="j"
                label="Jours"
                inputClassName={inputOpaqueClass}
              />
            </div>

            {showStatut && activeRegimeId === 'Micro' && (
              <div className="flex flex-col gap-0.5 min-w-[140px]">
                <span className={labelClass}>{statutLabel}</span>
                <select
                  value={s.typeActiviteMicro}
                  onChange={e =>
                    sim.setters.setTypeActiviteMicro(e.target.value as 'BNC' | 'BIC_SERVICE' | 'BIC_COMMERCE')
                  }
                  className={microSelectOpaqueClass}
                >
                  <option value="BNC">BNC</option>
                  <option value="BIC_SERVICE">BIC Service</option>
                  <option value="BIC_COMMERCE">BIC Commerce</option>
                </select>
              </div>
            )}

            {showPrelevLiberatoire && (
              <div className="flex flex-col gap-0.5 min-w-[190px]">
                <span className={labelClass}>Prélèvement libératoire</span>
                <button
                  type="button"
                  onClick={() => sim.setters.setPrelevementLiberatoire(!s.prelevementLiberatoire)}
                  className="flex items-center justify-center cursor-pointer select-none min-h-[44px]"
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
              </div>
            )}

            {showStatut && activeRegimeId !== 'Micro' && (
              <div className="flex flex-col gap-0.5 min-w-[150px]">
                <span className={labelClass}>{statutLabel}</span>
                {statutControl}
              </div>
            )}

            {/* Mobile : CA sur la dernière ligne, à droite */}
            <div className="w-full flex flex-col items-end">
              <span className={labelClass}>CA annuel</span>
              <span
                className={`text-lg md:text-xl font-black tabular-nums ${
                  lightText ? 'text-white' : 'text-slate-900 dark:text-white'
                }`}
              >
                {fmtEur(ca)}
              </span>
            </div>
          </div>

          {/* Desktop : alignement strict label/control */}
          <div className="hidden md:block">
            <div
              className="grid gap-y-1.5 gap-x-5"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}
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
                inputClassName={inputOpaqueClass}
              />
              <NumberInput
                value={s.days ?? 0}
                onChange={(v) => sim.setters.setDays(v)}
                onIncrement={() => sim.setters.setDays((p: number) => Math.min(365, (p || 0) + 5))}
                onDecrement={() => sim.setters.setDays((p: number) => Math.max(0, (p || 0) - 5))}
                suffix="j"
                label="Jours"
                inputClassName={inputOpaqueClass}
              />
              {showStatut && activeRegimeId === 'Micro' && (
                <select
                  value={s.typeActiviteMicro}
                  onChange={e =>
                    sim.setters.setTypeActiviteMicro(
                      e.target.value as 'BNC' | 'BIC_SERVICE' | 'BIC_COMMERCE'
                    )
                  }
                  className={microSelectOpaqueClass}
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
                  className="flex items-center justify-center cursor-pointer select-none min-h-[44px]"
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
          </div>

          {/* CA calculé (desktop uniquement) */}
          <div className="hidden md:flex flex-col items-end w-full md:w-auto">
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
