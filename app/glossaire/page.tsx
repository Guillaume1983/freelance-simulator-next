import Link from 'next/link';
import Footer from '@/components/Footer';
import { SitePageHeader } from '@/components/SitePageHeader';
import { GLOSSARY_ENTRIES, glossaryFirstLetter } from '@/lib/glossary';
import { SITE_URL } from '@/lib/seo/jsonLd';

export default function GlossairePage() {
  const letterSet = new Set<string>();
  for (const e of GLOSSARY_ENTRIES) {
    letterSet.add(glossaryFirstLetter(e.term));
  }
  const letters = [...letterSet].sort((a, b) => a.localeCompare(b, 'fr'));

  let prevLetter = '';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'Glossaire freelance & fiscal · Freelance Simulateur',
    hasDefinedTerm: GLOSSARY_ENTRIES.map((e) => ({
      '@type': 'DefinedTerm',
      name: e.term,
      description: e.definition.replace(/\s+/g, ' ').slice(0, 500),
      url: `${SITE_URL}/glossaire#${e.id}`,
    })),
  };

  return (
    <main className="min-h-screen bg-page-settings">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SitePageHeader
        title="Glossaire"
        description="Termes fréquents autour du statut freelance, de la fiscalité et des cotisations, à titre pédagogique et indicatif."
      />

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-8 text-sm text-slate-700 dark:text-slate-300">
        <p className="leading-relaxed">
          Ces définitions ne remplacent pas un conseil personnalisé. Pour le détail des calculs utilisés dans l’outil, voir la{' '}
          <Link href="/hypotheses" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            méthodologie
          </Link>{' '}
          et les{' '}
          <Link href="/cgu" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            conditions d’utilisation
          </Link>
          .
        </p>

        <nav aria-label="Accès rapide par lettre" className="flex flex-wrap gap-2">
          {letters.map((L) => (
            <a
              key={L}
              href={`#lettre-${L}`}
              className="inline-flex min-w-[2rem] items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:border-slate-600 dark:bg-slate-800/50 dark:text-indigo-400 dark:hover:bg-slate-800"
            >
              {L}
            </a>
          ))}
        </nav>

        <div className="space-y-10">
          {GLOSSARY_ENTRIES.map((e) => {
            const L = glossaryFirstLetter(e.term);
            const showLetter = L !== prevLetter;
            prevLetter = L;
            return (
              <div key={e.id}>
                {showLetter && (
                  <h2
                    id={`lettre-${L}`}
                    className="mb-4 scroll-mt-28 text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500"
                  >
                    {L}
                  </h2>
                )}
                <section id={e.id} className="scroll-mt-28 border-b border-slate-200 pb-8 last:border-0 dark:border-slate-700">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{e.term}</h3>
                  <p className="mt-2 leading-relaxed">{e.definition}</p>
                </section>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-800/40">
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Passer à l’action :{' '}
            <Link href="/bareme" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              barèmes utilisés dans l’outil
            </Link>
            ,{' '}
            <Link href="/comparateur" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              comparateur de statuts
            </Link>
            ,{' '}
            <Link href="/simulateur" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              simulateur sur 5 ans
            </Link>
            , ou les{' '}
            <Link href="/outils" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              outils
            </Link>
            .
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
