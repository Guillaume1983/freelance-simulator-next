export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  category: string;
};

export const ARTICLES: Article[] = [
  {
    slug: 'choisir-statut-freelance-2026',
    title: 'Comment choisir son statut freelance en 2026 ?',
    excerpt:
      'Portage, micro, EURL, SASU : une grille de lecture simple pour comprendre les grands écarts de net, de sécurité et de charge mentale.',
    date: '2026-02-10',
    readingTime: '6 min',
    category: 'Comparatif statuts',
  },
  {
    slug: 'optimiser-indemnites-kilometriques',
    title: 'Indemnités kilométriques : bonnes pratiques et pièges à éviter',
    excerpt:
      'Barèmes fiscaux, choix de la puissance fiscale, différence entre forfait IK et notes de frais classiques : ce qui change vraiment sur votre net.',
    date: '2026-01-28',
    readingTime: '5 min',
    category: 'Optimisations',
  },
  {
    slug: 'se-remunerer-en-sasu-vs-eurl',
    title: 'Se rémunérer en SASU vs EURL : salaire, dividendes et trésorerie',
    excerpt:
      'Comprendre les logiques de rémunération, d’IS et de trésorerie pour éviter les mauvaises surprises au moment de sortir l’argent de la société.',
    date: '2026-01-12',
    readingTime: '7 min',
    category: 'Sociétés',
  },
  {
    slug: 'plan-de-tresorerie-freelance',
    title: 'Construire son plan de trésorerie freelance sur 3 à 5 ans',
    excerpt:
      'Comment projeter son activité, lisser les charges et anticiper les creux pour dormir tranquille sans sacrifier son niveau de vie.',
    date: '2025-12-15',
    readingTime: '8 min',
    category: 'Projection',
  },
];

