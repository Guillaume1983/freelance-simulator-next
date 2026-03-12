import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Franchise de TVA 2026',
  description: 'Vérifiez si vous êtes éligible à la franchise en base de TVA. Seuils 2026 : 91 900 euros pour les services, 101 000 euros pour le commerce.',
  openGraph: {
    title: 'Franchise de TVA 2026 | Freelance Simulateur',
    description: 'Seuils de franchise TVA et position par rapport à votre CA.',
    url: 'https://freelance-simulateur.fr/outils/franchise-tva',
  },
  alternates: {
    canonical: 'https://freelance-simulateur.fr/outils/franchise-tva',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
