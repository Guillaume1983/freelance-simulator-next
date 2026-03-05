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
  /** Pourcentage de résultat distribué en dividendes (0–100) */
  repartitionRemuneration: number;
}

export function buildSasuLines(ctx: StatutContext): FinancialLine[] {
  // Charges déductibles de la SASU : dépenses pro + IK + loyer + avantages exonérés
  const chargeFixes = ctx.depensesPro + ctx.indemnitesKm + ctx.loyer + ctx.avantagesOptimises;
  const fees = chargeFixes + ctx.cfe;
  const base = ctx.ca - fees;

  const { tauxReduit, seuilTauxReduit, tauxNormal } = RATES_2026.isSasu;
  const partTauxReduit = Math.min(base, seuilTauxReduit);
  const partTauxNormal = Math.max(0, base - seuilTauxReduit);
  const isSociete = partTauxReduit * tauxReduit + partTauxNormal * tauxNormal;
  const apresIS = base - isSociete;

  // Part du résultat distribuée en dividendes (le reste reste en société)
  const divPct = Math.min(100, Math.max(0, ctx.repartitionRemuneration ?? 70)) / 100;
  const dividendesBruts = apresIS * divPct;
  const ir = dividendesBruts * RATES_2026.flatTaxDividendes;
  const dividendesNets = dividendesBruts - ir;

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
      formula: [
        'Base IS = CA − (dépenses pro + IK + loyer + avantages exonérés + CFE)',
        `= ${Math.round(ctx.ca).toLocaleString('fr-FR')} € − ${Math.round(fees).toLocaleString('fr-FR')} € = ${Math.round(base).toLocaleString('fr-FR')} €`,
        `IS PME : 15 % jusqu'à ${(seuilTauxReduit / 1000).toFixed(0)} k€, 25 % au-delà`,
      ].join('\n'),
    },
    {
      id: 'sasu_dividendes',
      label: 'Dividendes nets',
      category: 'statut',
      amount: dividendesNets,
      cashImpact: dividendesNets,
      fiscalImpact: dividendesBruts,
      socialImpact: 0,
      applicableStatuses: ['SASU'],
      formula: [
        `Résultat après IS : ${Math.round(apresIS).toLocaleString('fr-FR')} €`,
        `${Math.round(divPct * 100)} % distribués en dividendes`,
        `→ Dividendes bruts : ${Math.round(dividendesBruts).toLocaleString('fr-FR')} €`,
        `→ Dividendes nets (après PFU 30 %) : ${Math.round(dividendesNets).toLocaleString('fr-FR')} €`,
      ].join('\n'),
    },
    {
      id: 'sasu_ir',
      label: 'Flat tax (30%)',
      category: 'fiscalite',
      amount: ir,
      // Le PFU 30 % est déjà déduit dans les "dividendes nets" ci-dessus.
      // On affiche ici le montant d'impôt pour information, sans l'impacter une seconde fois sur le cash.
      cashImpact: 0,
      fiscalImpact: 0,
      socialImpact: 0,
      applicableStatuses: ['SASU'],
      formula: `Dividendes bruts distribués : ${Math.round(dividendesBruts).toLocaleString('fr-FR')} €\n` +
        `× Flat Tax PFU 30 % (17,2 % prélèv. sociaux + 12,8 % IR)\n` +
        `= ${Math.round(ir).toLocaleString('fr-FR')} €`,
    },
  ];
}
