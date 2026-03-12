import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plafonds micro-entreprise 2026',
  description: 'Vérifiez les plafonds de chiffre d\'affaires en micro-entreprise BNC et BIC. Calculez votre marge avant dépassement.',
  openGraph: {
    title: 'Plafonds micro-entreprise 2026 | Freelance Simulateur',
    description: 'Seuils CA micro-entreprise BNC/BIC et marge restante.',
    url: 'https://freelance-simulateur.fr/outils/plafonds-micro',
  },
  alternates: {
    canonical: 'https://freelance-simulateur.fr/outils/plafonds-micro',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
