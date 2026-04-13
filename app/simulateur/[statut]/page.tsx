import SimulateurStatutView from '@/components/simulateur/SimulateurStatutView';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  SIMULATEUR_STATUT_CONTENT,
  type SimulateurStatutSlug,
} from '@/lib/seo/simulateurStatutContent';

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

  return (
    <SimulateurStatutView>
      {seo && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-10 text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">
          <h1 className="sr-only">{seo.h1}</h1>

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
  );
}
