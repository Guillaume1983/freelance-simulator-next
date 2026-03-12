import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simulation 5 ans',
  description: 'Simulez votre revenu net sur 5 ans en tant que freelance. ACRE, CFE, croissance du CA : visualisez l\'évolution de vos revenus selon votre statut.',
  openGraph: {
    title: 'Simulation 5 ans | Freelance Simulateur',
    description: 'Projetez votre revenu freelance sur 5 ans avec ACRE, CFE et croissance du CA.',
    url: 'https://freelance-simulateur.fr/simulateur',
  },
  alternates: {
    canonical: 'https://freelance-simulateur.fr/simulateur',
  },
};

export default function SimulateurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
