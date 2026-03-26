import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Taux effectif IR — Barème impôt sur le revenu 2026',
  description:
    'Calculez votre taux effectif et votre tranche marginale d’impôt sur le revenu à partir de votre revenu imposable et du nombre de parts fiscales.',
  openGraph: {
    title: 'Taux effectif IR | Freelance Simulateur',
    url: 'https://www.freelance-simulateur.fr/outils/taux-effectif-ir',
  },
  alternates: { canonical: 'https://www.freelance-simulateur.fr/outils/taux-effectif-ir' },
};

export default function OutilsTauxEffectifIRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
