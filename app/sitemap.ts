import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://freelance-simulateur.fr';
  const now = new Date();

  // Pages principales avec haute priorité
  const mainPages = [
    { url: baseUrl, priority: 1.0, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/comparateur`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/simulateur`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/outils`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/articles`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/reglages`, priority: 0.7, changeFrequency: 'monthly' as const },
  ];

  // Pages simulateur par statut
  const simulateurPages = [
    'portage',
    'micro',
    'eurl-ir',
    'eurl-is',
    'sasu',
  ].map((statut) => ({
    url: `${baseUrl}/simulateur/${statut}`,
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  }));

  // Pages outils
  const outilsPages = [
    'indemnites-km',
    'cfe',
    'acre',
    'plafonds-micro',
    'franchise-tva',
    'tjm-revenu-net',
    'taux-effectif-ir',
    'cotisations-tns',
  ].map((outil) => ({
    url: `${baseUrl}/outils/${outil}`,
    priority: 0.7,
    changeFrequency: 'monthly' as const,
  }));

  // Pages secondaires
  const secondaryPages = [
    { url: `${baseUrl}/contact`, priority: 0.5, changeFrequency: 'yearly' as const },
    { url: `${baseUrl}/mentions-legales`, priority: 0.3, changeFrequency: 'yearly' as const },
    { url: `${baseUrl}/cgu`, priority: 0.3, changeFrequency: 'yearly' as const },
    { url: `${baseUrl}/partenaires`, priority: 0.4, changeFrequency: 'monthly' as const },
  ];

  return [
    ...mainPages,
    ...simulateurPages,
    ...outilsPages,
    ...secondaryPages,
  ].map((page) => ({
    ...page,
    lastModified: now,
  }));
}
