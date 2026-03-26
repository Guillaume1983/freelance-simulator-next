import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions d’utilisation',
  description:
    'Conditions d’utilisation et avertissements concernant les simulateurs et comparateurs Freelance Simulateur.',
  openGraph: { url: 'https://www.freelance-simulateur.fr/cgu' },
  alternates: { canonical: 'https://www.freelance-simulateur.fr/cgu' },
  robots: { index: true, follow: true },
};

export default function CGULayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
