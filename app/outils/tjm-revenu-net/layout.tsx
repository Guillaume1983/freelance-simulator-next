import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TJM → Revenu net — Calculateur freelance 2026',
  description:
    'Calculez votre revenu net annuel à partir de votre TJM et du nombre de jours travaillés, en comparant Portage, Micro, EURL et SASU avec les barèmes 2026.',
  openGraph: {
    title: 'TJM → Revenu net | Freelance Simulateur',
    url: 'https://freelance-simulateur.fr/outils/tjm-revenu-net',
  },
  alternates: { canonical: 'https://freelance-simulateur.fr/outils/tjm-revenu-net' },
};

export default function OutilsTjmRevenuNetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
