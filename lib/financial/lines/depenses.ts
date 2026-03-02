import type { FinancialLine } from '../types';
import { CHARGES_CATALOG } from '@/lib/constants';

export function buildDepensesLines(
  activeCharges: string[],
  chargeAmounts: Record<string, number>,
  materielAnnuel: number,
  materielActive: boolean
): FinancialLine[] {
  const lines: FinancialLine[] = [];

  CHARGES_CATALOG.forEach(c => {
    if (!activeCharges.includes(c.id)) return;
    const montant = (chargeAmounts[c.id] ?? c.amount) * 12;
    lines.push({
      id: `depense_${c.id}`,
      label: c.name,
      category: 'depense',
      amount: montant,
      cashImpact: 0,
      fiscalImpact: -montant,
      socialImpact: 0,
      applicableStatuses: ['EURL IR', 'EURL IS', 'SASU'],
      formula: `${(montant / 12).toFixed(0)} € × 12 mois`,
    });
  });

  if (materielActive && materielAnnuel > 0) {
    const amorti = materielAnnuel / 3;
    lines.push({
      id: 'depense_materiel',
      label: 'Matériel (amorti 3 ans)',
      category: 'depense',
      amount: amorti,
      cashImpact: 0,
      fiscalImpact: -amorti,
      socialImpact: 0,
      applicableStatuses: ['EURL IR', 'EURL IS', 'SASU'],
      formula: `${materielAnnuel} € / 3 ans`,
    });
  }

  return lines;
}
