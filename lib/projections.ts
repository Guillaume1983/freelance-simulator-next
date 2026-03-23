import {
  CitySize,
  SEUIL_TRIMESTRE_RETRAITE,
} from './constants';
import { runPipeline, buildContextFromInput } from './financial/pipeline';
import { RATES_2026 } from './financial/rates';

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
  remunerationDirigeantMensuelle: number; // EURL IS : part du résultat affectée au salaire (0–1)
  repartitionRemuneration: number; // SASU : % du résultat après IS distribué en dividendes (0–100)
}

export interface ProjectionParams {
  tjm: number;
  days: number;
  taxParts: number;
  spouseIncome: number;
  kmAnnuel: number;
  cvFiscaux: string;
  typeVehicule?: 'voiture' | 'moto' | 'cyclo50';
  vehiculeElectrique?: boolean;
  loyerPercu: number;
  activeCharges: string[];
  sectionsActive: { vehicule: boolean };
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
  /** Dépenses pro retenues en portage (sous-ensemble de depensesPro) */
  depensesProPortage?: number;
  indemnitesKm?: number;
  loyerPercu?: number;
  avantagesOptimises?: number;
  resultatSociete?: number;
  isSociete?: number;
  salaireNet?: number;
  dividendesNets?: number;
  tauxNet?: number;
  /** Trésorerie qui reste en société après IS et distributions (EURL IS / SASU) */
  cashInCompany?: number;
  /** Lignes financières pour traçabilité (Phase 3) */
  lines?: import('./financial/types').FinancialLine[];
}

function retirementQuarters(beforeTax: number, isAssimile: boolean): number {
  const threshold = isAssimile ? SEUIL_TRIMESTRE_RETRAITE : SEUIL_TRIMESTRE_RETRAITE * 1.6;
  return Math.min(4, Math.floor(beforeTax / threshold));
}

function toPipelineInput(params: ProjectionParams & { annee?: number }) {
  return {
    tjm: params.tjm,
    days: params.days,
    growthRate: params.growthRate,
    annee: params.annee ?? 1,
    activeCharges: params.activeCharges,
    chargeAmounts: params.chargeAmounts,
    materielAnnuel: params.materielAnnuel ?? 0,
    materielActive: (params.materielAnnuel ?? 0) > 0,
    kmAnnuel: params.kmAnnuel,
    cvFiscaux: params.cvFiscaux,
    typeVehicule: params.typeVehicule ?? 'voiture',
    vehiculeElectrique: params.vehiculeElectrique ?? false,
    vehiculeActive: params.sectionsActive.vehicule,
    loyerPercu: params.loyerPercu,
    // La présence du loyer dépend uniquement de la valeur saisie.
    // `sectionsActive` ne sert qu'à activer/désactiver le véhicule.
    loyerActive: params.loyerPercu > 0,
    avantagesOptimises: params.avantagesOptimises ?? 1500,
    taxParts: params.taxParts,
    spouseIncome: params.spouseIncome,
    acreEnabled: params.acreEnabled,
    citySize: params.citySize,
    portageComm: params.portageComm,
    typeActiviteMicro: params.typeActiviteMicro ?? 'BNC',
    prelevementLiberatoire: params.prelevementLiberatoire ?? false,
    remunerationDirigeantMensuelle: params.remunerationDirigeantMensuelle ?? 1,
    repartitionRemuneration: params.repartitionRemuneration ?? 100,
  };
}

