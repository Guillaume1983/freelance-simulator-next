import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Articles et guides freelance',
  description: 'Guides complets pour comprendre les statuts freelance : Portage, Micro-entreprise, EURL, SASU. Conseils fiscaux et optimisations.',
  openGraph: {
    title: 'Articles et guides freelance | Freelance Simulateur',
    description: 'Tout comprendre sur les statuts freelance et optimiser votre situation.',
    url: 'https://freelance-simulateur.fr/articles',
  },
  alternates: {
    canonical: 'https://freelance-simulateur.fr/articles',
  },
};

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
