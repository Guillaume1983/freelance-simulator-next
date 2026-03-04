import type { FinancialLine } from '../types';
import { getIK } from '../rates';

export function buildOptimisationsLines(
  kmAnnuel: number,
  cvFiscaux: string,
  vehiculeActive: boolean,
  loyerPercu: number,
  loyerActive: boolean,
  avantagesOptimises: number
): FinancialLine[] {
  const lines: FinancialLine[] = [];

  if (vehiculeActive && kmAnnuel > 0) {
    const ik = getIK(kmAnnuel, cvFiscaux);
    lines.push({
      id: 'indemnites_km',
      label: 'Indemnités kilométriques',
      category: 'optimisation',
      amount: ik,
      // Remboursement de frais : déductible pour la société, perçu en net pour le dirigeant.
      cashImpact: ik,
      fiscalImpact: -ik,
      socialImpact: 0,
      applicableStatuses: ['EURL IR', 'EURL IS', 'SASU'],
      formula: `${kmAnnuel} km × barème ${cvFiscaux} cv`,
    });
  }

  if (loyerActive && loyerPercu > 0) {
    const loyerAnnuel = loyerPercu * 12;
    lines.push({
      id: 'loyer_percu',
      label: 'Loyer perçu (location bureau)',
      category: 'optimisation',
      amount: loyerAnnuel,
      cashImpact: loyerAnnuel,
      fiscalImpact: loyerAnnuel,
      socialImpact: 0,
      applicableStatuses: ['EURL IR', 'EURL IS', 'SASU'],
      formula: `${loyerPercu} € × 12 mois`,
    });
  }

  if (avantagesOptimises > 0) {
    lines.push({
      id: 'avantages',
      label: 'Avantages exonérés',
      category: 'optimisation',
      amount: avantagesOptimises,
      cashImpact: avantagesOptimises,
      fiscalImpact: 0,
      socialImpact: 0,
      applicableStatuses: [],
    });
  }

  return lines;
}
