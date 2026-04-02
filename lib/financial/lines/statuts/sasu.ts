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
  /** Part du résultat affectée au salaire du président (0–100) */
  repartitionRemuneration: number;
}

export function buildSasuLines(ctx: StatutContext): FinancialLine[] {
  const chargeFixes = ctx.depensesPro + ctx.indemnitesKm + ctx.loyer + ctx.avantagesOptimises;
  const fees = chargeFixes + ctx.cfe;
  const resultat = ctx.ca - fees;

  const ratioSalaire = Math.min(100, Math.max(0, ctx.repartitionRemuneration ?? 0)) / 100;

  const cotisRate = ctx.acreActive
    ? RATES_2026.sasu.cotis * RATES_2026.sasu.acre
    : RATES_2026.sasu.cotis;

  const enveloppeSalaire = resultat * ratioSalaire;
  const salaireNet = enveloppeSalaire / (1 + cotisRate);
  const cotis = salaireNet * cotisRate;

  const { tauxReduit, seuilTauxReduit, tauxNormal } = RATES_2026.isSasu;
  const baseIS = Math.max(0, resultat - enveloppeSalaire);
  const partTauxReduit = Math.min(baseIS, seuilTauxReduit);
  const partTauxNormal = Math.max(0, baseIS - seuilTauxReduit);
  const isSociete = partTauxReduit * tauxReduit + partTauxNormal * tauxNormal;
  const apresIS = baseIS - isSociete;

  const dividendesBruts = apresIS;
  const pfu = dividendesBruts * RATES_2026.flatTaxDividendes;
  const dividendesNets = dividendesBruts - pfu;

  const ir = salaireNet > 0
    ? computeIR(salaireNet + ctx.loyer + ctx.spouseIncome, ctx.taxParts)
    : 0;

  const lines: FinancialLine[] = [
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
  ];

  if (enveloppeSalaire > 0) {
    lines.push(
      {
        id: 'sasu_cotis',
        label: 'Cotisations sociales (président)',
        category: 'statut',
        amount: cotis,
        cashImpact: 0,
        fiscalImpact: 0,
        socialImpact: -cotis,
        applicableStatuses: ['SASU'],
        formula: [
          `Enveloppe salaire : ${Math.round(enveloppeSalaire).toLocaleString('fr-FR')} € (${Math.round(ratioSalaire * 100)} % du résultat)`,
          `Salaire net = enveloppe / (1 + ${(cotisRate * 100).toFixed(0)} %) = ${Math.round(salaireNet).toLocaleString('fr-FR')} €`,
          `Cotisations = ${Math.round(cotis).toLocaleString('fr-FR')} €`,
        ].join('\n'),
      },
      {
        id: 'sasu_remuneration',
        label: 'Rémunération nette président',
        category: 'statut',
        amount: salaireNet,
        cashImpact: salaireNet,
        fiscalImpact: salaireNet,
        socialImpact: 0,
        applicableStatuses: ['SASU'],
        formula: [
          `Résultat affecté au salaire (${Math.round(ratioSalaire * 100)} %) :`,
          `→ Enveloppe brute : ${Math.round(enveloppeSalaire).toLocaleString('fr-FR')} €`,
          `→ Salaire net : ${Math.round(salaireNet).toLocaleString('fr-FR')} €`,
        ].join('\n'),
      },
    );
  }

  lines.push({
    id: 'sasu_is',
    label: 'Impôt sur les sociétés',
    category: 'statut',
    amount: isSociete,
    cashImpact: 0,
    fiscalImpact: 0,
    socialImpact: 0,
    applicableStatuses: ['SASU'],
    formula: [
      `Résultat non distribué en salaire : ${Math.round(baseIS).toLocaleString('fr-FR')} €`,
      `IS PME : 15 % jusqu'à ${(seuilTauxReduit / 1000).toFixed(0)} k€, 25 % au-delà`,
      `= ${Math.round(isSociete).toLocaleString('fr-FR')} €`,
    ].join('\n'),
  });

  if (dividendesBruts > 0) {
    lines.push({
      id: 'sasu_dividendes',
      label: 'Dividendes nets',
      category: 'statut',
      amount: dividendesNets,
      cashImpact: dividendesNets,
      fiscalImpact: dividendesBruts,
      socialImpact: 0,
      applicableStatuses: ['SASU'],
      formula: [
        `Bénéfice après IS : ${Math.round(apresIS).toLocaleString('fr-FR')} €`,
        `→ Dividendes bruts : ${Math.round(dividendesBruts).toLocaleString('fr-FR')} €`,
        `→ PFU 30 % : −${Math.round(pfu).toLocaleString('fr-FR')} €`,
        `→ Dividendes nets : ${Math.round(dividendesNets).toLocaleString('fr-FR')} €`,
      ].join('\n'),
    });
  }

  lines.push({
    id: 'sasu_pfu',
    label: 'Flat tax (PFU 30 %)',
    category: 'fiscalite',
    amount: pfu,
    cashImpact: 0,
    fiscalImpact: 0,
    socialImpact: 0,
    applicableStatuses: ['SASU'],
    formula: `Dividendes bruts : ${Math.round(dividendesBruts).toLocaleString('fr-FR')} €\n` +
      `× PFU 30 % (17,2 % prélèv. sociaux + 12,8 % IR)\n` +
      `= ${Math.round(pfu).toLocaleString('fr-FR')} €`,
  });

  if (salaireNet > 0) {
    lines.push({
      id: 'sasu_ir',
      label: 'IR foyer (sur salaire)',
      category: 'fiscalite',
      amount: ir,
      cashImpact: -ir,
      fiscalImpact: 0,
      socialImpact: 0,
      applicableStatuses: ['SASU'],
      formula: computeIRDetail(salaireNet + ctx.loyer + ctx.spouseIncome, ctx.taxParts),
    });
  }

  return lines;
}
