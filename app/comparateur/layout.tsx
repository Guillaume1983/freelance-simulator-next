import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comparateur de statuts freelance',
  description: 'Comparez Portage salarial, Micro-entreprise, EURL IR, EURL IS et SASU. Visualisez votre revenu net, charges sociales et impôts selon chaque statut.',
  openGraph: {
    title: 'Comparateur de statuts freelance | Freelance Simulateur',
    description: 'Comparez les 5 statuts freelance et trouvez le plus avantageux pour votre situation.',
    url: 'https://freelance-simulateur.fr/comparateur',
  },
  alternates: {
    canonical: 'https://freelance-simulateur.fr/comparateur',
  },
};

export default function ComparateurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
