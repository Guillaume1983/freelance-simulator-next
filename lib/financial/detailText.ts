import type { FinancialLine } from './types';

interface RegimeWithLines {
  id: string;
  ca: number;
  fees: number;
  cotis: number;
  beforeTax: number;
  ir: number;
  l?: number;
  lines?: FinancialLine[];
}

export function getDetailTextFromLines(
  r: RegimeWithLines,
  rowKey: string,
  sim: { state: { tjm: number; days: number; taxParts: number; portageComm: number } }
): string {
  const fmt = (v: number) => Math.round(v).toLocaleString() + ' €';
  const lines = r.lines ?? [];

  const getLine = (id: string) => lines.find((l: FinancialLine) => l.id === id);
  const getFormula = (id: string) => getLine(id)?.formula;

  switch (rowKey) {
    case 'ca':
      return getFormula('ca_annuel') ?? `${sim.state.tjm} € × ${sim.state.days} jours`;
    case 'fees':
      return 'Somme des dépenses professionnelles cochées';
    case 'portageCommission': {
      if (r.id !== 'Portage') return 'Non applicable';
      const line = getLine('portage_commission');
      return line?.formula ?? `CA × ${sim.state.portageComm}%`;
    }
    case 'cotis': {
      const line = getLine('portage_cotis') ?? getLine('micro_cotis') ?? getLine('eurl_ir_cotis') ?? getLine('eurl_is_cotis');
      return line?.formula ?? (r.id === 'Micro' ? `${fmt(r.ca)} × 21,1%` : r.id === 'Portage' ? 'Base nette × 45%' : r.id === 'EURL IR' ? '(CA − Charges) × 40%' : r.id === 'EURL IS' ? 'Rémunération × 45%' : 'IS 20% (inclus)');
    }
    case 'beforeTax': {
      const line = getLine('portage_remuneration') ?? getLine('micro_remuneration') ?? getLine('eurl_ir_remuneration') ?? getLine('eurl_is_remuneration') ?? getLine('sasu_dividendes');
      if (line?.formula) return line.formula;
      if (r.id === 'EURL IS') return `(${fmt(r.ca)} − ${fmt(r.fees)}) ÷ 1,45`;
      if (r.id === 'SASU') return `(${fmt(r.ca)} − ${fmt(r.fees)}) × 80% (IS 20%)`;
      return `${fmt(r.ca)} − ${fmt(r.fees)} − ${fmt(r.cotis)}`;
    }
    case 'ir': {
      const line = getLine('portage_ir') ?? getLine('micro_ir') ?? getLine('eurl_ir_ir') ?? getLine('eurl_is_ir') ?? getLine('sasu_ir');
      if (line?.formula) return line.formula;
      if (r.id === 'Micro') return 'Barème IR (base = CA × 66%)';
      if (r.id === 'SASU') return 'Rémunération × 30% (PFU)';
      return `Barème progressif IR — ${sim.state.taxParts} parts`;
    }
    case 'net': {
      const netLine = getLine('net_final');
      if (netLine?.sourceLines?.length) {
        const parts: string[] = [];
        if (r.l && r.l > 0) parts.push(`+ Loyer ${fmt(r.l)}`);
        return `${fmt(r.beforeTax)} − ${fmt(r.ir)}${parts.join(' ')}`;
      }
      return r.l && r.l > 0
        ? `${fmt(r.beforeTax)} − ${fmt(r.ir)} + Loyer ${fmt(r.l)}`
        : `${fmt(r.beforeTax)} − ${fmt(r.ir)}`;
    }
    default:
      return '';
  }
}
