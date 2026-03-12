import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Franchise de TVA — Seuils 2026',
  description:
    'Seuils de franchise de TVA (91 000 € / 36 500 €) et position par rapport à votre chiffre d’affaires.',
  openGraph: { url: 'https://freelance-simulateur.fr/outils/franchise-tva' },
  alternates: { canonical: 'https://freelance-simulateur.fr/outils/franchise-tva' },
};

export default function OutilsFranchiseTvaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
