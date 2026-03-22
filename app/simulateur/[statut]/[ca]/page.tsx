import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PalierSimulateurClient from './PalierSimulateurClient';
import {
  parsePalierCaSegment,
  STATUT_SLUG_TO_ID,
  getPalierSeoIntro,
  VALID_PALIER_CA,
  VALID_STATUT_SLUGS,
} from '@/lib/simulateur/paliers';

type PageProps = { params: Promise<{ statut: string; ca: string }> };

/** Pré-génération des pages paliers (SEO / perf) */
export function generateStaticParams() {
  return VALID_STATUT_SLUGS.flatMap((statut) =>
    VALID_PALIER_CA.map((ca) => ({ statut, ca: String(ca) })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { statut, ca } = await params;
  const slug = statut.toLowerCase();
  const caNum = parsePalierCaSegment(ca);
  const statutId = STATUT_SLUG_TO_ID[slug];
  if (!statutId || caNum == null) {
    return { title: 'Palier simulateur' };
  }
  const title = `${statutId} — ${Math.round(caNum / 1000)} k€ / an | Simulateur`;
  const description = getPalierSeoIntro(statutId, caNum);
  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function SimulateurPalierPage({ params }: PageProps) {
  const { statut, ca } = await params;
  const slug = statut.toLowerCase();
  const caNum = parsePalierCaSegment(ca);
  if (!STATUT_SLUG_TO_ID[slug] || caNum == null) notFound();

  return <PalierSimulateurClient statutSlug={slug} caAnnual={caNum} />;
}
