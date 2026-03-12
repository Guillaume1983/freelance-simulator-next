import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Outils et calculatrices freelance',
  description: 'Calculatrices gratuites : indemnités kilométriques, CFE, ACRE, plafonds micro-entreprise, franchise TVA, TJM, taux IR et cotisations TNS.',
  openGraph: {
    title: 'Outils et calculatrices freelance | Freelance Simulateur',
    description: 'Tous les outils pour calculer vos charges, impôts et optimisations en freelance.',
    url: 'https://freelance-simulateur.fr/outils',
  },
  alternates: {
    canonical: 'https://freelance-simulateur.fr/outils',
  },
};

export default function OutilsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
