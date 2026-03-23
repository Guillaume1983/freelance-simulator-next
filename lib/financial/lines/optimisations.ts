import type { FinancialLine } from '../types';
import { getIK, type TypeVehiculeIK } from '../rates';

const IK_LABEL: Record<TypeVehiculeIK, string> = {
  voiture: 'cv',
  moto: 'moto',
  cyclo50: 'cyclo 50 cm³',
};

export function buildOptimisationsLines(
  kmAnnuel: number,
  cvFiscaux: string,
  typeVehicule: TypeVehiculeIK,
  vehiculeElectrique: boolean,
  vehiculeActive: boolean,
  loyerPercu: number,
  loyerActive: boolean,
  avantagesOptimises: number
): FinancialLine[] {
  const lines: FinancialLine[] = [];

  if (vehiculeActive && kmAnnuel > 0) {
    const ik = getIK(kmAnnuel, typeVehicule, cvFiscaux, vehiculeElectrique);
    const detail = typeVehicule === 'voiture' ? `${cvFiscaux} cv` : typeVehicule === 'moto' ? cvFiscaux : '';
    const electriqueSuffix = vehiculeElectrique ? ' (électrique +20 %)' : '';
    lines.push({
      id: 'indemnites_km',
      label: 'Indemnités kilométriques',
      category: 'optimisation',
      amount: ik,
      // Remboursement de frais : déductible pour la société, perçu en net pour le dirigeant.
      cashImpact: ik,
      fiscalImpact: -ik,
      socialImpact: 0,
      // En portage, les IK sont un élément de frais intégré au mécanisme (et donc un poste
      // à afficher dans "optimisations" pour la transparence UX).
      applicableStatuses: ['Portage', 'EURL IR', 'EURL IS', 'SASU'],
      formula: `${kmAnnuel} km × barème ${IK_LABEL[typeVehicule]}${detail ? ` ${detail}` : ''}${electriqueSuffix}`,
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

  // Avantages exonérés (titres-resto, CE, mutuelle…) : employeur → salarié ou société → dirigeant.
  // Ne s'applique pas à la micro-entreprise (pas d'employeur, pas de dispositif équivalent).
  if (avantagesOptimises > 0) {
    lines.push({
      id: 'avantages',
      label: 'Avantages exonérés',
      category: 'optimisation',
      amount: avantagesOptimises,
      cashImpact: avantagesOptimises,
      // Coût pour l'entreprise, avantage net pour l'individu
      fiscalImpact: -avantagesOptimises,
      socialImpact: 0,
      applicableStatuses: ['Portage', 'EURL IR', 'EURL IS', 'SASU'],
    });
  }

  return lines;
}
