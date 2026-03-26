import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comparateur statuts freelance 2026 — Portage, Micro, EURL, SASU',
  description:
    'Comparez en temps réel votre revenu net en portage salarial, micro-entreprise, EURL IR/IS et SASU à partir de votre TJM, de vos charges et de votre situation fiscale.',
  openGraph: {
    title: 'Comparateur statuts freelance 2026 | Freelance Simulateur',
    description: 'Comparez Portage, Micro, EURL et SASU. Visualisez votre revenu net et vos charges selon chaque statut.',
    url: 'https://www.freelance-simulateur.fr/comparateur',
  },
  alternates: { canonical: 'https://www.freelance-simulateur.fr/comparateur' },
};

export default function ComparateurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
