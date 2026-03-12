import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simulateur par statut freelance — Portage, Micro, EURL, SASU',
  description:
    'Simulateur détaillé par statut (portage salarial, micro-entreprise, EURL IR/IS, SASU) avec projection 5 ans, ACRE, CFE et options de rémunération.',
  openGraph: {
    title: 'Simulateur par statut | Freelance Simulateur',
    description: 'Projection 5 ans par statut freelance avec ACRE, CFE et options de rémunération.',
    url: 'https://freelance-simulateur.fr/simulateur',
  },
};

export default function SimulateurStatutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
