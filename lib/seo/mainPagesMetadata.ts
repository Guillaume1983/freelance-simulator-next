import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/jsonLd';

const ogImage = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: 'Freelance Simulateur — comparateur et simulateurs de revenu net',
} as const;

/** Titre SERP accueil (réutiliser pour JSON-LD WebPage). */
export const homePageTitleAbsolute =
  'Simulateur freelance : comparateur de revenu net (Portage, Micro, EURL, SASU) 2026 | Freelance Simulateur';

export const homePageDescription =
  'Simulateur freelance et comparateur de revenu net : portage, micro-entreprise, EURL IR/IS, SASU. Simulation freelance sur 5 ans, outils (TJM, IK, TVA…), barèmes 2026. Indicatif.';

/** Page d’accueil : titre absolu pour contrôler l’affichage dans la SERP. */
export const homePageMetadata: Metadata = {
  title: {
    absolute: homePageTitleAbsolute,
  },
  description: homePageDescription,
  keywords: [
    'simulateur freelance',
    'simulation freelance',
    'freelance simulateur',
    'comparateur statut freelance',
    'revenu net freelance',
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    title:
      'Simulateur freelance : comparateur de revenu net (Portage, Micro, EURL, SASU) 2026',
    description:
      'Comparez et simulez votre revenu net selon le statut : portage, micro, EURL, SASU. Barèmes 2026.',
    url: SITE_URL,
    siteName: 'Freelance Simulateur',
    locale: 'fr_FR',
    type: 'website',
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Simulateur freelance : comparateur de revenu net (Portage, Micro, EURL, SASU) 2026',
    description:
      'Comparez et simulez votre revenu net selon le statut : portage, micro, EURL, SASU. Barèmes 2026.',
    images: ['/og-image.png'],
  },
};

/** Réutilisé pour JSON-LD (écart = bug). */
export const comparateurSeo = {
  title: 'Comparateur de statuts freelance : portage, micro, EURL, SASU 2026',
  description:
    'Comparateur freelance : revenu net côte à côte pour portage salarial, micro-entreprise, EURL IR/IS et SASU. Même profil (TJM, charges, foyer). Indicatif, barèmes 2026.',
} as const;

export const comparateurPageMetadata: Metadata = {
  title: comparateurSeo.title,
  description: comparateurSeo.description,
  keywords: [
    'comparateur statut freelance',
    'comparaison statut freelance',
    'comparer portage micro EURL SASU',
    'revenu net comparateur',
    'simulateur comparatif freelance',
    'comparateur revenu net freelance',
  ],
  alternates: { canonical: `${SITE_URL}/comparateur` },
  openGraph: {
    title: 'Comparateur de statuts freelance 2026 | Freelance Simulateur',
    description:
      'Visualisez le revenu net pour chaque statut sur un même chiffre d’affaires et les mêmes hypothèses.',
    url: `${SITE_URL}/comparateur`,
    siteName: 'Freelance Simulateur',
    locale: 'fr_FR',
    type: 'website',
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comparateur de statuts freelance 2026',
    description:
      'Portage, micro, EURL, SASU : comparez le revenu net sur un même profil.',
    images: ['/og-image.png'],
  },
};

export const outilsSeo = {
  title: 'Outils freelance : IK, CFE, ACRE, micro, TVA, TJM, IR, cotisations TNS',
  description:
    'Outils et calculateurs pour freelances : indemnités km, CFE, ACRE, plafonds micro-entreprise, franchise TVA, TJM vers net, taux IR effectif, cotisations TNS. Barèmes 2026, résultats indicatifs.',
} as const;

export const outilsPageMetadata: Metadata = {
  title: outilsSeo.title,
  description: outilsSeo.description,
  keywords: [
    'outils freelance',
    'calculateurs freelance',
    'calculateur freelance',
    'indemnités kilométriques freelance',
    'simulateur TJM net',
    'simulation TJM revenu net',
  ],
  alternates: { canonical: `${SITE_URL}/outils` },
  openGraph: {
    title: 'Outils et calculateurs freelance 2026 | Freelance Simulateur',
    description:
      'IK, CFE, ACRE, plafonds micro, TVA, TJM, IR, cotisations TNS — barèmes en vigueur.',
    url: `${SITE_URL}/outils`,
    siteName: 'Freelance Simulateur',
    locale: 'fr_FR',
    type: 'website',
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Outils et calculateurs freelance 2026',
    description: 'Calculateurs IK, CFE, ACRE, micro, TVA, TJM, IR, TNS.',
    images: ['/og-image.png'],
  },
};
