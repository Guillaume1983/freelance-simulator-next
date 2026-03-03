/* ── Tous les taux fiscaux et barèmes 2026 ── */

export const RATES_2026 = {
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
  eurlIr: { cotis: 0.40, acre: 0.25 },
  eurlIs: { cotis: 0.45, acre: 0.25 },
  is: { taux: 0.25 },
  isSasu: { taux: 0.20 },
  flatTaxDividendes: 0.30,
  ik: {
    '4': { a: 0.529, b: 0.316, c: 0.370 },
    '5': { a: 0.606, b: 0.340, c: 0.407 },
    '6': { a: 0.665, b: 0.386, c: 0.455 },
    '7': { a: 0.697, b: 0.415, c: 0.486 },
  } as Record<string, { a: number; b: number; c: number }>,
};

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

export function getIK(km: number, cv: string): number {
  const r = RATES_2026.ik[cv] ?? RATES_2026.ik['6'];
  return km <= 5000 ? km * r.a : km <= 20000 ? km * r.b + 1500 : km * r.c;
}
