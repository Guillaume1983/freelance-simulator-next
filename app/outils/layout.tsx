import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Outils freelance — Calculateurs et simulateurs',
  description:
    'Calculatrices et simulateurs pour freelance et création d’entreprise : indemnités km, CFE, ACRE, plafonds micro, franchise TVA, TJM → revenu net, taux effectif IR, cotisations TNS.',
  openGraph: {
    title: 'Outils freelance | Freelance Simulateur',
    url: 'https://freelance-simulateur.fr/outils',
  },
  alternates: { canonical: 'https://freelance-simulateur.fr/outils' },
};

export default function OutilsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
