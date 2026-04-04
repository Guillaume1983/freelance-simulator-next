/* ── Dépenses professionnelles (mensuelles) ── */
export const DEPENSES_MENSUELLES = [
  { id: 'expertComptable', label: 'Expert-Comptable', default: 160 },
  { id: 'assurancesProtection', label: 'Assurances & Protection', default: 185 },
  { id: 'outilsEtLogiciels', label: 'Outils & Logiciels', default: 90 },
  { id: 'restaurationMensuelle', label: 'Restauration', default: 190 },
  { id: 'transportPublicMensuel', label: 'Transport public', default: 50 },
] as const;

export type DepenseId = (typeof DEPENSES_MENSUELLES)[number]['id'];

/* ── Catalogue charges récurrentes (€ / mois indicatifs) ── */
/**
 * Périmètre dans le simulateur :
 * - **EURL IR / EURL IS / SASU** : chaque poste activé entre dans `depensesPro` (dépenses déductibles du résultat d’entreprise).
 * - **Portage** : seuls les postes avec `portageWarning === false` (+ matériel mission dans le pipeline) sont reprises dans le budget « frais acceptés » ; si `true`, la charge est exclue de ce périmètre portage.
 * - **Micro** : le catalogue ne réduit pas cotisations ni IR (abattement sur le CA) ; les montants saisis réduisent le disponible (trésorerie), comme la CFE.
 */
export const CHARGES_CATALOG = [
  { id: 'compta',        name: 'Expert-Comptable',            amount: 160, portageWarning: true  },
  { id: 'mutuelle',      name: 'Protection Sociale',          amount: 140, portageWarning: true  },
  { id: 'assurance',     name: 'Responsabilité Civile',       amount:  45, portageWarning: true  },
  { id: 'bureau',        name: 'Bureau / Coworking',          amount: 250, portageWarning: true  },
  { id: 'formation',     name: 'Formation & Développement pro', amount: 120, portageWarning: true },
  { id: 'repas',         name: 'Restauration',                amount: 190, portageWarning: false },
  { id: 'tel',           name: 'Outils & Logiciels',          amount:  90, portageWarning: false },
  { id: 'fraisBancaires',name: 'Frais bancaires / Compte pro',amount:  35, portageWarning: true  },
  { id: 'transport',     name: 'Transport public',            amount:  50, portageWarning: false },
] as const;

/**
 * Ordre d’affichage unifié (comparateur + simulateurs) : postes « mission » portage d’abord, puis les autres — aligné sur
 * l’astérisque * du comparateur.
 */
export const CHARGES_CATALOG_DISPLAY_ORDER = [
  ...CHARGES_CATALOG.filter((c) => !c.portageWarning),
  ...CHARGES_CATALOG.filter((c) => c.portageWarning),
] as readonly (typeof CHARGES_CATALOG)[number][];

export const CFE_PAR_VILLE: Record<CitySize, number> = {
  petite: 300,
  moyenne: 550,
  grande: 900,
};

export type CitySize = 'petite' | 'moyenne' | 'grande';

export const SEUIL_TRIMESTRE_RETRAITE = 1800;

/** Taux de commission portage (%), valeur par défaut dans Réglages. */
export const DEFAULT_PORTAGE_COMM = 5;

/* ── Plafonds Micro 2026 (URSSAF autoentrepreneur, actualité du 20/02/2026) ── */
// 203 100 € pour les activités de vente / hébergement (BIC) et 83 600 € pour les prestations de services (BIC/BNC).
export const PLAFOND_MICRO_BNC = 83_600;
export const PLAFOND_MICRO_BIC = 203_100;
