import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.freelance-simulateur.fr';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/mon-compte', '/connexion', '/inscription'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

