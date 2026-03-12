import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CFE — Cotisation foncière des entreprises',
  description:
    'Estimation de la cotisation foncière des entreprises (CFE) selon la taille de la ville, pour EURL, SASU et micro-entreprise.',
  openGraph: { url: 'https://freelance-simulateur.fr/outils/cfe' },
  alternates: { canonical: 'https://freelance-simulateur.fr/outils/cfe' },
};

export default function OutilsCfeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
