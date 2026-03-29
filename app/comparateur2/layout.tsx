import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comparateur — vue histogramme',
  description:
    'Comparez vos statuts freelance avec la même simulation que le comparateur classique, sous forme d’histogramme par statut.',
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Comparateur (histogramme) | Freelance Simulateur',
    url: 'https://www.freelance-simulateur.fr/comparateur2',
  },
  alternates: { canonical: 'https://www.freelance-simulateur.fr/comparateur2' },
};

export default function Comparateur2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
