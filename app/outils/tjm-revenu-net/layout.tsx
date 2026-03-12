import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Convertisseur TJM vers revenu net',
  description: 'Convertissez votre TJM (Taux Journalier Moyen) en revenu net mensuel et annuel. Estimation rapide selon votre statut freelance.',
  openGraph: {
    title: 'TJM vers revenu net | Freelance Simulateur',
    description: 'Calculez votre revenu net à partir de votre TJM.',
    url: 'https://freelance-simulateur.fr/outils/tjm-revenu-net',
  },
  alternates: {
    canonical: 'https://freelance-simulateur.fr/outils/tjm-revenu-net',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
