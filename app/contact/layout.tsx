import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactez Freelance Simulateur pour toute question sur le comparateur et les simulateurs de statuts freelance.',
  openGraph: { url: 'https://www.freelance-simulateur.fr/contact' },
  alternates: { canonical: 'https://www.freelance-simulateur.fr/contact' },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
