import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simulateur freelance 5 ans — Portage, Micro, EURL, SASU',
  description:
    'Projetez votre activité freelance sur 5 ans : portage salarial, micro-entreprise, EURL IR/IS et SASU, avec croissance du chiffre d’affaires et options selon le statut (ACRE, CFE, etc. lorsque le modèle les intègre).',
  openGraph: {
    title: 'Simulateur freelance 5 ans | Freelance Simulateur',
    description: 'Simulation 5 ans par statut : Portage, Micro, EURL, SASU — paramètres et options selon le cas.',
    url: 'https://www.freelance-simulateur.fr/simulateur',
  },
  alternates: { canonical: 'https://www.freelance-simulateur.fr/simulateur' },
};

export default function SimulateurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
