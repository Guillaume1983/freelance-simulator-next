'use client';

import { Fragment, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Calculator,
  Car,
  ChevronDown,
  Gift,
  LineChart,
  Receipt,
  Settings2,
  ShieldCheck,
  Users,
} from 'lucide-react';
import ExpandPanels from '@/components/ExpandPanels';
import RegimeParamsInline from '@/components/RegimeParamsInline';
import { cn } from '@/lib/utils';
import { useSimulationContext } from '@/context/SimulationContext';

export const SIDEBAR_SECTIONS = [
  {
    id: 'activite' as const,
    label: 'Activité',
    description: 'TJM et jours travaillés',
    icon: Briefcase,
    color: 'indigo',
  },
  // (Optionnel sur simulateur) : section insérée juste après "Activité"
  {
    id: 'croissance' as const,
    label: 'Croissance',
    description: 'Années 2 à 5',
    icon: LineChart,
    color: 'indigo',
    hiddenByDefault: true,
  },
  {
    id: 'charges' as const,
    label: 'Charges',
    description: 'Frais professionnels déductibles',
    icon: Receipt,
    color: 'rose',
  },
  {
    id: 'amortissement' as const,
    label: 'Amortissement',
    description: 'Matériel amorti sur 3 ans',
    icon: Calculator,
    color: 'amber',
  },
  {
    id: 'vehicule' as const,
    label: 'Véhicule',
    description: 'Indemnités kilométriques (IK)',
    icon: Car,
    color: 'emerald',
  },
  {
    id: 'opti' as const,
    label: 'Optimisations',
    description: 'Loyer, avantages CE/CSE',
    icon: Gift,
    color: 'violet',
  },
  {
    id: 'cotisations' as const,
    label: 'Cotisations',
    description: 'ACRE et CFE',
    icon: ShieldCheck,
    color: 'cyan',
  },
  {
    id: 'foyer' as const,
    label: 'Foyer fiscal',
    description: 'Quotient familial et IR',
    icon: Users,
    color: 'blue',
  },
] as const;

