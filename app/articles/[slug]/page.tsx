import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ARTICLES, getArticleBySlug } from '@/lib/articles';
import Footer from '@/components/Footer';
import { ArrowLeft, BookOpen } from 'lucide-react';

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

function formatContent(text: string) {
  return text.split(/\n\n+/).map((block, i) => {
    const html = block.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return <p key={i} className="mb-4 last:mb-0" dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <main className="min-h-screen bg-page-settings">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-indigo-100 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Retour aux articles
          </Link>
        </div>
      </header>

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
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 mb-2">
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
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
          {article.title}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
          {article.excerpt}
        </p>
        <div className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 [&_strong]:font-bold [&_strong]:text-slate-900 dark:[&_strong]:text-white">
          {formatContent(article.content)}
        </div>
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
