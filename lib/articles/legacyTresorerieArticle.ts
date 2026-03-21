import type { Article } from '../articleTypes';

const IMG =
  'https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=1200&auto=format&fit=crop&q=80';

const CONTENT = [
  `Un plan de trésorerie freelance n’est pas une mode comptable : c’est une projection des entrées et des sorties d’argent qui vous permet d’anticiper les mois serrés avant qu’ils ne deviennent des incidents de paiement. Contrairement au résultat comptable ou fiscal, la trésorerie obéit au calendrier réel des encaissements et des décaissements. Un bénéfice affiché peut coexister avec un compte bancaire vide si vos clients paient à soixante jours et que vous réglez fournisseurs et cotisations à trente jours.`,
  `Commencez par lister les encaissements prévisibles : factures déjà émises et échues, facturation récurrente, acomptes signés. Appliquez des délais de paiement réalistes par client — pas le délai légal théorique si votre pratique est différente. Ajoutez une marge d’imprévu pour les retards et les litiges mineurs. Côté sorties, incluez loyer professionnel ou coworking, logiciels, télécoms, assurance RC pro, expert-comptable, salaires ou rémunérations de dirigeant, Urssaf ou paie, TVA à reverser, impôt sur les sociétés ou acomptes d’IR personnel selon votre statut.`,
  `La TVA est un point aveugle fréquent : elle n’est pas un revenu ; c’est un collecté temporaire à restituer à l’administration. Votre tableau de trésorerie doit isoler la TVA encaissée et prévoir son paiement aux dates d’échéance. De même, les cotisations sociales ne suivent pas toujours le rythme du chiffre d’affaires : base trimestrielle ou mensuelle, régularisations annuelles — renseignez-vous sur votre calendrier Urssaf ou sur votre bulletin de paie en société.`,
  `Pour un indépendant en micro-entreprise, la simplicité du versement peut masquer des pics : versement libératoire ou IR à budgetier, CFE, cotisations sociales sur le CA déclaré. Un tableau mensuel avec une colonne « solde cumulé » montre vite si vous devez constituer une réserve équivalente à plusieurs mois de charges fixes.`,
  `Pour une EURL ou une SASU, séparez la trésorerie de la société de votre compte personnel. Le plan de trésorerie sociétaire inclut la paie, l’IS, les emprunts éventuels et les sous-traitants. Prévoyez les moments où l’IS et la TVA tombent la même semaine que les salaires : ce sont souvent les semaines critiques.`,
  `La réserve de sécurité : nombre de mois de charges fixes couverts par de la liquidité non engagée — trois à six mois est un ordre de grandeur souvent cité pour une activité stable ; une activité très saisonnière peut exiger plus. Cette réserve se construit quand les mois sont favorables, pas le jour où un client majeur disparaît.`,
  `Les outils vont du tableur simple (un onglet par mois, lignes d’entrées et de sorties) aux logiciels de facturation avec vision de trésorerie. L’important est la mise à jour hebdomadaire ou au moins mensuelle. Comparez le prévisionnel au réalisé : si vous vous trompez systématiquement sur les délais de paiement, ajustez vos hypothèses plutôt que le tableau.`,
  `Le simulateur Freelance Simulateur vous aide à dimensionner le revenu net après statut et charges typiques ; complétez-le avec votre plan de trésorerie pour voir si ce net est réellement disponible mois par mois. Si la projection affiche plusieurs mois négatifs consécutifs, agissez tôt : négociation d’acomptes, diversification des clients, réduction des charges fixes ou report d’investissements non urgents.`,
  `En synthèse, un bon plan de trésorerie freelance est court (trois à douze mois visibles), honnête sur les délais clients et rigoureux sur les échéances fiscales et sociales. Il se couple à un accompagnement comptable pour les obligations légales et à une discipline personnelle : ne confondez pas le chiffre d’affaires encaissé avec ce qui reste après impôts et cotisations.`,
].join('\n\n');

export const LEGACY_TRESORERIE_ARTICLE: Article = {
  slug: 'plan-de-tresorerie-freelance',
  title: 'Plan de trésorerie freelance : méthode et exemple',
  excerpt:
    'Encaissements, décaissements, TVA, cotisations et réserve — un cadre simple pour anticiper sans confondre bénéfice et cash disponible.',
  date: '2026-01-20',
  readingTime: '12 min',
  category: 'Gestion',
  imageUrl: IMG,
  content: CONTENT,
};
