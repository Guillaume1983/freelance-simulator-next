import { Briefcase, Store, Building2, Building } from 'lucide-react';

/** Icône + couleur du header par régime (simulateur, palier). */
export const STATUT_HEADER_ICON: Record<string, { Icon: typeof Briefcase; iconClass: string }> = {
  Portage: { Icon: Briefcase, iconClass: 'bg-indigo-500 text-white' },
  Micro: { Icon: Store, iconClass: 'bg-amber-500 text-white' },
  'EURL IR': { Icon: Building2, iconClass: 'bg-emerald-500 text-white' },
  'EURL IS': { Icon: Building2, iconClass: 'bg-blue-500 text-white' },
  SASU: { Icon: Building, iconClass: 'bg-violet-500 text-white' },
};

/** Style CSS pour l'impression PDF (partagé par comparateur, simulateur, palier). */
export const PDF_PAGE_STYLE = `
  @page { size: A4 portrait; margin: 8mm; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
`;

/** Styles de bordure / halo par régime — histogramme, mini-nav, pastilles d'année. */
export const REGIME_COLORS: Record<string, { gradient: string; bg: string; border: string; ring: string }> = {
  Portage: {
    gradient: 'from-violet-500 to-indigo-600',
    bg: 'bg-violet-500',
    border: 'border-violet-400',
    ring: 'ring-violet-400',
  },
  Micro: {
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-500',
    border: 'border-amber-400',
    ring: 'ring-amber-400',
  },
  'EURL IR': {
    gradient: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-500',
    border: 'border-emerald-400',
    ring: 'ring-emerald-400',
  },
  'EURL IS': {
    gradient: 'from-blue-400 to-cyan-500',
    bg: 'bg-blue-500',
    border: 'border-blue-400',
    ring: 'ring-blue-400',
  },
  SASU: {
    gradient: 'from-rose-400 to-pink-500',
    bg: 'bg-rose-500',
    border: 'border-rose-400',
    ring: 'ring-rose-400',
  },
};

export type RegimeLikeForHistogram = {
  id: string;
  ca: number;
  fees: number;
  cotis: number;
  ir: number;
  net: number;
  lines?: { id?: string; amount?: number }[];
  cashInCompany?: number;
};
