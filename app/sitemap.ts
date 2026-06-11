import type { MetadataRoute } from 'next';
import { ARTICLES } from '@/lib/articles';
import { VALID_PALIER_CA, VALID_STATUT_SLUGS } from '@/lib/simulateur/paliers';
import { SITE_URL } from '@/lib/seo/jsonLd';

const BAREMES_DATE = new Date('2026-01-01');
const LEGAL_DATE = new Date('2025-06-01');

export default function sitemap(): MetadataRoute.Sitemap {
  const mainPaths = [
    '/',
    '/comparateur',
    '/simulateur',
    '/simulateur/portage',
    '/simulateur/micro',
    '/simulateur/eurl-ir',
    '/simulateur/eurl-is',
    '/simulateur/sasu',
    '/outils',
    '/articles',
    '/bareme',
    '/hypotheses',
    '/glossaire',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: BAREMES_DATE,
  }));

  const legalPaths = [
    '/contact',
    '/cgu',
    '/mentions-legales',
    '/confidentialite',
    '/a-propos',
    '/partenaires',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: LEGAL_DATE,
  }));

  const articleEntries = ARTICLES.map((a) => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: new Date(a.date),
  }));

  const palierEntries = VALID_STATUT_SLUGS.flatMap((statut) =>
    VALID_PALIER_CA.map((ca) => ({
      url: `${SITE_URL}/simulateur/${statut}/${ca}`,
      lastModified: BAREMES_DATE,
    })),
  );

  return [...mainPaths, ...legalPaths, ...articleEntries, ...palierEntries];
}
