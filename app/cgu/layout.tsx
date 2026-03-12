import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions d\'utilisation',
  description: 'Conditions d\'utilisation du simulateur freelance : avertissements, limitations de responsabilité et usage autorisé.',
  openGraph: {
    title: 'Conditions d\'utilisation | Freelance Simulateur',
    description: 'CGU et avertissements du simulateur freelance.',
    url: 'https://freelance-simulateur.fr/cgu',
  },
  alternates: {
    canonical: 'https://freelance-simulateur.fr/cgu',
  },
};

export default function CGULayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
