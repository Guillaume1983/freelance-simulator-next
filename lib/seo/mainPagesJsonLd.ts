import { getSiteGlobalFaqPairs, getWebPageFaqJsonLd, SITE_URL } from '@/lib/seo/jsonLd';
import {
  comparateurSeo,
  homePageDescription,
  homePageTitleAbsolute,
  outilsSeo,
} from '@/lib/seo/mainPagesMetadata';

const COMPARATEUR_FAQ = [
  {
    q: 'Quel est le statut le plus avantageux en freelance ?',
    a: "Il n'existe pas de réponse universelle : le meilleur statut dépend de votre chiffre d'affaires, de vos charges déductibles, de votre situation familiale et de vos objectifs (protection sociale, retraite, dividendes). Le comparateur vous aide à objectiver la différence de revenu net entre chaque option.",
  },
  {
    q: 'Comment sont calculées les cotisations ?',
    a: 'Les cotisations sont estimées selon les taux en vigueur pour chaque régime : taux forfaitaire en micro-entreprise, barème TNS détaillé pour l’EURL IR, cotisations TNS forfaitaires (environ 45 %) pour l’EURL IS, cotisations assimilé salarié (environ 82 % du net) pour la SASU et le portage. Le comparateur part d’une situation type année 2 : l’ACRE (première année) n’y est pas appliquée. Utilisez le simulateur 5 ans pour la modéliser.',
  },
  {
    q: 'Comment fonctionne la SASU dans le comparateur ?',
    a: 'Le président de SASU peut mixer salaire (cotisations assimilé salarié + IR progressif) et dividendes (IS PME puis PFU 30 %). Le curseur « Part salaire » ajuste ce mix. À haut CA, les dividendes au PFU fixe deviennent souvent plus avantageux que les tranches IR élevées.',
  },
  {
    q: 'Puis-je simuler sur plusieurs années ?',
    a: 'Oui. Le simulateur 5 ans projette votre activité avec un taux de croissance du CA, l’ACRE la première année et la CFE à partir de la deuxième.',
  },
  {
    q: 'La CFE est-elle prise en compte ?',
    a: 'Oui. Le comparateur calcule en régime de croisière (année 2) : la CFE est incluse selon la taille de ville (fourchette indicative 300 € à 900 €/an). Elle est exonérée la première année uniquement.',
  },
  {
    q: 'Comment personnaliser les paramètres ?',
    a: 'Ajustez le TJM, les jours travaillés, les charges et la situation fiscale depuis le panneau de réglages (bouton Réglages sur mobile).',
  },
] as const;

const OUTILS_FAQ = [
  {
    q: 'Comment calculer mes indemnités kilométriques ?',
    a: 'Renseignez votre kilométrage annuel professionnel et la puissance fiscale de votre véhicule. L’outil applique le barème fiscal en vigueur pour estimer le montant déductible.',
  },
  {
    q: "Qu'est-ce que l'ACRE ?",
    a: "L'ACRE (aide aux créateurs et repreneurs d'entreprise) réduit vos cotisations sociales la première année d'activité. L'outil estime l'économie selon votre statut et votre chiffre d'affaires.",
  },
  {
    q: 'Comment convertir un TJM en revenu net annuel ?',
    a: "L'outil multiplie votre TJM par le nombre de jours travaillés, puis déduit les cotisations et l'impôt estimés pour chaque statut pour un ordre de grandeur du net disponible.",
  },
] as const;

export function getHomePageJsonLd() {
  return getWebPageFaqJsonLd({
    canonicalUrl: SITE_URL,
    title: homePageTitleAbsolute,
    description: homePageDescription,
    faqLists: [getSiteGlobalFaqPairs()],
  });
}

export function getComparateurPageJsonLd() {
  return getWebPageFaqJsonLd({
    canonicalUrl: `${SITE_URL}/comparateur`,
    title: comparateurSeo.title,
    description: comparateurSeo.description,
    faqLists: [[...COMPARATEUR_FAQ], getSiteGlobalFaqPairs()],
  });
}

export function getOutilsPageJsonLd() {
  return getWebPageFaqJsonLd({
    canonicalUrl: `${SITE_URL}/outils`,
    title: outilsSeo.title,
    description: outilsSeo.description,
    faqLists: [[...OUTILS_FAQ], getSiteGlobalFaqPairs()],
  });
}
