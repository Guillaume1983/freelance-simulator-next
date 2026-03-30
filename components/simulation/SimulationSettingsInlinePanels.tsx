'use client';

import { useMemo } from 'react';
import ExpandPanels from '@/components/ExpandPanels';
import RegimeParamsInline from '@/components/RegimeParamsInline';
import { SIDEBAR_SECTIONS, type SidebarPanelId } from '@/components/simulation/SimulationSettingsSidebar';
import { cn } from '@/lib/utils';
import { useSimulationContext } from '@/context/SimulationContext';

const REGIMES_WITH_OPTIONS = ['Portage', 'Micro', 'EURL IS', 'SASU'];

const REGIME_VISIBLE_SECTIONS: Partial<Record<string, SidebarPanelId[]>> = {
  // Micro : calcul simplifié (pas de charges réelles, pas d’amortissement, pas d’IK/optimisations)
  Micro: ['activite', 'cotisations', 'foyer'],
  // Portage : charges déductibles, IK et avantages (pas de CFE/ACRE dans le modèle actuel)
  Portage: ['activite', 'charges', 'vehicule', 'opti', 'foyer'],
  // EURL : charges, IK, optimisations, amortissement + cotisations
  'EURL IR': ['activite', 'charges', 'amortissement', 'vehicule', 'opti', 'cotisations', 'foyer'],
  'EURL IS': ['activite', 'charges', 'amortissement', 'vehicule', 'opti', 'cotisations', 'foyer'],
  // SASU : charges, IK, optimisations, amortissement + CFE (pas de foyer IR dans le modèle)
  SASU: ['activite', 'charges', 'amortissement', 'vehicule', 'opti', 'cotisations'],
};

type SimCtx = ReturnType<typeof useSimulationContext>;

export default function SimulationSettingsInlinePanels({
  sim,
  activeRegimeId,
  filterByRegime = false,
}: {
  sim: SimCtx;
  activeRegimeId: string | undefined;
  /** Filtre les panels pour ne garder que ceux pertinents au statut (simulateur). */
  filterByRegime?: boolean;
}) {
  const hasRegimeOptions = Boolean(activeRegimeId && REGIMES_WITH_OPTIONS.includes(activeRegimeId));

  const visibleSections = useMemo(() => {
    if (!filterByRegime || !activeRegimeId) return SIDEBAR_SECTIONS;
    const allowed = REGIME_VISIBLE_SECTIONS[activeRegimeId];
    if (!allowed) return SIDEBAR_SECTIONS;
    return SIDEBAR_SECTIONS.filter((s) => allowed.includes(s.id));
  }, [filterByRegime, activeRegimeId]);

  return (
    <div className="space-y-4">
      {visibleSections.map((section) => (
        <div
          key={section.id}
          className={cn(
            'rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 overflow-hidden',
          )}
        >
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{section.label}</p>
            <p className="text-[12px] text-slate-500 dark:text-slate-400">{section.description}</p>
          </div>

          <div className="p-4">
            <ExpandPanels activePanel={section.id} sim={sim} />

            {section.id === 'activite' && hasRegimeOptions && activeRegimeId && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="font-bold text-sm text-indigo-700 dark:text-indigo-300">
                  Options {activeRegimeId}
                </p>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Paramètres spécifiques à ce statut
                </p>
                <div className="mt-3">
                  <RegimeParamsInline
                    sim={sim}
                    regimeId={activeRegimeId}
                    align="left"
                    variant="light"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

