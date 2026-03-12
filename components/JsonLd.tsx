export function WebsiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Freelance Simulateur',
    description: 'Simulateur et comparateur de statuts freelance. Comparez Portage, Micro-entreprise, EURL et SASU.',
    url: 'https://freelance-simulateur.fr',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://freelance-simulateur.fr/outils?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Freelance Simulateur',
    url: 'https://freelance-simulateur.fr',
    logo: 'https://freelance-simulateur.fr/og-image.jpg',
    description: 'Outils gratuits de simulation et comparaison des statuts freelance en France.',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@freelance-simulateur.fr',
      contactType: 'customer service',
      availableLanguage: 'French',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function SoftwareApplicationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Freelance Simulateur',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    description: 'Simulateur gratuit pour comparer les statuts freelance : Portage salarial, Micro-entreprise, EURL IR, EURL IS, SASU.',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function FAQJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Quel est le meilleur statut pour un freelance ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Le meilleur statut dépend de votre chiffre d\'affaires, vos charges et votre situation personnelle. La micro-entreprise est idéale pour débuter (simplicité, faibles charges). L\'EURL ou la SASU sont préférables au-delà de 77 700 euros de CA ou pour optimiser fiscalement.',
        },
      },
      {
        '@type': 'Question',
        name: 'Comment calculer son revenu net en freelance ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Le revenu net se calcule en déduisant du chiffre d\'affaires les cotisations sociales, l\'impôt sur le revenu ou l\'IS, la CFE et les charges professionnelles. Notre simulateur effectue ce calcul automatiquement selon votre statut.',
        },
      },
      {
        '@type': 'Question',
        name: 'Qu\'est-ce que l\'ACRE ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'L\'ACRE (Aide aux Créateurs et Repreneurs d\'Entreprise) est une exonération partielle de cotisations sociales la première année d\'activité. Elle permet d\'économiser environ 50% des cotisations selon le statut choisi.',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
