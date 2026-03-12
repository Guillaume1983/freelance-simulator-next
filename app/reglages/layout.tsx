import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Paramètres de simulation',
  description: 'Configurez votre profil freelance : TJM, jours travaillés, charges, véhicule, situation fiscale. Ces paramètres alimentent vos simulations.',
  openGraph: {
    title: 'Paramètres de simulation | Freelance Simulateur',
    description: 'Personnalisez vos simulations freelance avec vos vrais paramètres.',
    url: 'https://freelance-simulateur.fr/reglages',
  },
  alternates: {
    canonical: 'https://freelance-simulateur.fr/reglages',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ReglagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
