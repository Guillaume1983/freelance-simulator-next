import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Indemnités kilométriques — Barème URSSAF',
  description:
    'Calculez vos indemnités kilométriques selon le barème fiscal (voiture, moto, cyclo, électrique) et appliquez-les à vos paramètres de simulation.',
  openGraph: { url: 'https://freelance-simulateur.fr/outils/indemnites-km' },
  alternates: { canonical: 'https://freelance-simulateur.fr/outils/indemnites-km' },
};

export default function IndemnitesKmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
