import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simulateur ACRE 2026',
  description: 'Calculez l\'impact de l\'ACRE sur vos cotisations sociales la première année. Exonération partielle pour créateurs d\'entreprise.',
  openGraph: {
    title: 'Simulateur ACRE 2026 | Freelance Simulateur',
    description: 'Calculez vos économies de cotisations avec l\'ACRE.',
    url: 'https://freelance-simulateur.fr/outils/acre',
  },
  alternates: {
    canonical: 'https://freelance-simulateur.fr/outils/acre',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
