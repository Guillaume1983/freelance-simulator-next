import type { MetadataRoute } from 'next';
import { ARTICLES } from '@/lib/articles';
import { VALID_PALIER_CA, VALID_STATUT_SLUGS } from '@/lib/simulateur/paliers';

const BASE_URL = 'https://www.freelance-simulateur.fr';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths = [
    '/',
    '/comparateur',
    '/simulateur',
    '/simulateur/portage',
    '/simulateur/micro',
    '/simulateur/eurl-ir',
    '/simulateur/eurl-is',
    '/simulateur/sasu',
    '/outils',
    '/outils/indemnites-km',
    '/outils/cfe',
    '/outils/acre',
    '/outils/plafonds-micro',
    '/outils/franchise-tva',
    '/outils/tjm-revenu-net',
    '/outils/taux-effectif-ir',
    '/outils/cotisations-tns',
    '/articles',
    '/contact',
    '/tarifs',
    '/cgu',
    '/mentions-legales',
    '/confidentialite',
    '/hypotheses',
    '/a-propos',
    '/glossaire',
    '/bareme',
  ];

  const articlePaths = ARTICLES.map((a) => `/articles/${a.slug}`);
  const palierPaths = VALID_STATUT_SLUGS.flatMap((statut) =>
    VALID_PALIER_CA.map((ca) => `/simulateur/${statut}/${ca}`),
  );
  const urls = [...staticPaths, ...articlePaths, ...palierPaths];

  return urls.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
  }));
}

