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
  /** Part du résultat distribuée en salaire net (0–1) */
  remunerationDirigeantMensuelle: number;
}

export function buildEurlIsLines(ctx: StatutContext): FinancialLine[] {
  const ratioSalaire = Math.min(
    1,
    Math.max(0, ctx.remunerationDirigeantMensuelle ?? 1)
  );

  // Charges déductibles de la société : dépenses pro + IK + loyer + avantages exonérés
  const chargeFixes = ctx.depensesPro + ctx.indemnitesKm + ctx.loyer + ctx.avantagesOptimises;
  const fees = chargeFixes + ctx.cfe;
  const resultatSociete = ctx.ca - fees;
  const cotisRate = ctx.acreActive
    ? RATES_2026.eurlIs.cotis * RATES_2026.eurlIs.acre
    : RATES_2026.eurlIs.cotis;

  // Enveloppe du résultat affectée au salaire (coût total : net + cotis)
  const enveloppeSalaire = resultatSociete * ratioSalaire;
  const beforeTax = enveloppeSalaire / (1 + cotisRate); // salaire net
  const cotis = beforeTax * cotisRate;

  // Le reste du résultat reste en société et subit l'IS
  const baseIS = Math.max(0, resultatSociete - enveloppeSalaire);
  const isSociete = baseIS * RATES_2026.is.taux;

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
      formula: [
        'Résultat société = CA − (dépenses pro + IK + loyer + avantages exonérés + CFE)',
        `= ${Math.round(ctx.ca).toLocaleString('fr-FR')} € − ${Math.round(fees).toLocaleString('fr-FR')} € = ${Math.round(resultatSociete).toLocaleString('fr-FR')} €`,
        'Base IS = max(0, Résultat société − enveloppe salaire)',
        `IS = Base IS × ${(RATES_2026.is.taux * 100).toFixed(0)}%`,
      ].join('\n'),
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
      formula: `Résultat affecté au salaire (${Math.round(ratioSalaire * 100)} %) :\n` +
        `→ Enveloppe brute : ${Math.round(enveloppeSalaire).toLocaleString('fr-FR')} €\n` +
        `→ Salaire net : ${Math.round(beforeTax).toLocaleString('fr-FR')} €`,
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
      formula: computeIRDetail(beforeTax + ctx.loyer + ctx.spouseIncome, ctx.taxParts),
    },
  ];
}
