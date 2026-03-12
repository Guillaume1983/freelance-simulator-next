import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculateur taux effectif IR 2026',
  description: 'Calculez votre taux marginal et taux effectif d\'imposition sur le revenu. Barème IR 2026 avec tranches et quotient familial.',
  openGraph: {
    title: 'Taux effectif IR 2026 | Freelance Simulateur',
    description: 'Calculez votre taux d\'imposition réel avec le barème 2026.',
    url: 'https://freelance-simulateur.fr/outils/taux-effectif-ir',
  },
  alternates: {
    canonical: 'https://freelance-simulateur.fr/outils/taux-effectif-ir',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
