import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description:
    'Mentions légales du site Freelance Simulateur : éditeur, hébergement, propriété intellectuelle.',
  openGraph: { url: 'https://www.freelance-simulateur.fr/mentions-legales' },
  alternates: { canonical: 'https://www.freelance-simulateur.fr/mentions-legales' },
  robots: { index: true, follow: true },
};

export default function MentionsLegalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
