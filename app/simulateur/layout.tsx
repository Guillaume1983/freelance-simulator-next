import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simulation freelance 5 ans : portage, micro, EURL, SASU (gratuit)',
  description:
    'Simulations par statut sur 5 ans pour indépendants : portage salarial, micro-entreprise (auto-entrepreneur), EURL à l’IR ou à l’IS, SASU. Revenu net, cotisations et fiscalité — croissance du CA, ACRE, CFE selon le cas. Barèmes 2026, indicatif.',
  keywords: [
    'simulation freelance',
    'simulation auto-entrepreneur',
    'simulation portage salarial',
    'simulation micro entreprise',
    'simulation EURL',
    'simulation SASU',
    'simulateur 5 ans',
  ],
  openGraph: {
    title: 'Simulation freelance 5 ans | Freelance Simulateur',
    description:
      'Choisissez votre statut : simulation portage, micro, EURL ou SASU sur 5 ans avec les barèmes en vigueur.',
    url: 'https://www.freelance-simulateur.fr/simulateur',
  },
  alternates: { canonical: 'https://www.freelance-simulateur.fr/simulateur' },
};

export default function SimulateurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
