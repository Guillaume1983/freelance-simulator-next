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
    <>
      <PalierSimulateurClient statutSlug={slug} caAnnual={caNum} />

      <section className="max-w-4xl mx-auto px-4 md:px-6 py-12 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
        <h1 className="sr-only">
          Simulation {statutId} à {fmtK(caNum)} de chiffre d&apos;affaires annuel
        </h1>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          {statutId} à {fmtK(caNum)} / an : ce que montre cette simulation
        </h2>
        <p className="mb-4">
          {getPalierSeoIntro(statutId, caNum)}
        </p>
        <p className="mb-8">
          Pour obtenir une estimation plus précise, ajustez les paramètres (TJM, charges réelles, situation familiale) depuis le{' '}
          <Link href={`/simulateur/${slug}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">simulateur {statutId} personnalisé</Link>
          {' '}ou utilisez le{' '}
          <Link href="/comparateur" className="text-indigo-600 dark:text-indigo-400 hover:underline">comparateur de statuts</Link>
          {' '}pour confronter ce régime aux autres options.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
          Autres paliers de CA en {statutId}
        </h2>
        <div className="flex flex-wrap gap-2 mb-8">
          {otherPaliers.map((p) => (
            <Link
              key={p}
              href={`/simulateur/${slug}/${p}`}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              {fmtK(p)} / an
            </Link>
          ))}
        </div>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
          Comparer avec un autre statut à {fmtK(caNum)}
        </h2>
        <div className="flex flex-wrap gap-2">
          {VALID_STATUT_SLUGS.filter((s) => s !== slug).map((s) => (
            <Link
              key={s}
              href={`/simulateur/${s}/${caNum}`}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              {STATUT_SLUG_TO_ID[s]}
            </Link>
          ))}
        </div>
      </section>

      <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <Footer />
      </div>
    </>
  );
}
