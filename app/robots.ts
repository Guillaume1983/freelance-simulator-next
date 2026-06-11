import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/jsonLd';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/mon-compte',
          '/connexion',
          '/inscription',
          '/mot-de-passe-reset',
          '/mot-de-passe-oublie',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
