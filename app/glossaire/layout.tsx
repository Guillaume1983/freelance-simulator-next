import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/jsonLd';

export const metadata: Metadata = {
  title: 'Glossaire freelance & fiscal',
  description:
    'Définitions courtes : TJM, micro-entreprise, EURL, SASU, portage, IR, IS, cotisations. Pour décrypter le comparateur et les simulateurs.',
  openGraph: {
    url: `${SITE_URL}/glossaire`,
    title: 'Glossaire freelance & fiscal | Freelance Simulateur',
    description:
      'TJM, micro-entreprise, EURL, SASU, portage, impôts, cotisations : définitions indicatives liées aux outils du site.',
  },
  alternates: { canonical: `${SITE_URL}/glossaire` },
  robots: { index: true, follow: true },
};

export default function GlossaireLayout({ children }: { children: React.ReactNode }) {
  return children;
}
