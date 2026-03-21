import type { MetadataRoute } from 'next';
import { ARTICLES } from '@/lib/articles';

const BASE_URL = 'https://freelance-simulateur.fr';

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
    '/reglages',
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
  ];

  const articlePaths = ARTICLES.map((a) => `/articles/${a.slug}`);
  const urls = [...staticPaths, ...articlePaths];

  return urls.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
  }));
}

