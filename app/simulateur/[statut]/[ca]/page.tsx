import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';
import PalierSimulateurClient from './PalierSimulateurClient';
import {
  parsePalierCaSegment,
  STATUT_SLUG_TO_ID,
  getPalierSeoIntro,
  VALID_PALIER_CA,
  VALID_STATUT_SLUGS,
} from '@/lib/simulateur/paliers';

const CANONICAL_BASE = 'https://www.freelance-simulateur.fr';

type PageProps = { params: Promise<{ statut: string; ca: string }> };

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
  const canonical = `${CANONICAL_BASE}/simulateur/${encodeURIComponent(slug)}/${encodeURIComponent(ca)}`;
  const title = `${statutId} — ${Math.round(caNum / 1000)} k€ / an | Simulateur`;
  const description = getPalierSeoIntro(statutId, caNum);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

const fmtK = (n: number) => `${Math.round(n / 1000)} k€`;

export default async function SimulateurPalierPage({ params }: PageProps) {
  const { statut, ca } = await params;
  const slug = statut.toLowerCase();
  const caNum = parsePalierCaSegment(ca);
  const statutId = STATUT_SLUG_TO_ID[slug];
  if (!statutId || caNum == null) notFound();

  const otherPaliers = VALID_PALIER_CA.filter((p) => p !== caNum);

  return (
    <PalierSimulateurClient statutSlug={slug} caAnnual={caNum}>
      <section className="max-w-3xl mx-auto px-4 md:px-6 py-10 text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">
        <h1 className="sr-only">
          Simulation {statutId} à {fmtK(caNum)} de chiffre d&apos;affaires annuel
        </h1>

        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
          {statutId} à {fmtK(caNum)} / an : ce que montre cette simulation
        </h2>
        <p className="mb-3">
          {getPalierSeoIntro(statutId, caNum)}
        </p>
        <p className="mb-6">
          Pour une estimation plus précise, ajustez les paramètres depuis le{' '}
          <Link href={`/simulateur/${slug}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">simulateur {statutId} personnalisé</Link>
          {' '}ou utilisez le{' '}
          <Link href="/comparateur" className="text-indigo-600 dark:text-indigo-400 hover:underline">comparateur de statuts</Link>.
        </p>

        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
          Autres paliers de CA en {statutId}
        </h2>
        <div className="flex flex-wrap gap-1.5 mb-6">
          {otherPaliers.map((p) => (
            <Link
              key={p}
              href={`/simulateur/${slug}/${p}`}
              className="px-2.5 py-1 rounded-lg text-[13px] font-semibold bg-white/60 dark:bg-slate-800/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              {fmtK(p)} / an
            </Link>
          ))}
        </div>

        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
          Comparer avec un autre statut à {fmtK(caNum)}
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {VALID_STATUT_SLUGS.filter((s) => s !== slug).map((s) => (
            <Link
              key={s}
              href={`/simulateur/${s}/${caNum}`}
              className="px-2.5 py-1 rounded-lg text-[13px] font-semibold bg-white/60 dark:bg-slate-800/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              {STATUT_SLUG_TO_ID[s]}
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </PalierSimulateurClient>
  );
}
