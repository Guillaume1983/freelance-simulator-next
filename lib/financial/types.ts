/* ── Modèle central : FinancialLine ── */

export type StatusId = 'Portage' | 'Micro' | 'EURL IR' | 'EURL IS' | 'SASU';

export type LineCategory =
  | 'production'
  | 'depense'
  | 'optimisation'
  | 'statut'
  | 'fiscalite'
  | 'synthese';

export interface FinancialLine {
  id: string;
  label: string;
  category: LineCategory;
  amount: number;
  cashImpact: number;
  fiscalImpact: number;
  socialImpact: number;
  applicableStatuses: StatusId[];
  sourceLines?: string[];
  formula?: string;
}

export const ALL_STATUSES: StatusId[] = ['Portage', 'Micro', 'EURL IR', 'EURL IS', 'SASU'];

export function appliesTo(line: FinancialLine, statusId: StatusId): boolean {
  if (line.applicableStatuses.length === 0) return true;
  return line.applicableStatuses.includes(statusId);
}

export function sumCashImpact(lines: FinancialLine[], statusId: StatusId): number {
  return lines
    .filter(l => appliesTo(l, statusId))
    .reduce((s, l) => s + l.cashImpact, 0);
}

export function sumFiscalImpact(lines: FinancialLine[], statusId: StatusId): number {
  return lines
    .filter(l => appliesTo(l, statusId))
    .reduce((s, l) => s + l.fiscalImpact, 0);
}
