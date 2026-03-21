import type { Article } from '../articleTypes';

const IMG =
  'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&auto=format&fit=crop&q=80';

const CONTENT = [
  `Choisir son statut d’indépendant en 2026 n’est pas qu’une question de « chiffre sur un simulateur » : votre revenu net, votre protection sociale, votre charge mentale et parfois votre crédibilité commerciale en dépendent. Il n’existe pas de réponse universelle. Ce guide pose une méthode : clarifier votre profil d’activité, aligner un TJM et un volume de jours réalistes, puis utiliser le comparateur du site pour obtenir des ordres de grandeur entre portage salarial, micro-entreprise, EURL à l’IR, EURL à l’IS et SASU. Toute décision engageante doit ensuite être validée avec un expert-comptable et, le cas échéant, un conseil juridique.`,
  `Les cinq modèles présents sur Freelance Simulateur couvrent la majorité des prestations intellectuelles et de conseil en France métropolitaine pour une activité principale. Ils ne remplacent pas des montages plus spécifiques (holding, SCI, travailleur frontalier, activité mixte salarié / indépendant) : si votre situation sort de ces cadres, un accompagnement individualisé est indispensable.`,
  `Le portage salarial vous place en contrat de travail avec une entreprise de portage : vous êtes salarié. Le porteur facture vos clients et prélève des frais de gestion ; votre salaire net reflète ce mécanisme. Le potentiel de net « brut facturable » est souvent inférieur à celui d’une micro ou d’une société bien optimisée, mais vous déléguez une grande partie de l’administratif et vous relevez du régime général pour la protection sociale, sous réserve des règles d’indemnisation chômage et du contrat.`,
  `La micro-entreprise impose des plafonds de chiffre d’affaires et une logique de cotisations liées au CA déclaré. L’impôt peut passer par le versement libératoire si vous remplissez les conditions de revenus du foyer ; sinon l’imposition s’intègre au barème de l’IR avec abattements forfaitaires. La micro est lisible et rapide à ouvrir ; en revanche, vous ne déduisez pas les charges au réel dans le cadre strict du régime micro, et les plafonds vous obligent à changer de statut si l’activité dépasse les seuils.`,
  `L’EURL et la SASU sont des sociétés : comptabilité complète, TVA selon les cas, obligations déclaratives renforcées. L’EURL à l’IR intègre le résultat professionnel au foyer du dirigeant en impôt sur le revenu. L’EURL à l’IS et la SASU imposent en général les bénéfices à l’impôt sur les sociétés, puis la distribution se fait par rémunération de dirigeant et éventuellement dividendes. Le gérant d’EURL relève en principe des règles TNS ; le président de SASU est souvent assimilé salarié : les cotisations et la couverture sociale diffèrent profondément.`,
  `Pour comparer objectivement, fixez une base commune : un TJM cohérent avec votre marché, un nombre de jours facturés en déduisant congés, maladie, prospection et temps non facturable. Si vous utilisez le simulateur sur cinq ans, testez une hypothèse de croissance prudente et une hypothèse optimiste. Renseignez les charges dans les réglages lorsque l’outil le permet : véhicule, loyer professionnel, logiciels, comptabilité — elles modulent le résultat différemment selon le statut.`,
  `Le seul critère du « plus gros net sur l’écran » est trompeur. Un portage peut afficher un net inférieur à la micro pour un même chiffre d’affaires, tout en réduisant votre charge cognitive déclarative. Une SASU peut montrer un net élevé mais exiger une trésorerie suffisante pour payer l’IS, la paie, la TVA et vos acomptes d’IR personnels sur les revenus du foyer.`,
  `La durée du projet compte : une mission courte ou une phase de test se conjugue souvent au portage ou à la micro. Un cabinet pérenne avec recrutement futur, investissements lourds ou appels d’offres publics pousse plutôt vers une société. L’image « société » rassure certains donneurs d’ordre ; pour d’autres, seule la qualité du livrable importe.`,
  `Les erreurs fréquentes : copier le choix d’un collègue sans recalculer avec son propre TJM et son foyer fiscal ; négliger la TVA et les seuils de franchise ; oublier les coûts cachés (mutuelle, prévoyance, formation, expert-comptable) ; sous-estimer le temps passé sur l’administratif en société. Prévoyez ces postes dans votre modèle économique annuel.`,
  `Après lecture de ce guide, ouvrez le comparateur : vous verrez le net annuel et mensuel par statut sur votre profil. Prenez rendez-vous avec un expert-comptable pour les arbitrages personnels (couple, patrimoine, investissements locatifs, plus-values). Les chiffres produits par le site pour 2026 s’appuient sur des paramètres indicatifs issus des barèmes connus à la date de mise à jour : vérifiez toujours les textes officiels sur impots.gouv.fr et les communications Urssaf.`,
  `En résumé, le bon statut est celui qui maximise votre sérénité globale — financière, sociale et administrative — compte tenu de votre activité réelle, et pas seulement celui qui affiche le plus grand nombre sur une simulation isolée. Réévaluez votre choix chaque année lors de la clôture fiscale et des renégociations tarifaires avec vos clients.`,
  `Pour le référencement et la veille, croisez cet article avec les guides dédiés à chaque statut publiés sur le même site : vous y trouverez des développements sur le portage, la micro, l’EURL à l’IR, l’EURL à l’IS et la SASU. La cohérence entre vos hypothèses (TJM, jours, frais) et les résultats du simulateur détermine la qualité de votre projection ; gardez une marge prudente sur le chiffre d’affaires prévisionnel.`,
].join('\n\n');

export const LEGACY_CHOISIR_ARTICLE: Article = {
  slug: 'choisir-statut-freelance-2026',
  title: 'Comment choisir son statut freelance en 2026 ?',
  excerpt:
    'Méthode complète : portage, micro, EURL, SASU — critères de choix, erreurs à éviter, utilisation du comparateur et validation par un expert.',
  date: '2026-02-10',
  readingTime: '14 min',
  category: 'Comparatif statuts',
  imageUrl: IMG,
  content: CONTENT,
};
