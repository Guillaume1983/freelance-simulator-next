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
  fraisGestionPortage: number;
}

export function buildPortageLines(ctx: StatutContext): FinancialLine[] {
  // Charges supportées par la société de portage : dépenses pro + IK + avantages exonérés (pas de loyer bureau à domicile, l'employeur est la société de portage)
  const chargeFixes = ctx.depensesPro + ctx.indemnitesKm + ctx.avantagesOptimises;
  const comm = ctx.ca * (ctx.fraisGestionPortage / 100);
  const fees = chargeFixes + comm;
  const base = ctx.ca - fees;
  // ACRE ne s'applique pas en portage salarial (statut salarié du porté)
  const cotisRate = RATES_2026.portage.cotis;
  const cotis = base * cotisRate;
  const beforeTax = base - cotis;
  const ir = computeIR(beforeTax + ctx.spouseIncome, ctx.taxParts);

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
      formula: [
        'Base nette = CA − (dépenses pro portage + IK + avantages exonérés + commission)',
        `= ${Math.round(ctx.ca).toLocaleString('fr-FR')} € − ${Math.round(fees).toLocaleString('fr-FR')} € = ${Math.round(base).toLocaleString('fr-FR')} €`,
        `Cotisations = Base nette × ${(cotisRate * 100).toFixed(1)}%`,
      ].join('\n'),
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
      formula: [
        `Base = CA − charges − commission = ${Math.round(ctx.ca).toLocaleString('fr-FR')} € − ${Math.round(chargeFixes).toLocaleString('fr-FR')} € − ${Math.round(comm).toLocaleString('fr-FR')} € = ${Math.round(base).toLocaleString('fr-FR')} €`,
        `Rémunération nette = Base − cotisations = ${Math.round(base).toLocaleString('fr-FR')} € − ${Math.round(cotis).toLocaleString('fr-FR')} € = ${Math.round(beforeTax).toLocaleString('fr-FR')} €`,
      ].join('\n'),
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
      formula: computeIRDetail(beforeTax + ctx.spouseIncome, ctx.taxParts),
    },
  ];
}
