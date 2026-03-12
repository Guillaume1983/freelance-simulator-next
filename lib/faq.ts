/** Données FAQ partagées (affichage + JSON-LD). */
export const FAQ_ITEMS = [
  {
    question: 'Quel est le meilleur statut pour un freelance ?',
    answer:
      'Cela dépend de votre chiffre d\'affaires, de vos charges et de votre situation personnelle. La micro-entreprise est idéale pour débuter (simplicité, faibles charges). L\'EURL ou la SASU deviennent pertinents au-delà de certains plafonds ou pour optimiser fiscalement. Utilisez le comparateur pour voir l\'impact sur votre revenu net.',
  },
  {
    question: 'Comment est calculé le revenu net dans le simulateur ?',
    answer:
      'Le revenu net est obtenu en déduisant du chiffre d\'affaires les cotisations sociales, l\'impôt sur le revenu (ou l\'IS pour les sociétés), la CFE et les charges professionnelles (dépenses, indemnités kilométriques, etc.). Le simulateur applique les barèmes 2026 et les règles en vigueur pour chaque statut.',
  },
  {
    question: "Qu'est-ce que l'ACRE ?",
    answer:
      "L'ACRE (Aide aux Créateurs et Repreneurs d'Entreprise) est une exonération partielle des cotisations sociales la première année d'activité. Depuis 2026, elle permet d'économiser environ 25 % des cotisations (hors CSG/CRDS) selon le décret en vigueur. Elle ne s'applique pas au portage salarial.",
  },
  {
    question: 'Le simulateur utilise-t-il les barèmes 2026 ?',
    answer:
      'Oui. Les calculs sont basés sur la Loi de Finances et les barèmes URSSAF 2026 (taux micro, plafonds, ACRE, impôt sur le revenu, etc.). Les résultats restent des estimations indicatives ; pour une décision personnalisée, consultez un expert-comptable.',
  },
] as const;
