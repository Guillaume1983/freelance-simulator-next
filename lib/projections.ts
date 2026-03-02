import {
  CHARGES_CATALOG,
  CFE_PAR_VILLE,
  CitySize,
  SEUIL_TRIMESTRE_RETRAITE,
} from './constants';

export type { CitySize };

/* ── Contexte financier central ── */
export interface FinancialContext {
  /* Production */
  ca: number;

  /* Dépenses professionnelles (annuelles, après TVA si applicable) */
  depensesPro: number;
  indemnitesKm: number;
  loyer: number;
  avantagesOptimises: number;
  cfe: number;

  /* Situation fiscale */
  taxParts: number;
  spouseIncome: number;
  acreActive: boolean;

  /* Paramètres par statut */
  fraisGestionPortage: number;
  typeActiviteMicro: 'BNC' | 'BIC_SERVICE' | 'BIC_COMMERCE';
  prelevementLiberatoire: boolean;
  remunerationDirigeantMensuelle: number; // EURL IS : % du résultat en salaire
  repartitionRemuneration: number; // SASU : 0=100% salaire, 100=100% dividendes
}

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
  growthRate: number;
  annee?: number;
  avantagesOptimises?: number;
  materielAnnuel?: number;
  typeActiviteMicro?: 'BNC' | 'BIC_SERVICE' | 'BIC_COMMERCE';
  prelevementLiberatoire?: boolean;
  remunerationDirigeantMensuelle?: number;
  repartitionRemuneration?: number;
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
  /* Nouveaux champs pour tableau détaillé */
  depensesPro?: number;
  indemnitesKm?: number;
  loyerPercu?: number;
  avantagesOptimises?: number;
  resultatSociete?: number;
  isSociete?: number;
  salaireNet?: number;
  dividendesNets?: number;
  tauxNet?: number;
}

