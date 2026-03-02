/* ── Dépenses professionnelles (mensuelles) ── */
export const DEPENSES_MENSUELLES = [
  { id: 'expertComptable', label: 'Expert-Comptable', default: 160 },
  { id: 'assurancesProtection', label: 'Assurances & Protection', default: 185 },
  { id: 'outilsEtLogiciels', label: 'Outils & Logiciels', default: 90 },
  { id: 'restaurationMensuelle', label: 'Restauration', default: 190 },
  { id: 'transportPublicMensuel', label: 'Transport public', default: 50 },
] as const;

export type DepenseId = (typeof DEPENSES_MENSUELLES)[number]['id'];

/* ── Rétro-compat : ancien catalogue charges ── */
/* Mapping ancien → nouveau pour rétrocompat */
export const CHARGES_CATALOG = [
  { id: 'compta', name: 'Expert-Comptable', amount: 160 },
  { id: 'mutuelle', name: 'Protection Sociale', amount: 140 },
  { id: 'assurance', name: 'Responsabilité Civile', amount: 45 },
  { id: 'bureau', name: 'Bureau / Coworking', amount: 250 },
  { id: 'formation', name: 'Formation & Développement pro', amount: 120 },
  { id: 'repas', name: 'Restauration', amount: 190 },
  { id: 'tel', name: 'Outils & Logiciels', amount: 90 },
  { id: 'fraisBancaires', name: 'Frais bancaires / Compte pro', amount: 35 },
  { id: 'transport', name: 'Transport public', amount: 50 },
];

export const CFE_PAR_VILLE: Record<CitySize, number> = {
  petite: 300,
  moyenne: 550,
  grande: 900,
};

export type CitySize = 'petite' | 'moyenne' | 'grande';

export const SEUIL_TRIMESTRE_RETRAITE = 1800;

/* ── Plafonds Micro 2026 ── */
export const PLAFOND_MICRO_BNC = 77_700;
export const PLAFOND_MICRO_BIC = 188_700;
