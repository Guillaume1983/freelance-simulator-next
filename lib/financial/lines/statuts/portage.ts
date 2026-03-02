import type { FinancialLine } from '../../types';
import { RATES_2026, computeIR } from '../../rates';

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
  fraisGestionPortage: number;
}

export function buildPortageLines(ctx: StatutContext): FinancialLine[] {
  const chargeFixes = ctx.depensesPro + ctx.indemnitesKm + ctx.loyer;
  const comm = ctx.ca * (ctx.fraisGestionPortage / 100);
  const fees = chargeFixes + comm;
  const base = ctx.ca - fees;
  const cotisRate = ctx.acreActive ? RATES_2026.portage.cotis * RATES_2026.portage.acre : RATES_2026.portage.cotis;
  const cotis = base * cotisRate;
  const beforeTax = base - cotis;
  const ir = computeIR(beforeTax + ctx.loyer + ctx.spouseIncome, ctx.taxParts);

  return [
    {
      id: 'portage_commission',
      label: 'Commission portage',
      category: 'statut',
      amount: comm,
      cashImpact: 0,
      fiscalImpact: -comm,
      socialImpact: 0,
      applicableStatuses: ['Portage'],
      formula: `CA × ${ctx.fraisGestionPortage}%`,
    },
    {
      id: 'portage_cotis',
      label: 'Cotisations sociales',
      category: 'statut',
      amount: cotis,
      cashImpact: 0,
      fiscalImpact: 0,
      socialImpact: -cotis,
      applicableStatuses: ['Portage'],
      formula: `Base × ${(cotisRate * 100).toFixed(1)}%`,
    },
    {
      id: 'portage_remuneration',
      label: 'Rémunération nette',
      category: 'statut',
      amount: beforeTax,
      cashImpact: beforeTax,
      fiscalImpact: beforeTax,
      socialImpact: 0,
      applicableStatuses: ['Portage'],
    },
    {
      id: 'portage_ir',
      label: 'IR foyer',
      category: 'fiscalite',
      amount: ir,
      cashImpact: -ir,
      fiscalImpact: 0,
      socialImpact: 0,
      applicableStatuses: ['Portage'],
    },
  ];
}
