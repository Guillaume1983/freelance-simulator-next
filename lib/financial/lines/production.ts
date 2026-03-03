import type { FinancialLine } from '../types';

export function buildProductionLines(
  ca: number,
  tjm: number,
  days: number,
  growthRate: number,
  annee: number
): FinancialLine[] {
  return [
    {
      id: 'ca_annuel',
      label: 'Chiffre d\'affaires annuel HT',
      category: 'production',
      amount: ca,
      cashImpact: 0,
      fiscalImpact: ca,
      socialImpact: 0,
      applicableStatuses: [],
      formula: annee === 1
        ? `${tjm} € × ${days} jours`
        : `${tjm} € × ${days} jours × (1 + ${(growthRate * 100).toFixed(0)}%)^${annee - 1}`,
    },
    {
      id: 'tjm',
      label: 'TJM',
      category: 'production',
      amount: tjm,
      cashImpact: 0,
      fiscalImpact: 0,
      socialImpact: 0,
      applicableStatuses: [],
    },
    {
      id: 'jours',
      label: 'Jours facturés',
      category: 'production',
      amount: days,
      cashImpact: 0,
      fiscalImpact: 0,
      socialImpact: 0,
      applicableStatuses: [],
    },
  ];
}
