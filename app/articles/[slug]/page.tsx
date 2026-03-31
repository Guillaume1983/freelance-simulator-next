import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ARTICLES, getArticleBySlug } from '@/lib/articles';
import Footer from '@/components/Footer';
import { PageSettingsPageHeader } from '@/components/PageSettingsPageHeader';
import { getArticleJsonLd } from '@/lib/seo/jsonLd';
import { BookOpen, TrendingUp, BarChart3 } from 'lucide-react';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Article' };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.imageUrl],
    },
    alternates: { canonical: `https://www.freelance-simulateur.fr/articles/${slug}` },
  };
}

const ARTICLE_CTA: Record<string, { simulateur?: string; label: string; outils?: string; outilLabel?: string }> = {
  'portage-salarial-freelance-guide-complet-2026': { simulateur: '/simulateur/portage', label: 'Simuler votre revenu en portage salarial' },
  'micro-entreprise-auto-entrepreneur-guide-2026': { simulateur: '/simulateur/micro', label: 'Simuler votre revenu en micro-entreprise' },
  'eurl-ir-freelance-impot-revenu-guide-2026': { simulateur: '/simulateur/eurl-ir', label: 'Simuler votre revenu en EURL IR' },
  'eurl-is-freelance-impot-societes-guide-2026': { simulateur: '/simulateur/eurl-is', label: 'Simuler votre revenu en EURL IS' },
  'sasu-freelance-president-dividendes-guide-2026': { simulateur: '/simulateur/sasu', label: 'Simuler votre revenu en SASU' },
  'optimiser-indemnites-kilometriques': { outils: '/outils?outil=indemnites-km', outilLabel: 'Calculer vos indemnités kilométriques', label: 'Comparer les statuts freelance' },
  'se-remunerer-en-sasu-vs-eurl': { label: 'Comparer SASU et EURL dans le comparateur' },
  'choisir-statut-freelance-2026': { label: 'Comparer les statuts dans le comparateur' },
  'plan-de-tresorerie-freelance': { label: 'Simuler votre trésorerie sur 5 ans' },
};

function formatContent(text: string) {
  return text.split(/\n\n+/).map((block, i) => {
    const plain = block.replace(/\*\*(.+?)\*\*/g, '$1');
    return (
      <p key={i} className="mb-4 last:mb-0">
        {plain}
      </p>
    );
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const cta = ARTICLE_CTA[article.slug];
  const jsonLd = getArticleJsonLd(article);

  return (
    <main className="min-h-screen bg-page-settings">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageSettingsPageHeader
        backHref="/articles"
        backLabel="Retour aux articles"
        title={article.title}
        subtitle={article.excerpt}
      />

      <article className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <div className="relative h-48 md:h-64 w-full rounded-2xl overflow-hidden mb-6 bg-slate-200 dark:bg-slate-800">
          <Image
            src={article.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 mb-6">
          <span className="font-black uppercase tracking-[0.18em]">{article.category}</span>
          <span
            className="font-semibold"
            suppressHydrationWarning
          >
            {new Date(article.date).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <span>· {article.readingTime}</span>
        </div>
        <div className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
          {formatContent(article.content)}
        </div>

        {cta && (
          <div className="mt-8 p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-3">
              Aller plus loin
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {cta.simulateur && (
                <Link
                  href={cta.simulateur}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
                >
                  <TrendingUp size={15} />
                  {cta.label}
                </Link>
              )}
              {cta.outils && cta.outilLabel && (
                <Link
                  href={cta.outils}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
                >
                  {cta.outilLabel}
                </Link>
              )}
              <Link
                href="/comparateur"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-sm font-bold border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
              >
                <BarChart3 size={15} />
                Comparer les statuts
              </Link>
            </div>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
          >
            <BookOpen size={16} />
            Voir tous les articles
          </Link>
        </div>
      </article>

      <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <Footer />
      </div>
    </main>
  );
}
