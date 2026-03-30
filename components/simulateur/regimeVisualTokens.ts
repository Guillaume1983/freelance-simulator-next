/** Styles de bordure / halo par régime — histogramme, mini-nav, pastilles d’année. */
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
