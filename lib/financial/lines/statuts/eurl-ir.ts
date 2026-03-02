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

export function buildEurlIrLines(ctx: StatutContext): FinancialLine[] {
  const chargeFixes = ctx.depensesPro + ctx.indemnitesKm + ctx.loyer;
  const fees = chargeFixes + ctx.cfe;
  const base = ctx.ca - fees;
  const cotisRate = ctx.acreActive
    ? RATES_2026.eurlIr.cotis * RATES_2026.eurlIr.acre
    : RATES_2026.eurlIr.cotis;
  const cotis = base * cotisRate;
  const beforeTax = base - cotis;
  const ir = computeIR(beforeTax + ctx.loyer + ctx.spouseIncome, ctx.taxParts);

  return [
    {
      id: 'eurl_ir_cfe',
      label: 'CFE',
      category: 'statut',
      amount: ctx.cfe,
      cashImpact: 0,
      fiscalImpact: -ctx.cfe,
      socialImpact: 0,
      applicableStatuses: ['EURL IR'],
    },
    {
      id: 'eurl_ir_cotis',
      label: 'Cotisations sociales',
      category: 'statut',
      amount: cotis,
      cashImpact: 0,
      fiscalImpact: 0,
      socialImpact: -cotis,
      applicableStatuses: ['EURL IR'],
      formula: `Base × ${(cotisRate * 100).toFixed(0)}%`,
    },
    {
      id: 'eurl_ir_remuneration',
      label: 'Rémunération nette',
      category: 'statut',
      amount: beforeTax,
      cashImpact: beforeTax,
      fiscalImpact: beforeTax,
      socialImpact: 0,
      applicableStatuses: ['EURL IR'],
    },
    {
      id: 'eurl_ir_ir',
      label: 'IR foyer',
      category: 'fiscalite',
      amount: ir,
      cashImpact: -ir,
      fiscalImpact: 0,
      socialImpact: 0,
      applicableStatuses: ['EURL IR'],
    },
  ];
}
