import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculateur cotisations TNS 2026',
  description: 'Estimez vos cotisations sociales en tant que Travailleur Non Salarié (TNS). Gérant EURL, profession libérale : barèmes 2026.',
  openGraph: {
    title: 'Cotisations TNS 2026 | Freelance Simulateur',
    description: 'Calculez vos cotisations sociales TNS avec les barèmes 2026.',
    url: 'https://freelance-simulateur.fr/outils/cotisations-tns',
  },
  alternates: {
    canonical: 'https://freelance-simulateur.fr/outils/cotisations-tns',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
