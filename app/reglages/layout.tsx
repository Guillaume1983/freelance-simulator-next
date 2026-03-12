import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Paramètres de simulation',
  description:
    'Configurez votre profil freelance : TJM, jours travaillés, charges, véhicule, situation fiscale, ACRE, CFE. Ces paramètres alimentent le comparateur et les simulateurs.',
  openGraph: { url: 'https://freelance-simulateur.fr/reglages' },
  alternates: { canonical: 'https://freelance-simulateur.fr/reglages' },
};

export default function ReglagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
