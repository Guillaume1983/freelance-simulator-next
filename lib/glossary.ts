import { PLAFOND_MICRO_BIC, PLAFOND_MICRO_BNC } from '@/lib/constants';
import { PASS } from '@/lib/financial/rates';

const fmt = (n: number) =>
  n.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + '\u00a0€';

/** Première lettre pour regroupement A–Z (insensible aux accents). */
export function glossaryFirstLetter(term: string): string {
  const c = term
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .charAt(0)
    .toUpperCase();
  return /[A-Z]/u.test(c) ? c : '#';
}

/** Entrées du glossaire freelance / fiscal — textes indicatifs, non exhaustifs. */
export const GLOSSARY_ENTRIES: { id: string; term: string; definition: string }[] = [
  {
    id: 'acre',
    term: 'ACRE',
    definition:
      'Aide à la création ou à la reprise d’une entreprise : peut réduire temporairement une partie des cotisations sociales la première année selon les règles en vigueur. Dans Freelance Simulateur, l’ACRE est une option à activer ; les barèmes suivent la modélisation décrite sur la page Méthodologie du site.',
  },
  {
    id: 'bic',
    term: 'BIC',
    definition:
      'Bénéfices industriels et commerciaux : catégorie fiscale pour une activité de nature commerciale (vente, restauration, hébergement, etc.). En micro-entreprise, le plafond de chiffre d’affaires pour le commerce / réservation d’hébergement est distinct de celui des prestations de services.',
  },
  {
    id: 'bnc',
    term: 'BNC',
    definition:
      'Bénéfices non commerciaux : catégorie fiscale pour de nombreuses prestations de services « intellectuelles » ou libérales (conseil, développement, etc.), hors BIC.',
  },
  {
    id: 'ca',
    term: 'Chiffre d’affaires (CA)',
    definition:
      'Montant hors taxes facturé au titre de l’activité sur une période (souvent l’année civile). Dans le simulateur, le CA est dérivé du TJM et des jours facturés (avec croissance sur les années suivantes si vous la paramétrez).',
  },
  {
    id: 'cfe',
    term: 'CFE',
    definition:
      'Cotisation foncière des entreprises : taxe locale due par la plupart des entreprises et micro-entrepreneurs selon les règles applicables. Le simulateur applique un montant indicatif selon la taille de commune choisie (petite, moyenne, grande).',
  },
  {
    id: 'cotisations',
    term: 'Cotisations sociales',
    definition:
      'Prélèvements versés aux organismes de protection sociale (URSSAF, etc.) selon le statut : assuré social, travailleur non salarié (TNS), assimilé salarié, etc. Leur assiette et leur taux varient fortement selon la forme juridique et l’activité.',
  },
  {
    id: 'csg-crds',
    term: 'CSG / CRDS',
    definition:
      'Contributions sociales généralisées et contribution au remboursement de la dette sociale, prélevées notamment sur les revenus du patrimoine et certains revenus d’activité. Le détail des bases et taux dépend de la situation ; le simulateur applique des simplifications pour l’ordre de grandeur.',
  },
  {
    id: 'dividendes',
    term: 'Dividendes',
    definition:
      'Parts de bénéfices distribuées aux associés d’une société (ex. SASU). Ils peuvent être soumis à l’impôt sur le revenu (barème progressif ou flat tax selon les options) ou rester dans le cadre du régime de la société selon les cas.',
  },
  {
    id: 'eurl',
    term: 'EURL',
    definition:
      'Entreprise unipersonnelle à responsabilité limitée : société à associé unique souvent gérée par une personne physique. Peut être imposée à l’IR (régime du BNC ou du réel pour le gérant TNS) ou à l’IS selon les options et la situation.',
  },
  {
    id: 'flat-tax',
    term: 'Flat tax (PFU)',
    definition:
      'Prélèvement forfaitaire unique sur les revenus du capital et certains revenus de capitaux mobiliers (souvent 30 % tout compris dans les cas prévus par la loi). Les dividendes peuvent en bénéficier sous conditions ; comparer avec le barème progressif de l’IR peut être pertinent.',
  },
  {
    id: 'ir',
    term: 'Impôt sur le revenu (IR)',
    definition:
      'Impôt progressif calculé par tranches sur le revenu imposable du foyer, après abattements et réductions. Le nombre de parts du foyer modifie le barème. Le simulateur utilise des barèmes et abattements conformes à la modélisation annuelle du site.',
  },
  {
    id: 'is',
    term: 'Impôt sur les sociétés (IS)',
    definition:
      'Impôt dû par certaines sociétés sur leur résultat imposable. Taux réduit et taux normal selon les seuils légaux. Une société soumise à l’IS paie l’IS puis, selon les cas, rémunère le dirigeant ou distribue des dividendes.',
  },
  {
    id: 'ik',
    term: 'Indemnités kilométriques (IK)',
    definition:
      'Barème fiscal pour déduire ou rembourser les frais de déplacement professionnel avec un véhicule personnel, selon la distance et la puissance fiscale. L’outil « Indemnités km » du site reprend la logique du barème en vigueur.',
  },
  {
    id: 'micro',
    term: 'Micro-entreprise (régime micro)',
    definition:
      `Régime simplifié pour les très petites entreprises : cotisations calculées sur le chiffre d’affaires avec abattement forfaitaire pour frais, dans la limite de plafonds de CA. Pour les prestations de services (BNC / BIC services), le plafond est de ${fmt(PLAFOND_MICRO_BNC)} ; pour la vente / l’hébergement (BIC), ${fmt(PLAFOND_MICRO_BIC)} (barèmes en vigueur dans l’outil).`,
  },
  {
    id: 'net',
    term: 'Revenu net',
    definition:
      'Ce qui reste après déduction des cotisations sociales, des impôts sur le revenu modélisés et, selon les cas, de la rémunération ou des charges sociales sur la société. C’est une estimation indicatif pour comparer des statuts.',
  },
  {
    id: 'pass',
    term: 'PASS',
    definition:
      `Plafond annuel de la Sécurité sociale : référence pour de nombreux calculs de cotisations et plafonds. Valeur utilisée dans le moteur : ${fmt(PASS)}.`,
  },
  {
    id: 'parts',
    term: 'Parts (quotient familial)',
    definition:
      'Nombre de parts du foyer fiscal servant à diviser le revenu imposable avant application du barème de l’IR (adultes, enfants à charge, situations particulières). Plus le nombre de parts est élevé, plus l’impôt marginal peut baisser pour un même revenu.',
  },
  {
    id: 'portage',
    term: 'Portage salarial',
    definition:
      'Dispositif par lequel une entreprise de portage facture le client et verse une rémunération au consultant, qui est souvent assimilé salarié pour une partie des cotisations. Le simulateur modélise une commission de portage et des cotisations sur une base type rémunération.',
  },
  {
    id: 'prelevement-liberatoire',
    term: 'Prélèvement libératoire',
    definition:
      'Option en micro-entreprise sous conditions de niveau de revenu global : l’impôt sur le revenu et certaines contributions sont prélevés à un taux forfaitaire sur le CA au lieu du barème progressif. Vérifier les plafonds et conditions d’éligibilité.',
  },
  {
    id: 'sasu',
    term: 'SASU',
    definition:
      'Société par actions simplifiée unipersonnelle : forme de société souvent soumise à l’IS, avec un président généralement assimilé salarié pour les cotisations sociales sur la rémunération. Les dividendes suivent les règles de distribution et de fiscalité des associés.',
  },
  {
    id: 'tjm',
    term: 'TJM (taux journalier moyen)',
    definition:
      'Tarif journalier moyen facturé pour une prestation : base du calcul du chiffre d’affaires annuel avec le nombre de jours travaillés ou facturés dans le simulateur.',
  },
  {
    id: 'tns',
    term: 'TNS (travailleur non salarié)',
    definition:
      'Statut de protection sociale pour de nombreux indépendants (ex. gérant majoritaire d’EURL à l’IR, micro-entrepreneur selon les cas). Les cotisations et le droit aux prestations diffèrent du régime salarié.',
  },
  {
    id: 'tva',
    term: 'TVA',
    definition:
      'Taxe sur la valeur ajoutée : taxe indirecte sur la consommation. En dessous de certains seuils de chiffre d’affaires, une franchise en base peut exonérer de TVA. Au-delà, facturation avec TVA et obligations déclaratives.',
  },
  {
    id: 'urssaf',
    term: 'Urssaf',
    definition:
      'Organisme chargé du recouvrement d’une part importante des cotisations et contributions sociales pour les travailleurs indépendants et entreprises. Les taux micro-entreprise et les échéances sont fixés selon les règles et barèmes publiés.',
  },
].sort((a, b) => a.term.localeCompare(b.term, 'fr'));
