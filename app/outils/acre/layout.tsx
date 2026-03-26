import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Outil ACRE 2026 — Impact sur les cotisations freelance',
  description:
    'Estimez l’économie de cotisations sociales grâce à l’ACRE 2026 pour les indépendants TNS et micro-entrepreneurs, avec une modélisation simplifiée des barèmes.',
  openGraph: {
    title: 'Outil ACRE 2026 | Freelance Simulateur',
    url: 'https://www.freelance-simulateur.fr/outils/acre',
  },
  alternates: { canonical: 'https://www.freelance-simulateur.fr/outils/acre' },
};

export default function OutilsAcreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
