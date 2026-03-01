import { CHARGES_CATALOG, CFE_PAR_VILLE, CitySize, SEUIL_TRIMESTRE_RETRAITE } from './constants';

export type { CitySize };

export interface ProjectionParams {
  tjm: number;
  days: number;
  taxParts: number;
  spouseIncome: number;
  kmAnnuel: number;
  cvFiscaux: string;
  loyerPercu: number;
  activeCharges: string[];
  sectionsActive: { vehicule: boolean; loyer: boolean };
  portageComm: number;
  chargeAmounts: Record<string, number>;
  acreEnabled: boolean;
  citySize: CitySize;
  growthRate: number; // 0..1, ex : 0.15
}

export interface RegimeResult {
  id: string;
  class: string;
  ca: number;
  fees: number;
  cotis: number;
  ir: number;
  beforeTax: number;
  net: number;
  l: number;
  mental: number;
  safety: string;
  retirementQuarters: number;
}

function getIK(km: number, cv: string): number {
  const b: Record<string, { a: number; b: number; c: number }> = {
    '6': { a: 0.665, b: 0.386, c: 0.455 },
    '7': { a: 0.697, b: 0.415, c: 0.486 },
  };
  const r = b[cv] ?? b['6'];
  return km <= 5000 ? km * r.a : km <= 20000 ? km * r.b + 1500 : km * r.c;
}

function computeIR(base: number, parts: number): number {
  let b = (base * 0.9) / parts;
  let r = 0;
  if (b > 177106) { r += (b - 177106) * 0.45; b = 177106; }
  if (b > 82341)  { r += (b - 82341)  * 0.41; b = 82341; }
  if (b > 28797)  { r += (b - 28797)  * 0.30; b = 28797; }
  if (b > 11294)  { r += (b - 11294)  * 0.11; }
  return Math.max(0, r * parts);
}

function retirementQuarters(beforeTax: number, isAssimile: boolean): number {
  const threshold = isAssimile ? SEUIL_TRIMESTRE_RETRAITE : SEUIL_TRIMESTRE_RETRAITE * 1.6;
  return Math.min(4, Math.floor(beforeTax / threshold));
}

export function calculateRegimes(
  params: ProjectionParams & { annee?: number }
): RegimeResult[] {
  const {
    tjm, days, taxParts, spouseIncome,
    kmAnnuel, cvFiscaux, loyerPercu,
    activeCharges, sectionsActive, portageComm, chargeAmounts,
    acreEnabled, citySize, growthRate,
    annee = 1,
  } = params;

  const ca = tjm * days * Math.pow(1 + growthRate, annee - 1);
  const ik = sectionsActive.vehicule ? getIK(kmAnnuel, cvFiscaux) : 0;
  const loyerA = sectionsActive.loyer ? loyerPercu * 12 : 0;
  const cfe = annee === 1 ? 0 : CFE_PAR_VILLE[citySize];
  const acreActif = acreEnabled && annee === 1;

  let chargesFixes = 0;
  CHARGES_CATALOG.forEach(c => {
    if (activeCharges.includes(c.id)) {
      chargesFixes += (chargeAmounts[c.id] ?? c.amount) * 12;
    }
  });

  const REGIMES = [
    { id: 'Portage',  class: 'portage',  mental: 0, safety: 'Haut',     assimile: true  },
    { id: 'Micro',    class: 'micro',    mental: 1, safety: 'Moyen',    assimile: false },
    { id: 'EURL IR',  class: 'eurl-ir',  mental: 4, safety: 'Pro',      assimile: false },
    { id: 'EURL IS',  class: 'eurl-is',  mental: 4, safety: 'Pro',      assimile: false },
    { id: 'SASU',     class: 'sasu',     mental: 5, safety: 'Dirigeant', assimile: true  },
  ];

  return REGIMES.map(r => {
    const res: RegimeResult = {
      ...r, ca, fees: 0, cotis: 0, ir: 0, beforeTax: 0, net: 0, l: 0,
      retirementQuarters: 0,
    };

    if (r.id === 'Micro') {
      const cotisRate = acreActif ? 0.211 * 0.5 : 0.211;
      res.cotis = ca * cotisRate;
      res.fees = cfe;
      res.beforeTax = ca - res.cotis - cfe;
      res.ir = computeIR(ca * 0.66 + spouseIncome, taxParts);

    } else if (r.id === 'Portage') {
      const comm = ca * (portageComm / 100);
      res.fees = chargesFixes + ik;
      const base = ca - comm - res.fees;
      const cotisRate = acreActif ? 0.45 * 0.5 : 0.45;
      res.cotis = base * cotisRate;
      res.beforeTax = base - res.cotis;
      res.l = loyerA;
      res.ir = computeIR(res.beforeTax + loyerA + spouseIncome, taxParts);

    } else if (r.id === 'EURL IR') {
      res.fees = chargesFixes + ik + cfe;
      const base = ca - res.fees;
      const cotisRate = acreActif ? 0.40 * 0.25 : 0.40;
      res.cotis = base * cotisRate;
      res.beforeTax = base - res.cotis;
      res.l = loyerA;
      res.ir = computeIR(res.beforeTax + loyerA + spouseIncome, taxParts);

    } else if (r.id === 'EURL IS') {
      res.fees = chargesFixes + ik + cfe;
      res.beforeTax = (ca - res.fees) / 1.45;
      const cotisRate = acreActif ? 0.45 * 0.25 : 0.45;
      res.cotis = res.beforeTax * cotisRate;
      res.l = loyerA;
      res.ir = computeIR(res.beforeTax + loyerA + spouseIncome, taxParts);

    } else {
      // SASU — ACRE non applicable (dirigeant assimilé salarié)
      res.fees = chargesFixes + ik + cfe;
      const base = ca - res.fees;
      const is = base * 0.20;
      res.beforeTax = base - is;
      res.ir = res.beforeTax * 0.30;
      res.l = loyerA;
    }

    res.net = Math.max(0, res.beforeTax + res.l - res.ir);
    res.retirementQuarters = retirementQuarters(res.beforeTax, r.assimile);
    return res;
  });
}

export function projeterSurNAns(params: ProjectionParams): RegimeResult[][] {
  return [1, 2, 3].map(annee => calculateRegimes({ ...params, annee }));
}

export function computeTaxParts(nbAdultes: number, nbEnfants: number): number {
  let parts = nbAdultes;
  if (nbEnfants >= 1) parts += 0.5;
  if (nbEnfants >= 2) parts += 0.5;
  if (nbEnfants >= 3) parts += 1;
  if (nbEnfants > 3)  parts += (nbEnfants - 3);
  return parts;
}
