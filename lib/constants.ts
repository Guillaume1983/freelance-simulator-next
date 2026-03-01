export const CHARGES_CATALOG = [
  { id: 'compta',    name: 'Expert-Comptable',     amount: 160 },
  { id: 'mutuelle',  name: 'Protection Sociale',   amount: 140 },
  { id: 'assurance', name: 'Responsabilité Civile', amount: 45 },
  { id: 'repas',     name: 'Déjeuners Pro',         amount: 190 },
  { id: 'tel',       name: 'Tech & Mobilité',       amount: 90 },
];

export const CFE_PAR_VILLE: Record<CitySize, number> = {
  petite:  300,
  moyenne: 550,
  grande:  900,
};

export type CitySize = 'petite' | 'moyenne' | 'grande';

// Seuil SMIC 2026 pour valider 1 trimestre de retraite (150h × 11.88€)
export const SEUIL_TRIMESTRE_RETRAITE = 1800;
