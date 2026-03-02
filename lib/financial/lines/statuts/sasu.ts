import type { FinancialLine } from '../../types';
import { RATES_2026 } from '../../rates';

export interface StatutContext {
  ca: number;
  depensesPro: number;
  indemnitesKm: number;
  loyer: number;
  cfe: number;
  avantagesOptimises: number;
  taxParts: number;
  spouseIncome: number;
  acreActive: boolean;
}

export function buildSasuLines(ctx: StatutContext): FinancialLine[] {
  const chargeFixes = ctx.depensesPro + ctx.indemnitesKm + ctx.loyer;
  const fees = chargeFixes + ctx.cfe;
  const base = ctx.ca - fees;
  const isSociete = base * RATES_2026.isSasu.taux;
  const beforeTax = base - isSociete;
  const ir = beforeTax * RATES_2026.flatTaxDividendes;

  return [
    {
      id: 'sasu_cfe',
      label: 'CFE',
      category: 'statut',
      amount: ctx.cfe,
      cashImpact: 0,
      fiscalImpact: -ctx.cfe,
      socialImpact: 0,
      applicableStatuses: ['SASU'],
    },
    {
      id: 'sasu_is',
      label: 'Impôt sur les sociétés',
      category: 'statut',
      amount: isSociete,
      cashImpact: 0,
      fiscalImpact: 0,
      socialImpact: 0,
      applicableStatuses: ['SASU'],
      formula: `Base × ${(RATES_2026.isSasu.taux * 100).toFixed(0)}%`,
    },
    {
      id: 'sasu_dividendes',
      label: 'Dividendes nets',
      category: 'statut',
      amount: beforeTax * 0.70,
      cashImpact: beforeTax * 0.70,
      fiscalImpact: beforeTax,
      socialImpact: 0,
      applicableStatuses: ['SASU'],
      formula: 'Base après IS × 70%',
    },
    {
      id: 'sasu_ir',
      label: 'Flat tax (30%)',
      category: 'fiscalite',
      amount: ir,
      cashImpact: -ir,
      fiscalImpact: 0,
      socialImpact: 0,
      applicableStatuses: ['SASU'],
    },
  ];
}
