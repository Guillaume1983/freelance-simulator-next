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
  prelevementLiberatoire: boolean;
  typeActiviteMicro: 'BNC' | 'BIC_SERVICE' | 'BIC_COMMERCE';
}

export function buildMicroLines(ctx: StatutContext): FinancialLine[] {
  const microRates = RATES_2026.micro[ctx.typeActiviteMicro];
  const cotisRate = ctx.acreActive
    ? microRates.cotis * RATES_2026.micro.acre
    : microRates.cotis;
  const cotis = ctx.ca * cotisRate;
  const beforeTax = ctx.ca - cotis - ctx.cfe;
  const ir = ctx.prelevementLiberatoire
    ? ctx.ca * microRates.pl
    : computeIR(ctx.ca * (1 - microRates.abattement) + ctx.spouseIncome, ctx.taxParts);

  return [
    {
      id: 'micro_cfe',
      label: 'CFE',
      category: 'statut',
      amount: ctx.cfe,
      cashImpact: 0,
      fiscalImpact: -ctx.cfe,
      socialImpact: 0,
      applicableStatuses: ['Micro'],
    },
    {
      id: 'micro_cotis',
      label: 'Cotisations sociales',
      category: 'statut',
      amount: cotis,
      cashImpact: 0,
      fiscalImpact: 0,
      socialImpact: -cotis,
      applicableStatuses: ['Micro'],
      formula: `CA × ${(cotisRate * 100).toFixed(1)}%`,
    },
    {
      id: 'micro_remuneration',
      label: 'Revenu imposable',
      category: 'statut',
      amount: beforeTax,
      cashImpact: beforeTax,
      fiscalImpact: beforeTax,
      socialImpact: 0,
      applicableStatuses: ['Micro'],
    },
    {
      id: 'micro_ir',
      label: ctx.prelevementLiberatoire ? 'Prélèvement libératoire' : 'IR foyer',
      category: 'fiscalite',
      amount: ir,
      cashImpact: -ir,
      fiscalImpact: 0,
      socialImpact: 0,
      applicableStatuses: ['Micro'],
      formula: ctx.prelevementLiberatoire
        ? `CA × ${(microRates.pl * 100).toFixed(1)}%`
        : `Barème IR — base = CA × ${((1 - microRates.abattement) * 100).toFixed(0)}% — ${ctx.taxParts} parts`,
    },
  ];
}
