import type { StatusId } from './types';
import { ALL_STATUSES, sumCashImpact, appliesTo } from './types';
import type { FinancialLine } from './types';
import { getIK } from './rates';
import { buildProductionLines } from './lines/production';
import { buildDepensesLines } from './lines/depenses';
import { buildOptimisationsLines } from './lines/optimisations';
import { buildPortageLines } from './lines/statuts/portage';
import { buildMicroLines } from './lines/statuts/micro';
import { buildEurlIrLines } from './lines/statuts/eurl-ir';
import { buildEurlIsLines } from './lines/statuts/eurl-is';
import { buildSasuLines } from './lines/statuts/sasu';
import { CFE_PAR_VILLE, CHARGES_CATALOG, type CitySize } from '@/lib/constants';

export interface PipelineInput {
  tjm: number;
  days: number;
  growthRate: number;
  annee?: number;
  activeCharges: string[];
  chargeAmounts: Record<string, number>;
  materielAnnuel: number;
  materielActive: boolean;
  kmAnnuel: number;
  cvFiscaux: string;
  vehiculeActive: boolean;
  loyerPercu: number;
  loyerActive: boolean;
  avantagesOptimises: number;
  taxParts: number;
  spouseIncome: number;
  acreEnabled: boolean;
  citySize: CitySize;
  portageComm: number;
  typeActiviteMicro: 'BNC' | 'BIC_SERVICE' | 'BIC_COMMERCE';
  prelevementLiberatoire: boolean;
  remunerationDirigeantMensuelle: number;
  repartitionRemuneration: number;
}

export interface PipelineResult {
  statusId: StatusId;
  lines: FinancialLine[];
  net: number;
}

export function buildContextFromInput(input: PipelineInput): {
  ca: number;
  depensesPro: number;
  depensesProPortage: number;
  indemnitesKm: number;
  loyer: number;
  cfe: number;
  avantagesOptimises: number;
  taxParts: number;
  spouseIncome: number;
  acreActive: boolean;
  fraisGestionPortage: number;
  prelevementLiberatoire: boolean;
  typeActiviteMicro: 'BNC' | 'BIC_SERVICE' | 'BIC_COMMERCE';
  remunerationDirigeantMensuelle: number;
  repartitionRemuneration: number;
} {
  return buildStatutContext(input);
}

function buildStatutContext(input: PipelineInput): {
  ca: number;
  depensesPro: number;
  depensesProPortage: number;
  indemnitesKm: number;
  loyer: number;
  cfe: number;
  avantagesOptimises: number;
  taxParts: number;
  spouseIncome: number;
  acreActive: boolean;
  fraisGestionPortage: number;
  prelevementLiberatoire: boolean;
  typeActiviteMicro: 'BNC' | 'BIC_SERVICE' | 'BIC_COMMERCE';
  remunerationDirigeantMensuelle: number;
  repartitionRemuneration: number;
} {
  const annee = input.annee ?? 1;
  const ca = input.tjm * input.days * Math.pow(1 + input.growthRate, annee - 1);
  const indemnitesKm = input.vehiculeActive ? getIK(input.kmAnnuel, input.cvFiscaux) : 0;
  const loyer = input.loyerActive ? input.loyerPercu * 12 : 0;
  const cfe = annee === 1 ? 0 : CFE_PAR_VILLE[input.citySize];

  let depensesPro = 0;
  let depensesProPortage = 0;
  CHARGES_CATALOG.forEach(c => {
    if (input.activeCharges.includes(c.id)) {
      const amount = (input.chargeAmounts[c.id] ?? c.amount) * 12;
      depensesPro += amount;
      if (!c.portageWarning) depensesProPortage += amount;
    }
  });
  if (input.materielActive && input.materielAnnuel > 0) {
    const mat = input.materielAnnuel / 3;
    depensesPro += mat;
    depensesProPortage += mat; // matériel spécifique à la mission : accepté en portage
  }

  return {
    ca,
    depensesPro,
    depensesProPortage,
    indemnitesKm,
    loyer,
    cfe,
    avantagesOptimises: input.avantagesOptimises,
    taxParts: input.taxParts,
    spouseIncome: input.spouseIncome,
    acreActive: input.acreEnabled && annee === 1,
    fraisGestionPortage: input.portageComm,
    prelevementLiberatoire: input.prelevementLiberatoire,
    typeActiviteMicro: input.typeActiviteMicro,
    remunerationDirigeantMensuelle: input.remunerationDirigeantMensuelle,
    repartitionRemuneration: input.repartitionRemuneration,
  };
}

export function runPipeline(input: PipelineInput): PipelineResult[] {
  const annee = input.annee ?? 1;
  const ctx = buildStatutContext(input);

  const productionLines = buildProductionLines(
    ctx.ca,
    input.tjm,
    input.days,
    input.growthRate,
    annee
  );
  const depensesLines = buildDepensesLines(
    input.activeCharges,
    input.chargeAmounts,
    input.materielAnnuel,
    input.materielActive
  );
  const optimisationsLines = buildOptimisationsLines(
    input.kmAnnuel,
    input.cvFiscaux,
    input.vehiculeActive,
    input.loyerPercu,
    input.loyerActive,
    input.avantagesOptimises
  );

  const statutBuilders: Record<StatusId, () => FinancialLine[]> = {
    Portage: () => buildPortageLines({ ...ctx, fraisGestionPortage: input.portageComm, depensesPro: ctx.depensesProPortage }),
    Micro: () => buildMicroLines({ ...ctx, typeActiviteMicro: input.typeActiviteMicro }),
    'EURL IR': () => buildEurlIrLines(ctx),
    'EURL IS': () => buildEurlIsLines(ctx),
    SASU: () => buildSasuLines(ctx),
  };

  return ALL_STATUSES.map(statusId => {
    const statutLines = statutBuilders[statusId]();
    const allLines: FinancialLine[] = [
      ...productionLines,
      ...depensesLines,
      ...optimisationsLines,
      ...statutLines,
    ].filter(l => appliesTo(l, statusId));

    const net = Math.max(0, sumCashImpact(allLines, statusId));

    const netLine: FinancialLine = {
      id: 'net_final',
      label: 'Net disponible',
      category: 'synthese',
      amount: net,
      cashImpact: net,
      fiscalImpact: 0,
      socialImpact: 0,
      applicableStatuses: [statusId],
      sourceLines: allLines.filter(l => l.cashImpact !== 0).map(l => l.id),
      formula: 'Σ cashImpact',
    };

    return {
      statusId,
      lines: [...allLines, netLine],
      net,
    };
  });
}
