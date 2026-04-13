/**
 * Source unique : titres/meta, H1, texte et FAQ des pages /simulateur/[statut]
 * (évite la dérive entre layout metadata et contenu affiché).
 */

export type SimulateurStatutFaqItem = { q: string; a: string };

export type SimulateurStatutSeoBlock = {
  /** Titre court (balise <title> + Open Graph, sans suffixe site) */
  title: string;
  /** Meta description (~150–160 car.) */
  description: string;
  h1: string;
  intro: string;
  faq: SimulateurStatutFaqItem[];
  /** Mots-clés secondaires pour <meta name="keywords"> (impact SEO faible mais cohérence) */
  keywords: string[];
};

export const SIMULATEUR_STATUT_SLUGS = [
  'portage',
  'micro',
  'eurl-ir',
  'eurl-is',
  'sasu',
] as const;

export type SimulateurStatutSlug = (typeof SIMULATEUR_STATUT_SLUGS)[number];

export const SIMULATEUR_STATUT_CONTENT: Record<SimulateurStatutSlug, SimulateurStatutSeoBlock> = {
  portage: {
    title: 'Simulation portage salarial : revenu net sur 5 ans (gratuit)',
    description:
      'Simulation portage salarial en ligne : salaire net, frais de gestion et cotisations sur 5 ans. Simuler freelance en portage — barèmes 2026, résultat indicatif.',
    h1: 'Simulation portage salarial : revenu net sur 5 ans',
    intro:
      "Cette simulation de portage salarial en ligne estime votre salaire net après frais de gestion et cotisations, avec l'évolution du chiffre d'affaires sur cinq ans. Le portage permet de facturer comme indépendant tout en restant salarié du cabinet (couverture sociale, bulletin de paie). En général 5 à 10 % de frais de gestion sur le CA HT s'ajoutent aux cotisations salariales et patronales. L'ACRE et la CFE ne s'appliquent pas à ce statut dans notre modèle.",
    faq: [
      {
        q: 'À quoi sert une simulation portage salarial ?',
        a: "Elle projette votre net disponible mois par mois ou sur l'année en tenant compte des frais de cabinet et des prélèvements sociaux, pour comparer rapidement avec d'autres statuts (micro, EURL, SASU) sur un même TJM.",
      },
      {
        q: 'Quels frais sont prélevés en portage salarial ?',
        a: "La société de portage prélève des frais de gestion (en général 5 à 10 % du CA HT), auxquels s'ajoutent les cotisations salariales et patronales calculées sur votre salaire brut.",
      },
      {
        q: 'Le portage est-il intéressant à haut chiffre d’affaires ?',
        a: 'Le portage reste pertinent pour sécuriser une activité ou tester un marché, mais à CA élevé, les cotisations et frais cumulés peuvent rendre une société (EURL, SASU) plus avantageuse en net.',
      },
    ],
    keywords: [
      'simulation portage salarial',
      'simuler portage salarial',
      'simulateur portage salarial',
      'simulation salaire portage',
      'freelance portage simulation',
    ],
  },
  micro: {
    title: 'Simulation micro-entreprise : net, cotisations et IR sur 5 ans',
    description:
      'Simulation micro-entreprise et auto-entrepreneur : CA, cotisations, versement libératoire ou IR, ACRE et CFE sur 5 ans. Simuler en ligne — barèmes 2026.',
    h1: 'Simulation micro-entreprise : revenu net sur 5 ans',
    intro:
      "Cette simulation micro-entreprise (auto-entrepreneur) calcule votre revenu net sur cinq ans à partir du chiffre d'affaires, des taux de cotisations, du versement libératoire ou de l'imposition à l'IR, ainsi que de l'ACRE et de la CFE lorsque le modèle les inclut. La micro impose des plafonds de CA et ne permet pas la déduction des charges au réel.",
    faq: [
      {
        q: 'Comment simuler une micro-entreprise sur plusieurs années ?',
        a: "Vous renseignez TJM, jours travaillés et hypothèses de croissance : l'outil reproduit l'effet du CA sur les cotisations et l'impôt année après année, dans la limite des plafonds du régime.",
      },
      {
        q: 'Quels sont les plafonds de la micro-entreprise en 2026 ?',
        a: 'Pour les prestations de services (BIC/BNC), le plafond est de 83 600 € de CA annuel. Pour les activités commerciales (vente, hébergement), il est de 203 100 €. Au-delà de deux dépassements consécutifs, vous basculez vers un régime réel.',
      },
      {
        q: "Qu'est-ce que le versement libératoire ?",
        a: "C'est une option qui permet de payer l'impôt sur le revenu en même temps que les cotisations, avec un taux fixe appliqué au CA (1 % à 2,2 % selon l'activité), sous conditions de revenu fiscal de référence.",
      },
    ],
    keywords: [
      'simulation micro entreprise',
      'simulation auto entrepreneur',
      'simuler micro entreprise',
      'simulateur micro entreprise',
      'simulation auto-entrepreneur',
    ],
  },
  'eurl-ir': {
    title: 'Simulation EURL à l’IR : gérant TNS, revenu net sur 5 ans',
    description:
      'Simulation EURL à l’impôt sur le revenu : bénéfice, cotisations TNS, IR du foyer, charges. Simuler une EURL IR en ligne — barèmes 2026, indicatif.',
    h1: 'Simulation EURL à l’IR : revenu net gérant sur 5 ans',
    intro:
      "Cette simulation EURL à l'IR projette le revenu net du gérant TNS sur cinq ans : charges déductibles au réel, cotisations sociales, intégration du bénéfice au barème IR du foyer, ACRE et CFE selon les réglages. Elle complète une simple simulation « société » en montrant l'impact fiscal personnel.",
    faq: [
      {
        q: 'Pourquoi faire une simulation EURL à l’IR plutôt qu’à l’IS ?',
        a: "L'EURL à l'IR impose le bénéfice comme revenu professionnel du foyer : la simulation montre le net après TNS et IR progressif. L'EURL à l'IS suit une autre logique (IS sur la société puis rémunération et dividendes).",
      },
      {
        q: "Quelle différence entre EURL IR et EURL IS ?",
        a: "En EURL IR, le bénéfice est imposé directement au barème de l'IR du foyer. En EURL IS, la société paie l'impôt sur les sociétés et le dirigeant est imposé sur sa rémunération et ses dividendes.",
      },
      {
        q: 'Les cotisations TNS sont-elles plus basses qu’en SASU ?',
        a: 'Globalement oui : les cotisations TNS représentent environ 45 % du revenu net, contre environ 82 % de charges patronales et salariales sur la rémunération en SASU (assimilé salarié). C’est pourquoi la SASU devient avantageuse à haut CA grâce aux dividendes au PFU 30 %.',
      },
    ],
    keywords: [
      'simulation EURL',
      'simulation EURL IR',
      'simuler EURL impôt sur le revenu',
      'simulateur EURL IR',
      'simulation gérant EURL',
    ],
  },
  'eurl-is': {
    title: 'Simulation EURL à l’IS : IS, rémunération et net sur 5 ans',
    description:
      'Simulation EURL à l’IS : impôt sur les sociétés, rémunération du gérant, résultat distribuable. Simuler une EURL IS en ligne — barèmes 2026.',
    h1: 'Simulation EURL à l’IS : rémunération et résultat sur 5 ans',
    intro:
      "Cette simulation EURL à l'IS en ligne estime le net du dirigeant sur cinq ans : IS sur le bénéfice, part salariale / résultat en société, cotisations TNS sur la rémunération, imposition personnelle sur les sommes perçues. Vous pouvez faire varier la répartition rémunération versus bénéfice conservé.",
    faq: [
      {
        q: 'Comment simuler une EURL à l’IS avec rémunération variable ?',
        a: "Le curseur rémunération / résultat modifie la part versée en salaire (cotisations TNS) et la part laissée en société (soumis à l'IS avant éventuelle distribution).",
      },
      {
        q: 'Puis-je moduler la répartition rémunération / bénéfice ?',
        a: "Oui, le curseur dans les réglages permet d'ajuster la part de rémunération versée par rapport au bénéfice laissé en société. Cela impacte directement l'IS, les cotisations TNS et votre IR personnel.",
      },
      {
        q: "Quand l'IS est-il plus avantageux que l'IR ?",
        a: "L'IS peut être plus avantageux lorsque votre tranche marginale d'IR est élevée et que vous souhaitez capitaliser en société (réinvestir, amortir du matériel) plutôt que distribuer l'intégralité du bénéfice.",
      },
    ],
    keywords: [
      'simulation EURL IS',
      'simuler EURL impôt sociétés',
      'simulateur EURL IS',
      'simulation EURL à l’IS',
    ],
  },
  sasu: {
    title: 'Simulation SASU : salaire, dividendes et net sur 5 ans',
    description:
      'Simulation SASU freelance : IS, salaire président, dividendes (PFU), ACRE et CFE sur 5 ans. Simuler une SASU en ligne — barèmes 2026, indicatif.',
    h1: 'Simulation SASU : président, salaire et dividendes sur 5 ans',
    intro:
      "Cette simulation SASU projette votre revenu net sur cinq ans en combinant salaire d'assimilé salarié (cotisations régime général), dividendes au PFU ou au barème IR, et impôt sur les sociétés sur le bénéfice après rémunération. L'ACRE et la CFE sont prises en compte lorsque le modèle les applique.",
    faq: [
      {
        q: 'Comment simuler une SASU avec salaire et dividendes ?',
        a: "Les réglages permettent de répartir le résultat entre rémunération (soumise aux cotisations assimilé salarié) et distribution en dividendes (PFU 30 % ou IR), ce qui change fortement le net à CA élevé.",
      },
      {
        q: 'Comment fonctionne la répartition salaire / dividendes ?',
        a: "Le curseur dans les réglages ajuste la part de rémunération (soumise aux cotisations du régime général) et la part laissée en bénéfice pour distribution en dividendes (soumis au PFU de 30 % ou au barème IR).",
      },
      {
        q: 'Le président de SASU a-t-il droit au chômage ?',
        a: "Le président assimilé salarié cotise au régime général mais n'est pas éligible à l'assurance chômage au titre de son mandat social (sauf cas particuliers avec un contrat de travail distinct).",
      },
    ],
    keywords: [
      'simulation SASU',
      'simuler SASU',
      'simulateur SASU',
      'simulation président SASU',
      'simulation dividendes SASU',
    ],
  },
};

