import type { FinancialLine } from '../../types';
import { computeIR, computeIRDetail, computeTNSCotisations, computeTNSDetail } from '../../rates';

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
  const e = (v: number) => Math.round(v).toLocaleString('fr-FR') + ' €';

  // Charges déductibles au niveau du bénéfice : dépenses pro + IK + loyer + avantages exonérés
  const chargeFixes = ctx.depensesPro + ctx.indemnitesKm + ctx.loyer + ctx.avantagesOptimises;
  const fees = chargeFixes + ctx.cfe;
  const benefice = ctx.ca - fees;

  // Calcul TNS détaillé (vraies tranches URSSAF)
  const tns = computeTNSCotisations(benefice, ctx.acreActive);

  // Revenu imposable IR = bénéfice − cotisations déductibles (hors CSG non-déd. + CRDS)
  const irBase = benefice - tns.deductible;

  // Cash disponible avant IR = bénéfice − toutes cotisations (dont CSG non-déductible)
  const cashBeforeIR = benefice - tns.total;

  const ir = computeIR(irBase + ctx.loyer + ctx.spouseIncome, ctx.taxParts);

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
      label: 'Cotisations sociales TNS',
      category: 'statut',
      amount: tns.total,
      cashImpact: 0,
      fiscalImpact: 0,
      socialImpact: -tns.total,
      applicableStatuses: ['EURL IR'],
      formula: [
        'Bénéfice = CA − (dépenses pro + IK + loyer + avantages exonérés + CFE)',
        `= ${e(ctx.ca)} − ${e(fees)} = ${e(benefice)}`,
        computeTNSDetail(benefice, ctx.acreActive),
      ].join('\n'),
    },
    {
      id: 'eurl_ir_remuneration',
      label: 'Revenu imposable (avant IR)',
      category: 'statut',
      // Le montant affiché est le revenu imposable (bénéfice − cotis. déductibles).
      // Le cashImpact est le cash réel avant IR (bénéfice − toutes cotisations).
      // L'écart = CSG non-déductible + CRDS (3,4 %), non déduite de l'assiette IR.
      amount: irBase,
      cashImpact: cashBeforeIR,
      fiscalImpact: irBase,
      socialImpact: 0,
      applicableStatuses: ['EURL IR'],
      formula: [
        `Revenu imposable = bénéfice − cotisations déductibles`,
        `${e(benefice)} − ${e(tns.deductible)} = ${e(irBase)}`,
        `(Cash avant IR : ${e(cashBeforeIR)} ; écart CSG non-déd. + CRDS = ${e(tns.total - tns.deductible)})`,
      ].join('\n'),
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
      formula: computeIRDetail(irBase + ctx.loyer + ctx.spouseIncome, ctx.taxParts),
    },
  ];
}
