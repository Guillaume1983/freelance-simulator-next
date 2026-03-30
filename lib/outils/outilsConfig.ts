import type { LucideIcon } from 'lucide-react';
import {
  Car,
  Building2,
  Sparkles,
  TrendingUp,
  Percent,
  Calculator,
  Receipt,
  Wallet,
} from 'lucide-react';

export const OUTIL_IDS = [
  'indemnites-km',
  'cfe',
  'acre',
  'plafonds-micro',
  'franchise-tva',
  'tjm-revenu-net',
  'taux-effectif-ir',
  'cotisations-tns',
] as const;

export type OutilId = (typeof OUTIL_IDS)[number];

export function isOutilId(s: string | null | undefined): s is OutilId {
  return s != null && (OUTIL_IDS as readonly string[]).includes(s);
}

export const DEFAULT_OUTIL_ID: OutilId = 'indemnites-km';

export type OutilTabConfig = {
  id: OutilId;
  label: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
  activeIcon: string;
  headerGradient: string;
};

export const OUTILS_TABS: readonly OutilTabConfig[] = [
  {
    id: 'indemnites-km',
    label: 'Indemnités km',
    description: 'Barème URSSAF',
    icon: Car,
    gradient: 'from-teal-500 to-teal-600',
    activeBg: 'bg-teal-50',
    activeBorder: 'border-teal-300',
    activeText: 'text-teal-700',
    activeIcon: 'from-teal-500 to-teal-600',
    headerGradient: 'from-sky-500 to-blue-500',
  },
  {
    id: 'cfe',
    label: 'CFE',
    description: 'Selon la commune',
    icon: Building2,
    gradient: 'from-violet-500 to-violet-600',
    activeBg: 'bg-violet-50',
    activeBorder: 'border-violet-300',
    activeText: 'text-violet-700',
    activeIcon: 'from-violet-500 to-violet-600',
    headerGradient: 'from-violet-500 to-violet-600',
  },
  {
    id: 'acre',
    label: 'ACRE',
    description: 'Exonération an 1',
    icon: Sparkles,
    gradient: 'from-emerald-500 to-emerald-600',
    activeBg: 'bg-emerald-50',
    activeBorder: 'border-emerald-300',
    activeText: 'text-emerald-700',
    activeIcon: 'from-emerald-500 to-emerald-600',
    headerGradient: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 'plafonds-micro',
    label: 'Plafonds micro',
    description: 'BNC / BIC',
    icon: TrendingUp,
    gradient: 'from-amber-500 to-amber-600',
    activeBg: 'bg-amber-50',
    activeBorder: 'border-amber-300',
    activeText: 'text-amber-700',
    activeIcon: 'from-amber-500 to-amber-600',
    headerGradient: 'from-amber-500 to-amber-600',
  },
  {
    id: 'franchise-tva',
    label: 'Franchise TVA',
    description: 'Seuils et position',
    icon: Percent,
    gradient: 'from-sky-500 to-sky-600',
    activeBg: 'bg-sky-50',
    activeBorder: 'border-sky-300',
    activeText: 'text-sky-700',
    activeIcon: 'from-sky-500 to-sky-600',
    headerGradient: 'from-sky-500 to-sky-600',
  },
  {
    id: 'tjm-revenu-net',
    label: 'TJM → net',
    description: 'Revenu par statut',
    icon: Calculator,
    gradient: 'from-indigo-500 to-indigo-600',
    activeBg: 'bg-indigo-50',
    activeBorder: 'border-indigo-300',
    activeText: 'text-indigo-700',
    activeIcon: 'from-indigo-500 to-indigo-600',
    headerGradient: 'from-indigo-500 to-indigo-600',
  },
  {
    id: 'taux-effectif-ir',
    label: 'Taux effectif IR',
    description: 'Barème progressif',
    icon: Receipt,
    gradient: 'from-rose-500 to-rose-600',
    activeBg: 'bg-rose-50',
    activeBorder: 'border-rose-300',
    activeText: 'text-rose-700',
    activeIcon: 'from-rose-500 to-rose-600',
    headerGradient: 'from-rose-500 to-rose-600',
  },
  {
    id: 'cotisations-tns',
    label: 'Cotisations TNS',
    description: 'Gérant / libéral',
    icon: Wallet,
    gradient: 'from-slate-500 to-slate-600',
    activeBg: 'bg-slate-50',
    activeBorder: 'border-slate-300',
    activeText: 'text-slate-700',
    activeIcon: 'from-slate-500 to-slate-600',
    headerGradient: 'from-slate-500 to-slate-600',
  },
] as const;

export const OUTIL_TAB_COLORS: Record<OutilId, string> = {
  'indemnites-km': '#0d9488',
  cfe: '#7c3aed',
  acre: '#059669',
  'plafonds-micro': '#d97706',
  'franchise-tva': '#0284c7',
  'tjm-revenu-net': '#4f46e5',
  'taux-effectif-ir': '#e11d48',
  'cotisations-tns': '#64748b',
};
