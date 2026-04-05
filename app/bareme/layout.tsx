import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/jsonLd';

export const metadata: Metadata = {
  title: 'Barèmes & plafonds utilisés dans les simulations',
  description:
    'PASS, plafonds micro-entreprise, barème IR, IS, cotisations modélisées, IK. Valeurs alignées sur les fichiers de calcul du site (référence 2026).',
  openGraph: {
    url: `${SITE_URL}/bareme`,
    title: 'Barèmes & plafonds | Freelance Simulateur',
    description:
      'Synthèse des constantes financières utilisées par le comparateur et les simulateurs (sources techniques du site).',
  },
  alternates: { canonical: `${SITE_URL}/bareme` },
  robots: { index: true, follow: true },
};

export default function BaremeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
