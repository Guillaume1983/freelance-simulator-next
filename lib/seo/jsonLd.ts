import { FAQ_ITEMS } from '@/lib/faq';

export const SITE_URL = 'https://www.freelance-simulateur.fr';
export const LOGO_URL = `${SITE_URL}/logo.png`;

/** Organisation éditrice (E-E-A-T, liens avec WebApplication). */
export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Freelance Simulateur',
    url: SITE_URL,
    logo: LOGO_URL,
    description:
      'Outil en ligne de comparaison et de simulation de revenus nets pour les travailleurs indépendants en France (portage salarial, micro-entreprise, EURL, SASU).',
  };
}

/** Application web / « calculatrice » fiscale, thématique finance (YMYL). */
export function getWebApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Freelance Simulateur',
    url: SITE_URL,
    image: LOGO_URL,
    applicationCategory: 'FinanceApplication',
    applicationSubCategory: 'TaxCalculator',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Navigateur moderne.',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      description: 'Accès gratuit au comparateur et aux simulateurs.',
    },
    description:
      'Comparateur et simulateurs de revenu net freelance (portage, micro-entreprise, EURL IR/IS, SASU). Les résultats sont indicatifs et s’appuient sur les barèmes de la Loi de Finances en vigueur et sur les publications de référence (Urssaf, impots.gouv.fr). Ils ne constituent pas un conseil fiscal ou social personnalisé.',
    author: { '@type': 'Organization', name: 'Freelance Simulateur', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'Freelance Simulateur', url: SITE_URL },
    inLanguage: 'fr-FR',
  };
}

export function getFaqPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/** Données structurées Article pour les guides. */
export function getArticleJsonLd(article: {
  title: string;
  excerpt: string;
  date: string;
  imageUrl: string;
  slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.imageUrl,
    datePublished: article.date,
    dateModified: article.date,
    url: `${SITE_URL}/articles/${article.slug}`,
    author: { '@type': 'Organization', name: 'Freelance Simulateur', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Freelance Simulateur',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: LOGO_URL },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/articles/${article.slug}`,
    },
    inLanguage: 'fr-FR',
  };
}

/** WebPage + FAQ (simulateur/[statut], comparateur, outils…) pour rich results. */
export function getWebPageFaqJsonLd(input: {
  canonicalUrl: string;
  title: string;
  description: string;
  faq: { q: string; a: string }[];
}) {
  const nodes: Record<string, unknown>[] = [
    {
      '@type': 'WebPage',
      '@id': `${input.canonicalUrl}#webpage`,
      url: input.canonicalUrl,
      name: input.title,
      description: input.description,
      isPartOf: {
        '@type': 'WebSite',
        name: 'Freelance Simulateur',
        url: SITE_URL,
      },
      inLanguage: 'fr-FR',
      publisher: { '@type': 'Organization', name: 'Freelance Simulateur', url: SITE_URL },
    },
  ];

  if (input.faq.length > 0) {
    nodes.push({
      '@type': 'FAQPage',
      '@id': `${input.canonicalUrl}#faq`,
      mainEntity: input.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
}

/** @deprecated Utiliser getWebPageFaqJsonLd */
export const getSimulateurStatutPageJsonLd = getWebPageFaqJsonLd;

export function getAboutPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'À propos · Freelance Simulateur',
    url: `${SITE_URL}/a-propos`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Freelance Simulateur',
      url: SITE_URL,
    },
    inLanguage: 'fr-FR',
    publisher: { '@type': 'Organization', name: 'Freelance Simulateur', url: SITE_URL },
  };
}