const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  indigo: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/40',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800',
    ring: 'ring-indigo-500/20',
  },
  rose: {
    bg: 'bg-rose-100 dark:bg-rose-900/40',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
    ring: 'ring-rose-500/20',
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    ring: 'ring-amber-500/20',
  },
  emerald: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/40',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    ring: 'ring-emerald-500/20',
  },
  violet: {
    bg: 'bg-violet-100 dark:bg-violet-900/40',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-800',
    ring: 'ring-violet-500/20',
  },
  cyan: {
    bg: 'bg-cyan-100 dark:bg-cyan-900/40',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-800',
    ring: 'ring-cyan-500/20',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    ring: 'ring-blue-500/20',
  },
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
    ring: 'ring-slate-500/20',
  },
};

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
  suppressNonApplicablePanels = false,
  showGrowthSection = false,
  growthByYear,
  onChangeGrowthYear,
}: {
  sim: SimCtx;
  activeRegimeId: string | undefined;
  openSection: SidebarPanelId | 'regime_options' | null;
  setOpenSection: (id: SidebarPanelId | 'regime_options' | null) => void;
  /** Filtre les panels pour ne garder que ceux pertinents au statut (utilisé sur simulateur). */
  filterByRegime?: boolean;
  /** Cache le contenu de certains panels non pertinents (utilisé sur simulateur pour Micro). */
  suppressNonApplicablePanels?: boolean;
  /** Ajoute le panel "Croissance" (simulateur uniquement). */
  showGrowthSection?: boolean;
  /** Tableau de croissance par année (index 0..4). */
  growthByYear?: number[];
  /** Setter de croissance par année (index 0..4). */
  onChangeGrowthYear?: (index: number, value: number) => void;
}) {
  const hasRegimeOptions = activeRegimeId && REGIMES_WITH_OPTIONS.includes(activeRegimeId);

  // Slate est trop neutre : on garde le style "Options" mais on lui donne une teinte visible comme les autres headers.
  const regimeOptionsColors = COLOR_CLASSES.indigo;

  const regimeOptionsBlock =
    hasRegimeOptions && activeRegimeId ? (
      <div className="border-b border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setOpenSection(openSection === 'regime_options' ? null : 'regime_options')}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 group',
            openSection === 'regime_options'
              ? 'bg-slate-50 dark:bg-slate-800/60'
              : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40',
          )}
          aria-expanded={openSection === 'regime_options'}
        >
          <div
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 border',
              openSection === 'regime_options'
                ? cn(regimeOptionsColors.bg, regimeOptionsColors.border, 'ring-2', regimeOptionsColors.ring)
                : cn('bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 group-hover:scale-105'),
            )}
          >
            <Settings2
              className={cn(
                'w-4 h-4 transition-colors',
                openSection === 'regime_options'
                  ? regimeOptionsColors.text
                  : 'text-slate-500 dark:text-slate-400',
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'text-sm font-bold leading-tight transition-colors',
                openSection === 'regime_options'
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white',
              )}
            >
              Options {activeRegimeId}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
              Paramètres spécifiques à ce statut
            </p>
          </div>
          <ChevronDown
            className={cn(
              'w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200',
              openSection === 'regime_options' && 'rotate-180',
            )}
          />
        </button>
        <div
          className={cn(
            'grid transition-all duration-200 ease-out',
            openSection === 'regime_options' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          )}
        >
          <div className="overflow-hidden">
            <div className="px-3 py-2">
              <RegimeParamsInline sim={sim} regimeId={activeRegimeId} align="right" variant="light" />
            </div>
          </div>
        </div>
      </div>
    ) : null;

  const visibleSections = useMemo(() => {
    type SidebarSection = (typeof SIDEBAR_SECTIONS)[number];
    const base: SidebarSection[] = showGrowthSection
      ? Array.from(SIDEBAR_SECTIONS)
      : (SIDEBAR_SECTIONS.filter((s) => !(s as SidebarSection & { hiddenByDefault?: boolean }).hiddenByDefault) as SidebarSection[]);

    if (!filterByRegime || !activeRegimeId) return base;
    const allowed = REGIME_VISIBLE_SECTIONS[activeRegimeId];
    if (!allowed) return base;
    return base.filter((s) => allowed.includes(s.id as any));
  }, [filterByRegime, activeRegimeId, showGrowthSection]);

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
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {visibleSections.map((section) => {
        const isOpen = openSection === section.id;
        const colors = COLOR_CLASSES[section.color] ?? COLOR_CLASSES.slate;
        const Icon = section.icon;

        return (
          <Fragment key={section.id}>
            <div>
              <button
                type="button"
                onClick={() => setOpenSection(isOpen ? null : section.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 group',
                  isOpen
                    ? 'bg-slate-50 dark:bg-slate-800/60'
                    : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40',
                )}
                aria-expanded={isOpen}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 border',
                    isOpen
                      ? cn(colors.bg, colors.border, 'ring-2', colors.ring)
                      : cn('bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 group-hover:scale-105'),
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isOpen ? colors.text : 'text-slate-500 dark:text-slate-400',
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-base font-black leading-tight transition-colors',
                      isOpen
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white',
                    )}
                  >
                    {section.label}
                  </p>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    {section.description}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>
              <div
                className={cn(
                  'grid transition-all duration-200 ease-out',
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-3 py-2 [&_input]:max-w-full [&_select]:max-w-full">
                    <ExpandPanels
                      activePanel={section.id}
                      sim={sim}
                      activeRegimeId={activeRegimeId}
                      suppressNonApplicablePanels={suppressNonApplicablePanels}
                      growthByYear={growthByYear}
                      onChangeGrowthYear={onChangeGrowthYear}
                    />
                  </div>
                </div>
              </div>
            </div>
            {section.id === 'activite' && regimeOptionsBlock}
          </Fragment>
        );
      })}
    </div>
  );
}
