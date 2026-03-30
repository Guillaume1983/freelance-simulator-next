'use client';

import { Fragment, useEffect, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import ExpandPanels from '@/components/ExpandPanels';
import RegimeParamsInline from '@/components/RegimeParamsInline';
import { cn } from '@/lib/utils';
import { useSimulationContext } from '@/context/SimulationContext';

export const SIDEBAR_SECTIONS = [
  { id: 'activite' as const, label: 'Activité', description: 'CA, TJM, jours travaillés' },
  { id: 'charges' as const, label: 'Charges', description: 'Frais professionnels' },
  { id: 'amortissement' as const, label: 'Amortissement', description: 'Achat matériel année 1' },
  { id: 'vehicule' as const, label: 'Véhicule', description: 'Indemnités kilométriques' },
  { id: 'opti' as const, label: 'Optimisations', description: 'Loyer, avantages' },
  { id: 'cotisations' as const, label: 'Cotisations', description: 'ACRE, CFE' },
  { id: 'foyer' as const, label: 'Foyer', description: 'Situation familiale' },
] as const;

export type SidebarPanelId = (typeof SIDEBAR_SECTIONS)[number]['id'];

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

export function SimulationSettingsSidebar({
  sim,
  activeRegimeId,
  openSection,
  setOpenSection,
  filterByRegime = false,
}: {
  sim: SimCtx;
  activeRegimeId: string | undefined;
  openSection: SidebarPanelId | 'regime_options' | null;
  setOpenSection: (id: SidebarPanelId | 'regime_options' | null) => void;
  /** Filtre les panels pour ne garder que ceux pertinents au statut (utilisé sur simulateur). */
  filterByRegime?: boolean;
}) {
  const hasRegimeOptions = activeRegimeId && REGIMES_WITH_OPTIONS.includes(activeRegimeId);

  const regimeOptionsBlock =
    hasRegimeOptions && activeRegimeId ? (
      <div>
        <button
          type="button"
          onClick={() => setOpenSection(openSection === 'regime_options' ? null : 'regime_options')}
          className={cn(
            'w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors',
            openSection === 'regime_options'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100',
          )}
          aria-expanded={openSection === 'regime_options'}
        >
          <span>
            <span className="block font-bold text-sm">Options {activeRegimeId}</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Paramètres spécifiques à ce statut
            </span>
          </span>
          <ChevronRight
            className={cn(
              'w-5 h-5 shrink-0 text-slate-400 transition-transform',
              openSection === 'regime_options' && 'rotate-90',
            )}
          />
        </button>
        {openSection === 'regime_options' && (
          <div className="px-4 pb-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-visible">
            <RegimeParamsInline sim={sim} regimeId={activeRegimeId} align="left" variant="light" />
          </div>
        )}
      </div>
    ) : null;

  const visibleSections = useMemo(() => {
    if (!filterByRegime || !activeRegimeId) return SIDEBAR_SECTIONS;
    const allowed = REGIME_VISIBLE_SECTIONS[activeRegimeId];
    if (!allowed) return SIDEBAR_SECTIONS;
    return SIDEBAR_SECTIONS.filter((s) => allowed.includes(s.id));
  }, [filterByRegime, activeRegimeId]);

  useEffect(() => {
    if (!filterByRegime) return;
    const firstVisible = visibleSections[0]?.id ?? 'activite';

    if (openSection === 'regime_options') {
      if (!hasRegimeOptions) setOpenSection(null);
      return;
    }

    if (!openSection) return;
    if (!visibleSections.some((s) => s.id === openSection)) {
      setOpenSection(firstVisible);
    }
  }, [filterByRegime, visibleSections, openSection, setOpenSection, hasRegimeOptions]);

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-700">
      {visibleSections.map((section) => {
        const isOpen = openSection === section.id;
        return (
          <Fragment key={section.id}>
            <div>
              <button
                type="button"
                onClick={() => setOpenSection(isOpen ? null : section.id)}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors',
                  isOpen
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100',
                )}
                aria-expanded={isOpen}
              >
                <span>
                  <span className="block font-bold text-sm">{section.label}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {section.description}
                  </span>
                </span>
                <ChevronRight
                  className={cn(
                    'w-5 h-5 shrink-0 text-slate-400 transition-transform',
                    isOpen && 'rotate-90',
                  )}
                />
              </button>
              {isOpen && (
                <div className="px-3 pb-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-visible [&_input]:max-w-full [&_select]:max-w-full">
                  <ExpandPanels activePanel={section.id} sim={sim} />
                </div>
              )}
            </div>
            {section.id === 'activite' && regimeOptionsBlock}
          </Fragment>
        );
      })}
    </div>
  );
}
