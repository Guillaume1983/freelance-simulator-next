import type { Metadata } from 'next';
import { getWebPageFaqJsonLd, SITE_URL } from '@/lib/seo/jsonLd';
import {
  getSimulateurStatutSeo,
  isSimulateurStatutSlug,
} from '@/lib/seo/simulateurStatutContent';

const ogImage = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: 'Freelance Simulateur — simulateur par statut',
} as const;

type Props = { children: React.ReactNode; params: Promise<{ statut: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { statut } = await params;
  const slug = (statut ?? '').toLowerCase();
  const seo = getSimulateurStatutSeo(slug);
  const canonical = `${SITE_URL}/simulateur/${encodeURIComponent(slug)}`;

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical },
    openGraph: {
      title: `${seo.title} | Freelance Simulateur`,
      description: seo.description,
      url: canonical,
      siteName: 'Freelance Simulateur',
      locale: 'fr_FR',
      type: 'website',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${seo.title} | Freelance Simulateur`,
      description: seo.description,
      images: ['/og-image.png'],
    },
  };
}

export default async function SimulateurStatutLayout({ children, params }: Props) {
  const { statut } = await params;
  const slug = (statut ?? '').toLowerCase();
  const seo = getSimulateurStatutSeo(slug);
  const canonical = `${SITE_URL}/simulateur/${encodeURIComponent(slug)}`;

  const structured = isSimulateurStatutSlug(slug)
    ? getWebPageFaqJsonLd({
        canonicalUrl: canonical,
        title: seo.title,
        description: seo.description,
        faq: seo.faq,
      })
    : null;

  return (
    <>
      {structured ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }}
        />
      ) : null}
      {children}
    </>
  );
}
