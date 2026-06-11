/**
 * Pages SEO « paliers CA » : /simulateur/{statut}/{ca}
 * CA cible = TJM × jours (jours fixés pour cohérence des paliers).
 * Hypothèses dédiées palier (forfait charges, foyer) — distinctes de la simulation personnalisée.
 */

export const DAYS_FOR_PALIER = 200;

/** Forfait paliers : charges pro ≈ ce ratio × CA annuel (hors IK / loyer / avantages). */
export const PALIER_CHARGES_RATIO_CA = 0.1;

/** Id catalogue (CHARGES_CATALOG) — compatible portage salarial. */
export const PALIER_CHARGE_CATALOG_ID = 'repas' as const;

export function getPalierChargeMensuel(caAnnual: number): number {
  return Math.max(0, Math.round((PALIER_CHARGES_RATIO_CA * caAnnual) / 12));
}

/** Liste blanche des montants de CA annuel (€) — slug URL = nombre sans séparateurs */
export const VALID_PALIER_CA = [
  50_000, 80_000, 100_000, 120_000, 150_000, 200_000, 250_000, 300_000,
] as const;

export type PalierCa = (typeof VALID_PALIER_CA)[number];

export const STATUT_SLUG_TO_ID: Record<string, string> = {
  portage: 'Portage',
  micro: 'Micro',
  'eurl-ir': 'EURL IR',
  'eurl-is': 'EURL IS',
  sasu: 'SASU',
};

export const VALID_STATUT_SLUGS = Object.keys(STATUT_SLUG_TO_ID);

/** Parse le segment d’URL `[ca]` → montant autorisé ou null */
export function parsePalierCaSegment(segment: string): number | null {
  const n = Number.parseInt(segment.replace(/\D/g, ''), 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return (VALID_PALIER_CA as readonly number[]).includes(n) ? n : null;
}

export function regimeIdToStatutSlug(id: string): string | undefined {
  return Object.entries(STATUT_SLUG_TO_ID).find(([, v]) => v === id)?.[0];
}

export function buildComparateurQuery(ca: number, statutSlug: string): string {
  const params = new URLSearchParams();
  params.set('ca', String(ca));
  params.set('statut', statutSlug.toLowerCase());
  return `?${params.toString()}`;
}

const fmtK = (n: number) =>
  n >= 1_000_000
    ? `${Math.round(n / 1_000) / 1000} M€`.replace('.', ',')
    : `${Math.round(n / 1_000)} k€`;

/** Texte SEO court par couple (statut, CA) — pas un conseil fiscal */
export function getPalierSeoIntro(statutLabel: string, ca: number): string {
  const k = fmtK(ca);
  return (
    `Estimation du net pour un ${statutLabel} à environ ${k} de chiffre d’affaires annuel (année 1), ` +
    `avec TJM dérivé pour ${DAYS_FOR_PALIER} jours facturés, ` +
    `charges professionnelles forfaitaires à ${Math.round(PALIER_CHARGES_RATIO_CA * 100)} % du CA (sans indemnités kilométriques, loyer ni avantages), ` +
    `impôt sur le revenu pour une personne seule sans enfant (1 part fiscale, pas de revenu conjoint). ` +
    `Ce palier ne remplace pas une configuration personnalisée.`
  );
}

const chPct = () => `${Math.round(PALIER_CHARGES_RATIO_CA * 100)}`;

/** Titre SERP pages palier `/simulateur/{slug}/{ca}` (le layout racine ajoute « | Freelance Simulateur »). */
export function getPalierMetadataTitle(slug: string, caAnnual: number): string {
  const k = fmtK(caAnnual);
  const s = slug.toLowerCase();
  const bySlug: Record<string, string> = {
    sasu: `Simulation SASU ${k} / an : net, salaire président, dividendes`,
    micro: `Simulation micro-entreprise ${k} / an : net, cotisations, IR`,
    portage: `Simulation portage salarial ${k} / an : salaire net`,
    'eurl-ir': `Simulation EURL IR ${k} / an : revenu net gérant`,
    'eurl-is': `Simulation EURL IS ${k} / an : IS, rémunération, net`,
  };
  const label = STATUT_SLUG_TO_ID[s];
  return bySlug[s] ?? `Simulation ${label ?? s} ${k} / an : revenu net`;
}

/**
 * Meta description palier (~155–165 car.) : requêtes type « simulateur SASU », « simulation micro », etc.
 * en tête, puis hypothèses courtes (cohérentes avec le corps de page).
 */
export function getPalierMetadataDescription(slug: string, caAnnual: number): string {
  const k = fmtK(caAnnual);
  const s = slug.toLowerCase();
  const j = String(DAYS_FOR_PALIER);
  const pct = chPct();

  if (s === 'sasu') {
    return (
      `Simulateur SASU en ligne, palier ${k} de CA/an : net après IS, salaire président et dividendes (année 1). ` +
      `Hypothèses : ${j} j. facturés, charges ${pct} % du CA, IR 1 part. Indicatif.`
    );
  }
  if (s === 'micro') {
    return (
      `Simulateur micro-entreprise / auto-entrepreneur, ${k} de CA/an : cotisations, IR ou versement libératoire, net année 1. ` +
      `${j} j., charges ${pct} % du CA, IR 1 part. Indicatif.`
    );
  }
  if (s === 'portage') {
    return (
      `Simulateur portage salarial, ${k} de CA/an : salaire net après frais de gestion et cotisations (palier année 1). ` +
      `${j} j., charges ${pct} % du CA, IR 1 part. Indicatif.`
    );
  }
  if (s === 'eurl-ir') {
    return (
      `Simulation EURL à l’IR, ${k} de CA/an : net gérant TNS après cotisations et IR (palier année 1). ` +
      `${j} j., charges ${pct} % du CA, 1 part. Indicatif.`
    );
  }
  if (s === 'eurl-is') {
    return (
      `Simulation EURL à l’IS, ${k} de CA/an : IS, rémunération et net indicatif année 1. ` +
      `${j} j., charges ${pct} % du CA, IR 1 part. Indicatif.`
    );
  }
  const label = STATUT_SLUG_TO_ID[s] ?? s;
  return (
    `Simulation ${label}, ${k} de CA/an : revenu net indicatif année 1. ${j} j., charges ${pct} % du CA, IR 1 part.`
  );
}
