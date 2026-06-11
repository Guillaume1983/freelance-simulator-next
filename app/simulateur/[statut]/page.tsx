import SimulateurStatutView from '@/components/simulateur/SimulateurStatutView';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  SIMULATEUR_STATUT_CONTENT,
  SIMULATEUR_STATUT_DEFAULT,
  type SimulateurStatutSlug,
} from '@/lib/seo/simulateurStatutContent';
import { getSiteGlobalFaqPairs, getWebPageFaqJsonLd, SITE_URL } from '@/lib/seo/jsonLd';
import { VALID_PALIER_CA, STATUT_SLUG_TO_ID } from '@/lib/simulateur/paliers';

const fmtK = (n: number) => `${Math.round(n / 1000)} k€`;

export default async function SimulateurStatutPage({
  params,
}: {
  params: Promise<{ statut: string }>;
}) {
  const { statut } = await params;
  const slug = statut.toLowerCase() as SimulateurStatutSlug | string;
  const seo =
    slug in SIMULATEUR_STATUT_CONTENT
      ? SIMULATEUR_STATUT_CONTENT[slug as SimulateurStatutSlug]
      : null;

  const seoForJsonLd = seo ?? SIMULATEUR_STATUT_DEFAULT;
  const canonical = `${SITE_URL}/simulateur/${encodeURIComponent(slug)}`;
  const jsonLd = getWebPageFaqJsonLd({
    canonicalUrl: canonical,
    title: seoForJsonLd.title,
    description: seoForJsonLd.description,
    faqLists: [[...seoForJsonLd.faq], getSiteGlobalFaqPairs()],
  });

  const statutLabel = STATUT_SLUG_TO_ID[slug] ?? slug;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SimulateurStatutView>
        {seo && (
          <section className="max-w-7xl mx-auto px-4 md:px-6 py-10 text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">
            <h1 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-4">
              {seo.h1}
            </h1>

            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
              À propos de cette simulation
            </h2>
            <p className="mb-6">{seo.intro}</p>

            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
              Questions fréquentes
            </h2>
            <dl className="space-y-4 mb-6">
              {seo.faq.map(({ q, a }) => (
                <div key={q}>
                  <dt className="font-semibold text-slate-600 dark:text-slate-300">{q}</dt>
                  <dd className="mt-0.5">{a}</dd>
                </div>
              ))}
            </dl>

            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Simulations {statutLabel} par palier de CA
            </h2>
            <div className="flex flex-wrap gap-1.5 mb-6">
              {VALID_PALIER_CA.map((ca) => (
                <Link
                  key={ca}
                  href={`/simulateur/${slug}/${ca}`}
                  className="px-2.5 py-1 rounded-lg text-[13px] font-semibold bg-white/60 dark:bg-slate-800/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  {fmtK(ca)} / an
                </Link>
              ))}
            </div>

            <p className="text-[13px] text-slate-400 dark:text-slate-500">
              Comparez ce statut avec les autres via le{' '}
              <Link href="/comparateur" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                comparateur
              </Link>
              , ou consultez nos{' '}
              <Link href="/articles" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                guides détaillés
              </Link>
              .
            </p>
          </section>
        )}

        <Footer />
      </SimulateurStatutView>
    </>
  );
}