function getIK(km: number, cv: string): number {
  const b: Record<string, { a: number; b: number; c: number }> = {
    '4': { a: 0.529, b: 0.316, c: 0.370 },
    '5': { a: 0.606, b: 0.340, c: 0.407 },
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
  if (b > 82341) { r += (b - 82341) * 0.41; b = 82341; }
  if (b > 28797) { r += (b - 28797) * 0.30; b = 28797; }
  if (b > 11294) { r += (b - 11294) * 0.11; }
  return Math.max(0, r * parts);
}

function retirementQuarters(beforeTax: number, isAssimile: boolean): number {
  const threshold = isAssimile ? SEUIL_TRIMESTRE_RETRAITE : SEUIL_TRIMESTRE_RETRAITE * 1.6;
  return Math.min(4, Math.floor(beforeTax / threshold));
}

function buildFinancialContext(params: ProjectionParams & { annee?: number }): FinancialContext {
  const {
    tjm, days, taxParts, spouseIncome,
    kmAnnuel, cvFiscaux, loyerPercu,
    activeCharges, sectionsActive, portageComm, chargeAmounts,
    acreEnabled, citySize, growthRate,
    annee = 1,
  } = params;

  const ca = tjm * days * Math.pow(1 + growthRate, annee - 1);
  const ik = sectionsActive.vehicule ? getIK(kmAnnuel, cvFiscaux) : 0;
  const loyer = sectionsActive.loyer ? loyerPercu * 12 : 0;
  const cfe = annee === 1 ? 0 : CFE_PAR_VILLE[citySize];
  const avantages = params.avantagesOptimises ?? 1500;

  let depensesPro = 0;
  CHARGES_CATALOG.forEach(c => {
    if (activeCharges.includes(c.id)) {
      depensesPro += (chargeAmounts[c.id] ?? c.amount) * 12;
    }
  });
  const materiel = params.materielAnnuel ?? 0;
  depensesPro += materiel / 3;

  return {
    ca,
    depensesPro,
    indemnitesKm: ik,
    loyer,
    avantagesOptimises: avantages,
    cfe,
    taxParts,
    spouseIncome,
    acreActive: acreEnabled && annee === 1,
    fraisGestionPortage: portageComm,
    typeActiviteMicro: params.typeActiviteMicro ?? 'BNC',
    prelevementLiberatoire: params.prelevementLiberatoire ?? false,
    remunerationDirigeantMensuelle: params.remunerationDirigeantMensuelle ?? 1,
    repartitionRemuneration: params.repartitionRemuneration ?? 70,
  };
}

export function calculateRegimes(
  params: ProjectionParams & { annee?: number }
): RegimeResult[] {
  const ctx = buildFinancialContext(params);
  const chargeFixes = ctx.depensesPro + ctx.indemnitesKm;
  const acreActif = ctx.acreActive;

  const REGIMES = [
    { id: 'Portage', class: 'portage', mental: 0, safety: 'Haut', assimile: true },
    { id: 'Micro', class: 'micro', mental: 1, safety: 'Moyen', assimile: false },
    { id: 'EURL IR', class: 'eurl-ir', mental: 4, safety: 'Pro', assimile: false },
    { id: 'EURL IS', class: 'eurl-is', mental: 4, safety: 'Pro', assimile: false },
    { id: 'SASU', class: 'sasu', mental: 5, safety: 'Dirigeant', assimile: true },
  ];

  return REGIMES.map(r => {
    const res: RegimeResult = {
      ...r, ca: ctx.ca, fees: 0, cotis: 0, ir: 0, beforeTax: 0, net: 0, l: 0,
      retirementQuarters: 0,
      depensesPro: ctx.depensesPro,
      indemnitesKm: ctx.indemnitesKm,
      loyerPercu: ctx.loyer,
      avantagesOptimises: ctx.avantagesOptimises,
    };

    if (r.id === 'Micro') {
      const cotisRate = acreActif ? 0.211 * 0.5 : 0.211;
      res.cotis = ctx.ca * cotisRate;
      res.fees = ctx.cfe;
      res.beforeTax = ctx.ca - res.cotis - ctx.cfe;
      res.ir = ctx.prelevementLiberatoire
        ? ctx.ca * 0.022
        : computeIR(ctx.ca * 0.66 + ctx.spouseIncome, ctx.taxParts);
    } else if (r.id === 'Portage') {
      const comm = ctx.ca * (ctx.fraisGestionPortage / 100);
      res.fees = chargeFixes + comm;
      const base = ctx.ca - res.fees;
      const cotisRate = acreActif ? 0.45 * 0.5 : 0.45;
      res.cotis = base * cotisRate;
      res.beforeTax = base - res.cotis;
      res.l = ctx.loyer;
      res.ir = computeIR(res.beforeTax + ctx.loyer + ctx.spouseIncome, ctx.taxParts);
    } else if (r.id === 'EURL IR') {
      res.fees = chargeFixes + ctx.cfe;
      const base = ctx.ca - res.fees;
      const cotisRate = acreActif ? 0.40 * 0.25 : 0.40;
      res.cotis = base * cotisRate;
      res.beforeTax = base - res.cotis;
      res.l = ctx.loyer;
      res.ir = computeIR(res.beforeTax + ctx.loyer + ctx.spouseIncome, ctx.taxParts);
    } else if (r.id === 'EURL IS') {
      res.fees = chargeFixes + ctx.cfe;
      res.beforeTax = (ctx.ca - res.fees) / 1.45;
      const cotisRate = acreActif ? 0.45 * 0.25 : 0.45;
      res.cotis = res.beforeTax * cotisRate;
      res.l = ctx.loyer;
      res.ir = computeIR(res.beforeTax + ctx.loyer + ctx.spouseIncome, ctx.taxParts);
      res.resultatSociete = ctx.ca - res.fees;
      res.isSociete = Math.max(0, res.resultatSociete - res.beforeTax) * 0.25;
      res.salaireNet = res.beforeTax;
      res.dividendesNets = 0;
    } else {
      res.fees = chargeFixes + ctx.cfe;
      const base = ctx.ca - res.fees;
      const is = base * 0.20;
      res.beforeTax = base - is;
      res.ir = res.beforeTax * 0.30;
      res.l = ctx.loyer;
      res.resultatSociete = base;
      res.isSociete = is;
      res.salaireNet = 0;
      res.dividendesNets = res.beforeTax * 0.70;
    }

    res.net = Math.max(0, res.beforeTax + res.l - res.ir);
    res.retirementQuarters = retirementQuarters(res.beforeTax, r.assimile);
    res.tauxNet = ctx.ca > 0 ? (res.net / ctx.ca) * 100 : 0;
    return res;
  });
}

export function projeterSurNAns(params: ProjectionParams): RegimeResult[][] {
  return [1, 2, 3, 4, 5].map(annee => calculateRegimes({ ...params, annee }));
}

export function computeTaxParts(nbAdultes: number, nbEnfants: number): number {
  let parts = nbAdultes;
  if (nbEnfants >= 1) parts += 0.5;
  if (nbEnfants >= 2) parts += 0.5;
  if (nbEnfants >= 3) parts += 1;
  if (nbEnfants > 3) parts += nbEnfants - 3;
  return parts;
}
