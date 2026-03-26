import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plafonds micro-entreprise — BNC / BIC 2026',
  description:
    'Plafonds de chiffre d’affaires de la micro-entreprise (83 600 € prestations, 203 100 € vente) et reste à facturer avant dépassement.',
  openGraph: { url: 'https://www.freelance-simulateur.fr/outils/plafonds-micro' },
  alternates: { canonical: 'https://www.freelance-simulateur.fr/outils/plafonds-micro' },
};

export default function OutilsPlafondsMicroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
