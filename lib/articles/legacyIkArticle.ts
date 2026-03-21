import type { Article } from '../articleTypes';

const IMG =
  'https://images.unsplash.com/photo-1449965408867-eaa3c487b8a8?w=1200&auto=format&fit=crop&q=80';

const CONTENT = [
  `Les indemnités kilométriques permettent, sous conditions, de rembourser le coût d’usage d’un véhicule personnel pour des déplacements professionnels sans que ce remboursement constitue un revenu imposable pour le bénéficiaire. Pour un indépendant, la logique est différente de celle d’un salarié : vous ne « demandez » pas des IK à un employeur ; vous appliquez un barème forfaitaire ou vous comptabilisez des frais réels dans votre comptabilité, selon les règles du régime fiscal et social qui vous concernent. Cet article vulgarise les principes ; pour votre dossier précis, un expert-comptable reste la référence.`,
  `Le barème kilométrique administratif (souvent appelé barème fiscal) fixe un montant par kilomètre parcouru en fonction de la puissance fiscale du véhicule et, pour les véhicules électriques ou hybrides rechargeables, selon des règles spécifiques mises à jour régulièrement. Ce barème est conçu pour couvrir essence ou électricité, usure, entretien, assurance : il évite de justifier chaque ticket de péage au centime près lorsque vous optez pour le forfait. Les montants exacts pour l’année en cours figurent sur les notices officielles ; ne vous fiez pas à un tableau figé trouvé sur un blog sans vérification.`,
  `Pour qu’un trajet soit professionnel, il doit être nécessaire à l’exercice de votre activité : rendez-vous client, déplacement entre deux sites d’intervention, formation directement liée à votre mission. Le trajet domicile–lieu de travail habituel est en principe considéré comme personnel pour un indépendant qui travaille depuis un bureau fixe à domicile ; les exceptions sont rares et doivent être documentées. Les déplacements mixtes (privé et pro le même jour) nécessitent une ventilation prudente : tenir un carnet ou une application avec dates, kilomètres et motif professionnel.`,
  `La micro-entreprise applique un abattement forfaitaire sur le chiffre d’affaires : vous ne déduisez pas les frais au réel dans le cadre strict du régime micro. Les frais kilométriques ne s’ajoutent pas comme une ligne de déduction séparée dans cette logique ; l’abattement est censé représenter une partie des charges dont les déplacements. Si vos kilomètres professionnels sont très élevés par rapport à votre CA, un autre régime (réel simplifié ou société) peut parfois être plus favorable sur le plan fiscal — à modéliser avec un professionnel.`,
  `En régime réel (BIC ou BNC selon les cas), les frais de déplacement peuvent être intégrés à vos charges déductibles. Vous choisissez en général entre le barème kilométrique et les frais réels (carburant, entretien, assurance véhicule au prorata professionnel). Le barème simplifie la vie et évite des discussions sur le pourcentage d’usage pro ; les frais réels peuvent gagner si le véhicule est très majoritairement professionnel et coûteux à l’usage. Ne mélangez pas les deux méthodes pour un même véhicule sur une même période sans avis comptable.`,
  `Les sociétés (EURL, SASU) peuvent mettre à disposition un véhicule de société ou rembourser des frais au dirigeant selon des règles précises : frais de déplacement, véhicule de fonction, location longue durée. Chaque option a des conséquences en cotisations sociales et en fiscalité des avantages en nature. Une erreur classique est de croire que « tout ce qui roule » est automatiquement déductible à 100 % : l’administration attend une cohérence entre kilomètres déclarés, carnet d’entretien et activité déclarée.`,
  `Documentez vos kilomètres : relevé d’odomètre au début et à la fin de l’année ou par mission, liste des clients visités, factures associées. En cas de contrôle, la trace écrite fait la différence. Les applications mobiles d’itinéraire peuvent servir de mémo, mais une feuille de calcul simple avec date, client, distance et motif suffit souvent si elle est tenue au fil de l’eau.`,
  `Les péages, parkings et transports en commun pour un déplacement 100 % professionnel peuvent s’ajouter aux indemnités kilométriques ou être traités comme frais réels selon votre méthode. Conservez les justificatifs nominatifs lorsque c’est possible. Pour les hôtels et repas sur déplacement, des règles de notes de frais et de déduction s’appliquent — ne les confondez pas avec le barème kilométrique pur.`,
  `Optimiser légalement, ce n’est pas gonfler artificiellement les kilomètres : c’est choisir la méthode de déduction la plus fidèle à votre usage réel, regrouper les rendez-vous pour limiter les allers-retours, et aligner votre TJM avec le coût réel de mobilité dans vos devis. Si le véhicule représente une part importante de vos charges, intégrez cette information dans votre stratégie tarifaire et dans les hypothèses du simulateur Freelance Simulateur lorsque vous comparez les statuts.`,
  `En synthèse : retenez le barème officiel en vigueur, séparez clairement pro et perso, et harmonisez votre méthode avec votre régime fiscal. Pour une optimisation durable, planifiez une revue annuelle avec votre expert-comptable : les barèmes et les plafonds évoluent ; ce qui était optimal il y a deux ans peut ne plus l’être aujourd’hui.`,
].join('\n\n');

export const LEGACY_IK_ARTICLE: Article = {
  slug: 'optimiser-indemnites-kilometriques',
  title: 'Optimiser ses indemnités kilométriques en freelance',
  excerpt:
    'Barème, frais réels, micro-entreprise vs réel, documentation des trajets et cohérence avec votre activité — sans court-circuiter les règles.',
  date: '2026-02-05',
  readingTime: '13 min',
  category: 'Fiscalité',
  imageUrl: IMG,
  content: CONTENT,
};
