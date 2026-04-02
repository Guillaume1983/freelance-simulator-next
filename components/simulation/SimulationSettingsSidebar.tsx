'use client';

import { Fragment, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Calculator,
  Car,
  ChevronDown,
  Gift,
  Receipt,
  ShieldCheck,
  Users,
} from 'lucide-react';
import ExpandPanels from '@/components/ExpandPanels';
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
}: {
  sim: SimCtx;
  activeRegimeId: string | undefined;
  openSection: SidebarPanelId | 'regime_options' | null;
  setOpenSection: (id: SidebarPanelId | 'regime_options' | null) => void;
  /** Filtre les panels pour ne garder que ceux pertinents au statut (utilisé sur simulateur). */
  filterByRegime?: boolean;
  /** Cache le contenu de certains panels non pertinents (utilisé sur simulateur pour Micro). */
  suppressNonApplicablePanels?: boolean;
}) {
  // Les options spécifiques au statut (part salaire SASU, frais portage, etc.)
  // sont affichées inline dans la carte du statut, pas dans ce panneau.

  const visibleSections = useMemo(() => {
    if (!filterByRegime || !activeRegimeId) return SIDEBAR_SECTIONS;
    const allowed = REGIME_VISIBLE_SECTIONS[activeRegimeId];
    if (!allowed) return SIDEBAR_SECTIONS;
    return SIDEBAR_SECTIONS.filter((s) => allowed.includes(s.id as any));
  }, [filterByRegime, activeRegimeId]);

  useEffect(() => {
    if (!filterByRegime) return;
    const firstVisible = visibleSections[0]?.id ?? 'activite';

    if (openSection === 'regime_options') {
      setOpenSection(null);
      return;
    }

    if (!openSection) return;
    if (!visibleSections.some((s) => s.id === openSection)) {
      setOpenSection(firstVisible);
    }
  }, [filterByRegime, visibleSections, openSection, setOpenSection]);

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
                    />
                  </div>
                </div>
              </div>
            </div>
            
          </Fragment>
        );
      })}
    </div>
  );
}
