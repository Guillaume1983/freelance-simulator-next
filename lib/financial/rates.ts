/* ── Tous les taux fiscaux et barèmes 2026 ── */

/** Plafond Annuel de la Sécurité Sociale 2025 (valeur officielle, à mettre à jour en 2026) */
export const PASS = 47_100;

export const RATES_2026 = {
  /** Barème IR par part (seuils 2025 ; 2026 revalorisés ~+1 à 2 %, à mettre à jour si besoin) */
  ir: {
    abattement: 0.10,
    tranches: [
      { seuil: 11294, taux: 0 },
      { seuil: 28797, taux: 0.11 },
      { seuil: 82341, taux: 0.30 },
      { seuil: 177106, taux: 0.41 },
      { seuil: Infinity, taux: 0.45 },
    ],
  },
  micro: {
    BNC:          { cotis: 0.211, abattement: 0.34, pl: 0.022 },
    BIC_SERVICE:  { cotis: 0.212, abattement: 0.50, pl: 0.017 },
    BIC_COMMERCE: { cotis: 0.123, abattement: 0.71, pl: 0.010 },
    acre: 0.5,
  },
  portage: { cotis: 0.45, acre: 0.5 },
  eurlIs: { cotis: 0.45, acre: 0.5 }, // ACRE : exonération 50 % cotisations an 1
  is: { taux: 0.25 },
  /** SASU / PME : 15 % jusqu'à 42 500 €, 25 % au-delà (art. 219-I-b CGI) */
  isSasu: { tauxReduit: 0.15, seuilTauxReduit: 42_500, tauxNormal: 0.25 },
  flatTaxDividendes: 0.30,
  /** Barème kilométrique voiture (URSSAF, arr. 27 mars 2023). Clé = puissance fiscale (3 = 3 cv et moins). */
  ik: {
    '3': { a: 0.529, b: 0.316, c: 0.370, midConst: 1065 }, // 3 cv et moins
    '4': { a: 0.606, b: 0.340, c: 0.407, midConst: 1330 }, // 4 cv
    '5': { a: 0.636, b: 0.357, c: 0.427, midConst: 1395 }, // 5 cv
    '6': { a: 0.665, b: 0.374, c: 0.447, midConst: 1457 }, // 6 cv
    '7': { a: 0.697, b: 0.394, c: 0.470, midConst: 1515 }, // 7 cv et plus
  } as Record<string, { a: number; b: number; c: number; midConst: number }>,
};

/* ── Cotisations TNS (gérant EURL IR, professions libérales – SSI) ── */

export interface TNSCotisResult {
  /** Total des cotisations à payer (trésorerie) */
  total: number;
  /** Part déductible du revenu imposable IR (hors CSG non-déductible + CRDS) */
  deductible: number;
  /** Détail ligne par ligne */
  detail: Array<{ label: string; amount: number }>;
}

/**
 * Calcul des cotisations sociales TNS pour un gérant de société à l'IR
 * (professions libérales, SSI – barème 2025 / estimé 2026).
 *
 * Sources : URSSAF, CIPAV, DSS – taux valides pour revenus > 40 % PASS.
 * Simplifications retenues : maladie 6,5 % forfaitaire au-delà du seuil,
 * retraite complémentaire CIPAV classe A (~7 %), pas de cotisations minimales.
 */
