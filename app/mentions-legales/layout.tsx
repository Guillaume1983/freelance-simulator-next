import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales du site Freelance Simulateur : éditeur, hébergement, propriété intellectuelle et droit applicable.',
  openGraph: {
    title: 'Mentions légales | Freelance Simulateur',
    description: 'Informations légales sur le site Freelance Simulateur.',
    url: 'https://freelance-simulateur.fr/mentions-legales',
  },
  alternates: {
    canonical: 'https://freelance-simulateur.fr/mentions-legales',
  },
};

export default function MentionsLegalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
