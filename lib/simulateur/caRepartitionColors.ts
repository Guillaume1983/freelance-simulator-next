/**
 * Répartition du CA — couleurs alignées sur les sections du panneau paramètres (SimulationSettingsSidebar) :
 * Charges → rose, Cotisations → ambre/orange, Impôts → indigo (foyer), Net → émeraude (activité).
 * Commission portage → cyan. IS société → rose (distinct des charges). Trésorerie société → violet.
 */
export const CA_REPARTITION_SEGMENTS = [
  { key: 'fees' as const, fill: '#f43f5e', ink: '#be123c', label: 'Charges' },
  { key: 'cotis' as const, fill: '#f59e0b', ink: '#b45309', label: 'Cotisations' },
  { key: 'ir' as const, fill: '#6366f1', ink: '#4338ca', label: 'Impôts' },
  { key: 'net' as const, fill: '#10b981', ink: '#047857', label: 'Net' },
] as const;

/** Commission portage — cyan */
export const PORTAGE_COMMISSION = {
  fill: '#06b6d4',
  ink: '#0e7490',
  label: 'Commission portage',
} as const;

/** Impôt sur les sociétés (SASU, EURL IS) — rose pour se distinguer des charges (rose vif) */
export const COMPANY_IS = {
  key: 'companyIs' as const,
  fill: '#f472b6',
  ink: '#be185d',
  label: 'IS (société)',
} as const;

/** Trésorerie laissée en société après IS et distributions */
export const TREASURY_COMPANY = {
  key: 'treasury' as const,
  fill: '#a78bfa',
  ink: '#5b21b6',
  label: 'Trésorerie société',
} as const;

/** Lexique complet des couleurs d’histogramme (ordre lecture : commission → … → trésorerie) */
export const CA_REPARTITION_HISTOGRAM_LEXICON = [
  {
    key: 'portageCommission' as const,
    fill: PORTAGE_COMMISSION.fill,
    ink: PORTAGE_COMMISSION.ink,
    label: PORTAGE_COMMISSION.label,
  },
  CA_REPARTITION_SEGMENTS[0],
  {
    key: COMPANY_IS.key,
    fill: COMPANY_IS.fill,
    ink: COMPANY_IS.ink,
    label: COMPANY_IS.label,
  },
  CA_REPARTITION_SEGMENTS[1],
  CA_REPARTITION_SEGMENTS[2],
  CA_REPARTITION_SEGMENTS[3],
  {
    key: TREASURY_COMPANY.key,
    fill: TREASURY_COMPANY.fill,
    ink: TREASURY_COMPANY.ink,
    label: TREASURY_COMPANY.label,
  },
] as const;

export type CaRepartitionSegment = {
  key: string;
  fill: string;
  ink: string;
  label: string;
  pct: number;
};

type LineLike = { id?: string; amount?: number };

function lineAmount(lines: LineLike[] | undefined, ids: string[]): number {
  if (!lines?.length) return 0;
  for (const id of ids) {
    const v = lines.find((l) => l.id === id)?.amount;
    if (typeof v === 'number' && v > 0) return v;
  }
  return 0;
}

/**
 * Segments histogramme (ordre) : commission portage → charges (dont CFE) → IS société → cotisations → impôts → net → trésorerie société.
 * Sans `lines` / trésorerie, se comporte comme avant (4 segments + commission portage).
 */
export function buildCaRepartitionSegments(
  ca: number,
  data: { fees: number; cotis: number; ir: number; net: number },
  opts?: {
    regimeId?: string;
    portageCommission?: number;
    lines?: LineLike[];
    cashInCompany?: number;
  },
): CaRepartitionSegment[] {
  const total = Math.max(ca, 1);
  const regimeId = opts?.regimeId ?? '';
  const lines = opts?.lines;

  const cfe = lineAmount(lines, ['sasu_cfe', 'eurl_ir_cfe', 'eurl_is_cfe', 'micro_cfe']);
  const feesInclCfe = data.fees + cfe;
  const companyIsAmt = lineAmount(lines, ['sasu_is', 'eurl_is_is']);
  const treasuryAmt = Math.max(0, opts?.cashInCompany ?? 0);

  const pc = opts?.portageCommission ?? 0;
  const showComm = regimeId === 'Portage' && pc > 0;

  const out: CaRepartitionSegment[] = [];

  if (showComm) {
    out.push({
      key: 'portageCommission',
      fill: PORTAGE_COMMISSION.fill,
      ink: PORTAGE_COMMISSION.ink,
      label: PORTAGE_COMMISSION.label,
      pct: (pc / total) * 100,
    });
  }

  out.push({
    key: 'fees',
    fill: CA_REPARTITION_SEGMENTS[0].fill,
    ink: CA_REPARTITION_SEGMENTS[0].ink,
    label: CA_REPARTITION_SEGMENTS[0].label,
    pct: (feesInclCfe / total) * 100,
  });

  if (companyIsAmt > 0) {
    out.push({
      key: COMPANY_IS.key,
      fill: COMPANY_IS.fill,
      ink: COMPANY_IS.ink,
      label: COMPANY_IS.label,
      pct: (companyIsAmt / total) * 100,
    });
  }

  out.push(
    {
      key: 'cotis',
      fill: CA_REPARTITION_SEGMENTS[1].fill,
      ink: CA_REPARTITION_SEGMENTS[1].ink,
      label: CA_REPARTITION_SEGMENTS[1].label,
      pct: (data.cotis / total) * 100,
    },
    {
      key: 'ir',
      fill: CA_REPARTITION_SEGMENTS[2].fill,
      ink: CA_REPARTITION_SEGMENTS[2].ink,
      label: CA_REPARTITION_SEGMENTS[2].label,
      pct: (data.ir / total) * 100,
    },
    {
      key: 'net',
      fill: CA_REPARTITION_SEGMENTS[3].fill,
      ink: CA_REPARTITION_SEGMENTS[3].ink,
      label: CA_REPARTITION_SEGMENTS[3].label,
      pct: (data.net / total) * 100,
    },
  );

  if (treasuryAmt > 0) {
    out.push({
      key: TREASURY_COMPANY.key,
      fill: TREASURY_COMPANY.fill,
      ink: TREASURY_COMPANY.ink,
      label: TREASURY_COMPANY.label,
      pct: (treasuryAmt / total) * 100,
    });
  }

  return out;
}

export const CA_REPARTITION_INK = {
  fees: CA_REPARTITION_SEGMENTS[0].ink,
  cotis: CA_REPARTITION_SEGMENTS[1].ink,
  ir: CA_REPARTITION_SEGMENTS[2].ink,
  net: CA_REPARTITION_SEGMENTS[3].ink,
} as const;

/** @deprecated — alias vers CA_REPARTITION_INK */
export const CA_REPARTITION_HEX = CA_REPARTITION_INK;

export function tooltipColorForRowKey(key: string): string | undefined {
  switch (key) {
    case 'fees':
      return CA_REPARTITION_INK.fees;
    case 'cotis':
      return CA_REPARTITION_INK.cotis;
    case 'ir':
      return CA_REPARTITION_INK.ir;
    case 'net':
      return CA_REPARTITION_INK.net;
    case 'portageCommission':
      return PORTAGE_COMMISSION.ink;
    case 'companyIs':
    case 'sasu_is':
    case 'eurl_is_is':
      return COMPANY_IS.ink;
    case 'treasury':
    case 'cashInCompany':
      return TREASURY_COMPANY.ink;
    default:
      return undefined;
  }
}