export function computeTNSCotisations(benefice: number, acreActive = false): TNSCotisResult {
  const B = Math.max(0, benefice);
  const P = PASS;

  // Retraite de base : 17,75 % dans la limite du PASS, 0,6 % au-delà
  const retBase = 0.1775 * Math.min(B, P) + 0.006 * Math.max(0, B - P);

  // Retraite complémentaire CIPAV classe A : ~7 %
  const retCompl = 0.07 * B;

  // Invalidité-décès : 1,3 % plafonné au PASS
  const invalDeces = 0.013 * Math.min(B, P);

  // Maladie-maternité : 0 % sous 40 % PASS, ~6,5 % au-delà (formule progressive simplifiée)
  const maladie = B < 0.4 * P ? 0 : 0.065 * B;

  // Allocations familiales : 0 % ≤ 110 % PASS, linéaire jusqu'à 3,1 % à 140 % PASS
  let allocFam = 0;
  if (B > 1.1 * P) {
    const ratio = Math.min(1, (B - 1.1 * P) / (0.3 * P));
    allocFam = 0.031 * ratio * B;
  }

  // Formation professionnelle : 0,25 % plafonné au PASS
  const formation = 0.0025 * Math.min(B, P);

  // CSG déductible : 6,8 % (déduite du revenu imposable IR)
  const csgDed = 0.068 * B;

  // CSG non déductible 2,9 % + CRDS 0,5 % = 3,4 % (NON déductibles IR)
  const csgNonDed = 0.034 * B;

  const cotisHorsCsg = retBase + retCompl + invalDeces + maladie + allocFam + formation;

  if (acreActive) {
    // ACRE : réduction ~50 % sur toutes les cotisations hors CSG/CRDS
    const cotisAcre = cotisHorsCsg * 0.5;
    return {
      total: cotisAcre + csgDed + csgNonDed,
      deductible: cotisAcre + csgDed,
      detail: [
        { label: 'Cotisations hors CSG/CRDS (ACRE −50 %)', amount: cotisAcre },
        { label: 'CSG déductible 6,8 %', amount: csgDed },
        { label: 'CSG non-déductible + CRDS 3,4 %', amount: csgNonDed },
      ],
    };
  }

  return {
    total: cotisHorsCsg + csgDed + csgNonDed,
    deductible: cotisHorsCsg + csgDed,
    detail: [
      { label: `Retraite de base 17,75 % (≤ ${Math.round(P / 1000)}k€) + 0,6 %`, amount: retBase },
      { label: 'Retraite complémentaire 7 % (CIPAV)', amount: retCompl },
      { label: 'Invalidité-décès 1,3 %', amount: invalDeces },
      { label: 'Maladie-maternité ~6,5 %', amount: maladie },
      { label: 'Allocations familiales 0–3,1 %', amount: allocFam },
      { label: 'Formation 0,25 %', amount: formation },
      { label: 'CSG déductible 6,8 %', amount: csgDed },
      { label: 'CSG non-déductible + CRDS 3,4 %', amount: csgNonDed },
    ],
  };
}

/** Génère un texte multi-lignes détaillant chaque cotisation TNS */
export function computeTNSDetail(benefice: number, acreActive = false): string {
  const e = (v: number) => Math.round(v).toLocaleString('fr-FR') + ' €';
  const res = computeTNSCotisations(benefice, acreActive);
  const lines: string[] = [`Bénéfice : ${e(benefice)}`];
  res.detail.forEach(d => {
    if (d.amount > 0) lines.push(`▸ ${d.label} = ${e(d.amount)}`);
  });
  lines.push(`Total : ${e(res.total)}`);
  lines.push(`Dont déductibles IR : ${e(res.deductible)} (hors CSG non-déd. ${e(res.total - res.deductible)})`);
  return lines.join('\n');
}

export function computeIRDetail(base: number, parts: number): string {
  const e = (v: number) => Math.round(v).toLocaleString('fr-FR') + ' €';
  const baseNet = base * (1 - RATES_2026.ir.abattement);
  const parPart = baseNet / parts;
  const rows: string[] = [
    `Base foyer : ${e(base)}`,
    `Après abattement 10 % : ${e(baseNet)} (${e(parPart)}/part)`,
  ];
  const tranches = [
    { min: 11294,  max: 28797,   taux: 0.11 },
    { min: 28797,  max: 82341,   taux: 0.30 },
    { min: 82341,  max: 177106,  taux: 0.41 },
    { min: 177106, max: Infinity, taux: 0.45 },
  ];
  let r = 0;
  for (const t of tranches) {
    if (parPart <= t.min) break;
    const taxable = Math.min(parPart, t.max) - t.min;
    const tax = taxable * t.taux;
    r += tax;
    const maxStr = t.max === Infinity ? '∞' : e(t.max);
    rows.push(`▸ ${e(t.min)} – ${maxStr}  ×  ${(t.taux * 100).toFixed(0)} %  =  ${e(tax)}/part`);
  }
  if (r === 0) rows.push('▸ Revenu inférieur au seuil imposable (11 294 €)');
  rows.push(`Total : ${e(r)}/part  ×  ${parts} parts  =  ${e(Math.max(0, r * parts))}`);
  return rows.join('\n');
}

export function computeIR(base: number, parts: number): number {
  const { abattement } = RATES_2026.ir;
  let b = (base * (1 - abattement)) / parts;
  let r = 0;
  if (b > 177106) { r += (b - 177106) * 0.45; b = 177106; }
  if (b > 82341) { r += (b - 82341) * 0.41; b = 82341; }
  if (b > 28797) { r += (b - 28797) * 0.30; b = 28797; }
  if (b > 11294) { r += (b - 11294) * 0.11; }
  return Math.max(0, r * parts);
}

/** Indemnités kilométriques (barème URSSAF) : tranches 0–5k, 5k–20k, >20k km */
export function getIK(km: number, cv: string): number {
  const r = RATES_2026.ik[cv] ?? RATES_2026.ik['6'];
  const mid = 'midConst' in r ? (r as { midConst: number }).midConst : 1457;
  return km <= 5000 ? km * r.a : km <= 20000 ? km * r.b + mid : km * r.c;
}
