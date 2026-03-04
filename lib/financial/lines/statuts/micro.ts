import type { FinancialLine } from '../../types';
import { RATES_2026, computeIR, computeIRDetail } from '../../rates';

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
      formula: `Revenu avant IR = CA − cotisations − CFE\n= ${Math.round(ctx.ca).toLocaleString('fr-FR')} € − ${Math.round(cotis).toLocaleString('fr-FR')} € − ${Math.round(ctx.cfe).toLocaleString('fr-FR')} € = ${Math.round(beforeTax).toLocaleString('fr-FR')} €`,
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
        ? `Prélèvement libératoire\nCA : ${Math.round(ctx.ca).toLocaleString('fr-FR')} €  ×  ${(microRates.pl * 100).toFixed(1)} %  =  ${Math.round(ir).toLocaleString('fr-FR')} €`
        : computeIRDetail(ctx.ca * (1 - microRates.abattement) + ctx.spouseIncome, ctx.taxParts),
    },
  ];
}
