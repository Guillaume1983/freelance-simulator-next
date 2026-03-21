import type { Metadata } from 'next';

const BASE = 'https://freelance-simulateur.fr';

/** Métadonnées et canonical distincts par URL pour l’indexation (évite tout vers /simulateur). */
const META_BY_SLUG: Record<
  string,
  { title: string; description: string }
> = {
  portage: {
    title: 'Simulateur portage salarial — revenu net sur 5 ans',
    description:
      'Simulez votre salaire net en portage salarial sur 5 ans : frais de gestion, cotisations, ACRE et évolution du chiffre d’affaires. Indicatif, barèmes 2026.',
  },
  micro: {
    title: 'Simulateur micro-entreprise — net après cotisations et impôt',
    description:
      'Projection 5 ans en micro-entreprise : plafonds, versement libératoire ou IR, ACRE, CFE et croissance du CA pour estimer votre revenu net.',
  },
  'eurl-ir': {
    title: 'Simulateur EURL à l’IR — gérant TNS, projection 5 ans',
    description:
      'Simulez une EURL à l’impôt sur le revenu : résultat, cotisations TNS, IR du foyer et charges réelles sur 5 ans.',
  },
  'eurl-is': {
    title: 'Simulateur EURL à l’IS — IS, rémunération et résultat',
    description:
      'Projection 5 ans pour une EURL à l’impôt sur les sociétés : IS, rémunération du gérant, dividendes et trésorerie indicative.',
  },
  sasu: {
    title: 'Simulateur SASU — IS, salaire président et dividendes',
    description:
      'Simulez une SASU sur 5 ans : impôt sur les sociétés, rémunération assimilée salarié, dividendes (PFU), ACRE et CFE.',
  },
};

const DEFAULT_META = {
  title: 'Simulateur par statut freelance — Portage, Micro, EURL, SASU',
  description:
    'Simulateur détaillé par statut (portage salarial, micro-entreprise, EURL IR/IS, SASU) avec projection 5 ans, ACRE, CFE et options de rémunération.',
};

type Props = { params: Promise<{ statut: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { statut } = await params;
  const slug = (statut ?? '').toLowerCase();
  const meta = META_BY_SLUG[slug] ?? DEFAULT_META;
  const canonical = `${BASE}/simulateur/${encodeURIComponent(slug)}`;

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical },
    openGraph: {
      title: `${meta.title} | Freelance Simulateur`,
      description: meta.description,
      url: canonical,
      siteName: 'Freelance Simulateur',
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${meta.title} | Freelance Simulateur`,
      description: meta.description,
    },
  };
}

export default function SimulateurStatutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
