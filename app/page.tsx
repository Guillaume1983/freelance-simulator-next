import type { Metadata } from 'next';
import HomePageClient from '@/components/HomePageClient';
import { getHomePageJsonLd } from '@/lib/seo/mainPagesJsonLd';
import { homePageMetadata } from '@/lib/seo/mainPagesMetadata';

export const metadata: Metadata = homePageMetadata;

const homeJsonLd = getHomePageJsonLd();

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <HomePageClient />
    </>
  );
}
