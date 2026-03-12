import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Calculateur indemnités kilométriques 2026',
  description: 'Calculez vos indemnités kilométriques avec le barème URSSAF 2026. Voiture, moto, véhicule électrique : obtenez le montant exact de vos IK.',
  openGraph: {
    title: 'Indemnités kilométriques 2026 | Freelance Simulateur',
    description: 'Barème URSSAF 2026 pour calculer vos indemnités kilométriques.',
    url: 'https://freelance-simulateur.fr/outils/indemnites-km',
  },
  alternates: {
    canonical: 'https://freelance-simulateur.fr/outils/indemnites-km',
  },
};

export default function IndemnitesKmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
