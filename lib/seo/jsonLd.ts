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
      'Outil en ligne de comparaison et de simulation de revenus nets pour travailleurs indépendants et freelances en France (portage salarial, micro-entreprise / auto-entrepreneur, EURL, SASU).',
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
      'Comparateur et simulateurs de revenu net pour freelances et auto-entrepreneurs (portage, micro-entreprise, EURL IR/IS, SASU). Les résultats sont indicatifs et s’appuient sur les barèmes de la Loi de Finances en vigueur et sur les publications de référence (Urssaf, impots.gouv.fr). Ils ne constituent pas un conseil fiscal ou social personnalisé.',
    author: { '@type': 'Organization', name: 'Freelance Simulateur', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'Freelance Simulateur', url: SITE_URL },
    inLanguage: 'fr-FR',
  };
}

export type FaqPair = { q: string; a: string };

/** FAQ globale du site (section accueil / contenu partagé). */
export function getSiteGlobalFaqPairs(): FaqPair[] {
  return FAQ_ITEMS.map((item) => ({ q: item.question, a: item.answer }));
}

/** Fusion de listes de Q/R : une seule entrée par libellé de question (insensible à la casse / espaces). */
export function dedupeFaqByQuestion(entries: FaqPair[]): FaqPair[] {
  const seen = new Set<string>();
  const out: FaqPair[] = [];
  for (const e of entries) {
    const k = e.q.trim().toLowerCase().replace(/\s+/g, ' ');
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(e);
  }
  return out;
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

/**
 * Un seul bloc JSON-LD avec @graph : WebPage + au plus un FAQPage.
 * `faqLists` : plusieurs tableaux concaténés puis dédoublonnés dans `FAQPage.mainEntity`.
 */
export function getWebPageFaqJsonLd(input: {
  canonicalUrl: string;
  title: string;
  description: string;
  faqLists: FaqPair[][];
}) {
  const mergedFaq = dedupeFaqByQuestion(input.faqLists.flat());

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

  if (mergedFaq.length > 0) {
    nodes.push({
      '@type': 'FAQPage',
      '@id': `${input.canonicalUrl}#faq`,
      mainEntity: mergedFaq.map((item) => ({
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
