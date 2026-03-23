'use client';

import Link from 'next/link';
import { ARTICLES } from '@/lib/articles';
import Footer from '@/components/Footer';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function ArticlesPage() {
  return (
    <main className="min-h-screen bg-page-settings">

      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-indigo-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Retour à l&apos;accueil
          </Link>
          <div className="mt-6 flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-none">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Articles & guides
              </h1>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Comprendre les statuts freelance en profondeur et tirer le meilleur de votre simulateur.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="block"
            >
              <article className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xl transition-all">
                <div className="h-40 md:h-52 w-full overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="px-4 md:px-5 py-4 md:py-5 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                      {article.category}
                    </span>
                    <span
                      className="text-[10px] text-slate-400 font-semibold"
                      suppressHydrationWarning
                    >
                      {new Date(article.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      · {article.readingTime}
                    </span>
                  </div>
                  <h2 className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                    {article.title}
                  </h2>
                  <p className="text-[13px] md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {article.excerpt}
                  </p>
                  <p className="mt-2 text-[11px] font-black uppercase tracking-[0.16em] text-indigo-600 hover:text-indigo-700">
                    Lire la suite →
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </section>
      </div>

      <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <Footer />
      </div>
    </main>
  );
}

