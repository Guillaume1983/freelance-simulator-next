import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Une question sur le simulateur freelance ? Contactez-nous et obtenez une réponse sous 48h.',
  openGraph: {
    title: 'Contact | Freelance Simulateur',
    description: 'Contactez l\'équipe Freelance Simulateur pour toute question.',
    url: 'https://freelance-simulateur.fr/contact',
  },
  alternates: {
    canonical: 'https://freelance-simulateur.fr/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
