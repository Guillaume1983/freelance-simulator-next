import type { MetadataRoute } from 'next';

const BASE_URL = 'https://freelance-simulateur.fr';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const urls = [
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
  ];

  return urls.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
  }));
}

