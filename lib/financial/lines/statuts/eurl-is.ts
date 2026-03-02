import type { FinancialLine } from '../../types';
import { RATES_2026 } from '../../rates';
import { computeIR } from '../../rates';

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

export function buildEurlIsLines(ctx: StatutContext): FinancialLine[] {
  const chargeFixes = ctx.depensesPro + ctx.indemnitesKm + ctx.loyer;
  const fees = chargeFixes + ctx.cfe;
  const resultatSociete = ctx.ca - fees;
  const beforeTax = resultatSociete / 1.45;
  const cotisRate = ctx.acreActive
    ? RATES_2026.eurlIs.cotis * RATES_2026.eurlIs.acre
    : RATES_2026.eurlIs.cotis;
  const cotis = beforeTax * cotisRate;
  const isSociete = Math.max(0, resultatSociete - beforeTax) * RATES_2026.is.taux;
  const ir = computeIR(beforeTax + ctx.loyer + ctx.spouseIncome, ctx.taxParts);

  return [
    {
      id: 'eurl_is_cfe',
      label: 'CFE',
      category: 'statut',
      amount: ctx.cfe,
      cashImpact: 0,
      fiscalImpact: -ctx.cfe,
      socialImpact: 0,
      applicableStatuses: ['EURL IS'],
    },
    {
      id: 'eurl_is_cotis',
      label: 'Cotisations sociales',
      category: 'statut',
      amount: cotis,
      cashImpact: 0,
      fiscalImpact: 0,
      socialImpact: -cotis,
      applicableStatuses: ['EURL IS'],
      formula: `Salaire net × ${(cotisRate * 100).toFixed(0)}%`,
    },
    {
      id: 'eurl_is_is',
      label: 'Impôt sur les sociétés',
      category: 'statut',
      amount: isSociete,
      cashImpact: 0,
      fiscalImpact: 0,
      socialImpact: 0,
      applicableStatuses: ['EURL IS'],
      formula: 'max(0, Résultat - Salaire) × 25%',
    },
    {
      id: 'eurl_is_remuneration',
      label: 'Rémunération nette',
      category: 'statut',
      amount: beforeTax,
      cashImpact: beforeTax,
      fiscalImpact: beforeTax,
      socialImpact: 0,
      applicableStatuses: ['EURL IS'],
    },
    {
      id: 'eurl_is_ir',
      label: 'IR foyer',
      category: 'fiscalite',
      amount: ir,
      cashImpact: -ir,
      fiscalImpact: 0,
      socialImpact: 0,
      applicableStatuses: ['EURL IS'],
    },
  ];
}
