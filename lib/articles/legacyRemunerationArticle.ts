import type { Article } from '../articleTypes';

const IMG =
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&auto=format&fit=crop&q=80';

const CONTENT = [
  `Se rémunérer en EURL ou en SASU, c’est arbitrer entre résultat fiscal de la société, rémunération du dirigeant, dividendes éventuels et trésorerie disponible. Il n’y a pas de réponse unique : le taux d’imposition de l’IS, votre situation familiale, vos besoins de cash et les règles de cotisations sociales du gérant TNS ou du président assimilé salarié orientent le choix. Les chiffres présentés sur Freelance Simulateur pour l’EURL à l’IS et la SASU illustrent des scénarios types ; validez toujours votre stratégie avec un expert-comptable avant toute décision engageante.`,
  `En EURL à l’impôt sur les sociétés, la société paie l’IS sur son bénéfice après déduction des charges, dont la rémunération du gérant lorsqu’elle est comptabilisée comme charge. Le gérant est en général affilié au régime des travailleurs non salariés pour la part salariale des cotisations liées à sa rémunération. Les dividendes versés après impôt peuvent être soumis à un prélèvement forfaitaire unique ou intégrés au barème selon les options et les abattements en vigueur pour l’année considérée. La combinaison salaire TNS + dividendes doit être cohérente avec la trésorerie réelle et les obligations déclaratives.`,
  `En SASU, le président est souvent rémunéré comme assimilé salarié : la société établit une fiche de paie, paie des cotisations patronales et salariales, et le coût total pour l’entreprise est différent du simple montant « net » perçu sur le compte du dirigeant. Les dividendes restent une possibilité après décision des associés et sous réserve de bénéfices distribuables et de procédures de légale. La comparaison « net après impôt » entre EURL et SASU sur le simulateur tient compte de ces logiques différentes ; ne comparez pas un brut TNS à un net de bulletins sans ramener les deux à une base homogène.`,
  `Le niveau de rémunération fixe doit couvrir vos charges personnelles récurrentes : loyer ou crédit immobilier, famille, épargne, impôt sur le revenu personnel estimé. Une rémunération trop basse peut poser problème en matière sociale ou fiscale ; une rémunération trop élevée peut vider la trésorerie de la société et compliquer le financement des charges courantes (loyer professionnel, sous-traitance, TVA). Anticipez les acomptes d’impôt sur le revenu du foyer et, pour la société, l’échéancier de l’IS et de la CVAE lorsqu’elle s’applique.`,
  `Les dividendes peuvent alléger la charge sociale sur une partie des profits par rapport à une rémunération entièrement au titre du travail, mais ils ne remplacent pas un salaire suffisant lorsque vous travaillez à temps plein dans la structure ; l’administration attend une rémunération alignée avec les fonctions exercées. Les abattements sur dividendes et les options de PFU ou d’intégration au barème changent selon les lois de finances : vérifiez la notice de l’année sur impots.gouv.fr.`,
  `La trésorerie personnelle et celle de la société sont deux reservoirs distincts : augmenter les dividendes pour « se payer » alors que la société doit fournisseur ou Urssaf peut fragiliser l’entreprise. Inversement, laisser trop de cash en société sans projet d’investissement peut être sous-optimal selon votre horizon et votre fiscalité patrimoniale, sujet à traiter avec un conseiller.`,
  `Pour comparer EURL et SASU sur le simulateur, utilisez les mêmes hypothèses de chiffre d’affaires, de frais et de jours travaillés ; observez le net disponible annuel et mensuel, mais aussi le coût employeur ou la charge TNS implicite. Lisez les guides dédiés EURL à l’IS et SASU sur ce site pour le détail des paramètres intégrés au modèle 2026.`,
  `En conclusion, la rémunération optimale est celle qui respecte la réglementation, préserve la santé financière de la société et couvre vos besoins personnels après impôt. Documentez les décisions en assemblée ou en document unique associé lorsque la loi l’exige, et gardez une marge de trésorerie pour les imprévus fiscaux et sociaux.`,
].join('\n\n');

export const LEGACY_REMUNERATION_ARTICLE: Article = {
  slug: 'se-remunerer-en-sasu-vs-eurl',
  title: 'Se rémunérer en SASU vs EURL : salaire, dividendes et IS',
  excerpt:
    'TNS vs assimilé salarié, rémunération et dividendes, trésorerie et cohérence avec le simulateur : points de vigilance et validation comptable.',
  date: '2026-01-28',
  readingTime: '12 min',
  category: 'Sociétés',
  imageUrl: IMG,
  content: CONTENT,
};
