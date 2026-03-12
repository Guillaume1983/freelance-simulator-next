import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculateur CFE 2026',
  description: 'Estimez votre Cotisation Foncière des Entreprises (CFE) selon votre ville et votre chiffre d\'affaires. Barèmes 2026.',
  openGraph: {
    title: 'Calculateur CFE 2026 | Freelance Simulateur',
    description: 'Estimez votre CFE selon votre commune et votre CA.',
    url: 'https://freelance-simulateur.fr/outils/cfe',
  },
  alternates: {
    canonical: 'https://freelance-simulateur.fr/outils/cfe',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