export const SIMULATEUR_STATUT_DEFAULT: SimulateurStatutSeoBlock = {
  title: 'Simulations freelance par statut : portage, micro, EURL, SASU',
  description:
    'Simulations par statut (portage, micro-entreprise, EURL IR/IS, SASU) sur 5 ans : cotisations, IR ou IS, ACRE et CFE selon les cas. Gratuit, barèmes 2026.',
  h1: 'Simulations freelance par statut',
  intro:
    'Choisissez un statut dans la liste pour ouvrir une simulation dédiée (portage salarial, micro-entreprise, EURL à l’IR ou à l’IS, SASU) avec les paramètres et barèmes adaptés.',
  faq: [],
  keywords: [
    'simulation freelance',
    'simulation statut indépendant',
    'simulateur freelance',
    'simuler revenu freelance',
  ],
};

export function isSimulateurStatutSlug(slug: string): slug is SimulateurStatutSlug {
  return SIMULATEUR_STATUT_SLUGS.includes(slug.toLowerCase() as SimulateurStatutSlug);
}

export function getSimulateurStatutSeo(slug: string): SimulateurStatutSeoBlock {
  const key = slug.toLowerCase();
  if (key in SIMULATEUR_STATUT_CONTENT) {
    return SIMULATEUR_STATUT_CONTENT[key as SimulateurStatutSlug];
  }
  return SIMULATEUR_STATUT_DEFAULT;
}
