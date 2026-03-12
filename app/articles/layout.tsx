import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guides et articles freelance',
  description:
    'Guides et articles pour freelances : statuts, fiscalité, portage salarial, micro-entreprise, EURL, SASU.',
  openGraph: { url: 'https://freelance-simulateur.fr/articles' },
  alternates: { canonical: 'https://freelance-simulateur.fr/articles' },
};

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
