export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  category: string;
  imageUrl: string;
  content: string;
};

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export const ARTICLES: Article[] = [
  {
    slug: 'choisir-statut-freelance-2026',
    title: 'Comment choisir son statut freelance en 2026 ?',
    excerpt:
      'Portage, micro, EURL, SASU : une grille de lecture simple pour comprendre les grands écarts de net, de sécurité et de charge mentale.',
    date: '2026-02-10',
    readingTime: '6 min',
    category: 'Comparatif statuts',
    imageUrl:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=800&auto=format&fit=crop&q=80',
    content: `Le choix du statut freelance impacte directement votre revenu net, votre protection sociale et votre charge administrative. En 2026, les barèmes (micro-entreprise, cotisations TNS, IR, IS) ont évolué : le simulateur vous permet de comparer plusieurs scénarios sur votre propre profil.

**Portage salarial** : idéal pour tester l’activité ou sécuriser un premier contrat, avec un net souvent inférieur au micro ou à la société mais sans gestion comptable. **Micro-entreprise** : plafonds à respecter (CA), franchise de TVA, cotisations forfaitaires — très lisible pour le net au jour le jour. **EURL / SASU** : au-delà des plafonds ou pour optimiser à long terme, avec choix IR ou IS et possibilité de rémunération en salaire et dividendes.

La bonne approche : simuler avec votre TJM et vos jours travaillés, comparer le net annuel et mensuel entre statuts, puis valider avec un expert-comptable avant de vous engager.`,
  },
  {
    slug: 'optimiser-indemnites-kilometriques',
    title: 'Indemnités kilométriques : bonnes pratiques et pièges à éviter',
    excerpt:
      'Barèmes fiscaux, choix de la puissance fiscale, différence entre forfait IK et notes de frais classiques : ce qui change vraiment sur votre net.',
    date: '2026-01-28',
    readingTime: '5 min',
    category: 'Optimisations',
    imageUrl:
      'https://images.unsplash.com/photo-1517940310602-135ac0435442?w=800&auto=format&fit=crop&q=80',
    content: `Les indemnités kilométriques (IK) permettent de déduire une partie des frais liés à l’usage du véhicule pour l’activité professionnelle. Les barèmes officiels (fixés chaque année) dépendent de la puissance fiscale du véhicule et du nombre de kilomètres parcourus.

Choisir la bonne tranche de puissance fiscale est crucial : un véhicule sous-déclaré peut conduire à un redressement, un véhicule sur-déclaré vous fait perdre en déduction. Les notes de frais « réelles » (carburant, péage, entretien) sont une alternative au forfait IK, mais imposent de conserver les justificatifs et de respecter les règles du droit fiscal.

Utilisez l’outil Indemnités km du simulateur pour estimer le montant déductible selon votre profil et votre véhicule, et intégrez ce paramètre dans vos comparaisons de statuts.`,
  },
  {
    slug: 'se-remunerer-en-sasu-vs-eurl',
    title: 'Se rémunérer en SASU vs EURL : salaire, dividendes et trésorerie',
    excerpt:
      'Comprendre les logiques de rémunération, d’IS et de trésorerie pour éviter les mauvaises surprises au moment de sortir l’argent de la société.',
    date: '2026-01-12',
    readingTime: '7 min',
    category: 'Sociétés',
    imageUrl:
      'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=800&auto=format&fit=crop&q=80',
    content: `En SASU comme en EURL à l’IS, la société paie l’impôt sur les sociétés (IS) sur ses bénéfices. Votre rémunération peut prendre deux formes : le **salaire** (charges sociales en amont, déductible pour la société) et les **dividendes** (versés après IS, flat tax ou IR selon les cas).

Le salaire réduit le résultat imposable de la société mais génère des cotisations sociales. Les dividendes sont distribués après IS : la trésorerie disponible n’est donc pas immédiate. Un équilibre salaire / dividendes permet d’optimiser le net et la trésorerie tout en sécurisant une couverture sociale.

Le simulateur 5 ans vous aide à projeter revenus, charges et trésorerie pour anticiper les flux et éviter les mauvaises surprises. Pensez à intégrer l’ACRE et la CFE dans vos premières années.`,
  },
  {
    slug: 'plan-de-tresorerie-freelance',
    title: 'Construire son plan de trésorerie freelance sur 3 à 5 ans',
    excerpt:
      'Comment projeter son activité, lisser les charges et anticiper les creux pour dormir tranquille sans sacrifier son niveau de vie.',
    date: '2025-12-15',
    readingTime: '8 min',
    category: 'Simulation',
    imageUrl:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
    content: `Un plan de trésorerie freelance repose sur une estimation réaliste du chiffre d’affaires (TJM × jours travaillés), des charges sociales et fiscales (variables selon le statut et l’année), et des décalages de paiement (délais clients, échéances URSSAF, IR, IS).

En micro-entreprise, les cotisations sont calculées sur le CA déclaré, avec des échéances souvent mensuelles ou trimestrielles. En société (EURL, SASU), l’IS, la rémunération et les dividendes créent des pics et des creux : il faut anticiper les acomptes et le solde d’IR ou d’IS.

Utilisez le simulateur 5 ans pour voir, année par année, le net après impôts et charges, puis construisez un tableau de trésorerie (encaissements / décaissements) sur 12 à 36 mois. Gardez une marge de sécurité pour les impayés et les trous d’activité.`,
  },
];

