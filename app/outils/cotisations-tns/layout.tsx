import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cotisations TNS — Gérant et professions libérales',
  description:
    'Estimation des cotisations sociales des travailleurs non salariés (TNS) : gérant EURL IR, professions libérales.',
  openGraph: { url: 'https://www.freelance-simulateur.fr/outils/cotisations-tns' },
  alternates: { canonical: 'https://www.freelance-simulateur.fr/outils/cotisations-tns' },
};

export default function OutilsCotisationsTnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