export function calculateRegimes(
  params: ProjectionParams & { annee?: number }
): RegimeResult[] {
  const pipelineInput = toPipelineInput(params);
  const ctx = buildContextFromInput(pipelineInput);

  const REGIMES = [
    { id: 'Portage', class: 'portage', mental: 0, safety: 'Haut', assimile: true },
    { id: 'Micro', class: 'micro', mental: 1, safety: 'Moyen', assimile: false },
    { id: 'EURL IR', class: 'eurl-ir', mental: 4, safety: 'Pro', assimile: false },
    { id: 'EURL IS', class: 'eurl-is', mental: 4, safety: 'Pro', assimile: false },
    { id: 'SASU', class: 'sasu', mental: 5, safety: 'Dirigeant', assimile: true },
  ];

  const pipelineResults = runPipeline(pipelineInput);

  return pipelineResults.map((pr, i) => {
    const r = REGIMES[i];
    const lines = pr.lines;

    const getAmt = (id: string) => lines.find(l => l.id === id)?.amount ?? 0;

    const cotis = getAmt('portage_cotis') || getAmt('micro_cotis') || getAmt('eurl_ir_cotis') || getAmt('eurl_is_cotis');
    const beforeTax = getAmt('portage_remuneration') || getAmt('micro_remuneration') || getAmt('eurl_ir_remuneration') || getAmt('eurl_is_remuneration') || (getAmt('sasu_dividendes') ? getAmt('sasu_dividendes') / 0.70 : 0);
    const ir = getAmt('portage_ir') || getAmt('micro_ir') || getAmt('eurl_ir_ir') || getAmt('eurl_is_ir') || getAmt('sasu_ir');

    // "Charges" = dépenses pro + coût des optimisations utilisées comme charges
    // (IK, loyer, avantages exonérés). On laisse la micro à 0 car les charges réelles ne sont pas déductibles.
    let fees = 0;
    if (r.id === 'Micro') {
      fees = 0;
    } else if (r.id === 'Portage') {
      fees = ctx.depensesProPortage + ctx.indemnitesKm + ctx.avantagesOptimises;
    } else {
      fees = ctx.depensesPro + ctx.indemnitesKm + ctx.loyer + ctx.avantagesOptimises;
    }

    const res: RegimeResult = {
      ...r,
      ca: ctx.ca,
      fees,
      cotis,
      ir,
      beforeTax,
      net: pr.net,
      l: ctx.loyer,
      retirementQuarters: retirementQuarters(beforeTax, r.assimile),
      depensesPro: ctx.depensesPro,
      depensesProPortage: r.id === 'Portage' ? ctx.depensesProPortage : undefined,
      indemnitesKm: ctx.indemnitesKm,
      loyerPercu: ctx.loyer,
      avantagesOptimises: ctx.avantagesOptimises,
      tauxNet: ctx.ca > 0 ? (pr.net / ctx.ca) * 100 : 0,
      lines: pr.lines,
    };

    if (r.id === 'EURL IS') {
      const resultatSociete = ctx.ca - (ctx.depensesPro + ctx.indemnitesKm + ctx.loyer + ctx.avantagesOptimises + ctx.cfe);
      const isSociete = getAmt('eurl_is_is');
      const salaireNet = getAmt('eurl_is_remuneration');
      const cotisSoc = getAmt('eurl_is_cotis');
      const enveloppeSalaire = salaireNet + cotisSoc;
      // Même formule que eurl-is.ts : baseIS puis trésorerie après IS, pour éviter des 0 dus aux arrondis en mise à jour rapide (ex. clic maintenu sur TJM)
      const baseIS = Math.max(0, resultatSociete - enveloppeSalaire);
      const resteEnSociete = baseIS * (1 - RATES_2026.is.taux);

      res.resultatSociete = resultatSociete;
      res.isSociete = isSociete;
      res.salaireNet = salaireNet;
      res.dividendesNets = 0;
      res.cashInCompany = Math.round(resteEnSociete);
    } else if (r.id === 'SASU') {
      const resultatSociete = ctx.ca - (ctx.depensesPro + ctx.indemnitesKm + ctx.loyer + ctx.avantagesOptimises + ctx.cfe);
      const isSociete = getAmt('sasu_is');
      const apresIS = resultatSociete - isSociete;
      const dividendesNets = getAmt('sasu_dividendes');
      const dividendesBruts = dividendesNets > 0 ? dividendesNets / 0.70 : 0; // PFU 30 %
      const resteEnSociete = Math.max(0, apresIS - dividendesBruts);

      res.resultatSociete = resultatSociete;
      res.isSociete = isSociete;
      res.salaireNet = 0;
      res.dividendesNets = dividendesNets;
      res.cashInCompany = Math.round(resteEnSociete);
    }

    return res;
  });
}

export function projeterSurNAns(params: ProjectionParams, growthRates?: number[]): RegimeResult[][] {
  return [1, 2, 3, 4, 5].map((annee, index) => {
    const growth = growthRates && growthRates[index] != null ? growthRates[index]! : params.growthRate;
    return calculateRegimes({ ...params, growthRate: growth, annee });
  });
}

export function computeTaxParts(nbAdultes: number, nbEnfants: number): number {
  let parts = nbAdultes;
  if (nbEnfants >= 1) parts += 0.5;
  if (nbEnfants >= 2) parts += 0.5;
  if (nbEnfants >= 3) parts += 1;
  if (nbEnfants > 3) parts += nbEnfants - 3;
  return parts;
}
