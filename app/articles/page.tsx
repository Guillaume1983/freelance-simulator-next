'use client';

import Link from 'next/link';
import { ARTICLES } from '@/lib/articles';

export default function ArticlesPage() {
  return (
    <main className="min-h-screen bg-page-pro relative">
      {/* Grille et blobs déjà gérés sur la home, ici on reste simple */}
      <div className="top-accent-bar" aria-hidden />

      <div className="relative z-10 max-w-[960px] mx-auto px-4 md:px-6 pt-8 pb-12">
        <header className="mb-6 md:mb-8">
          <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
            Articles & ressources
          </p>
          <h1 className="mt-2 text-2xl md:text-3xl font-black tracking-tight text-slate-900">
            Comprendre les statuts freelance en profondeur
          </h1>
          <p className="mt-2 text-[13px] md:text-sm text-slate-600 max-w-2xl">
            Une sélection de contenus pour éclairer vos choix entre portage, micro, EURL, SASU et pour tirer le meilleur de
            votre simulateur.
          </p>
        </header>

        <section className="space-y-4">
          {ARTICLES.map((article) => (
            <article
              key={article.slug}
              className="card-pro bg-white/95 px-4 md:px-5 py-4 md:py-5 border border-slate-200/80 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  {article.category}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {new Date(article.date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  · {article.readingTime}
                </span>
              </div>
              <h2 className="text-base md:text-lg font-900 tracking-tight text-slate-900">
                {article.title}
              </h2>
              <p className="text-[13px] md:text-sm text-slate-600 leading-relaxed">
                {article.excerpt}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <Link
                  href="/"
                  className="text-[11px] font-black uppercase tracking-[0.16em] text-indigo-600 hover:text-indigo-700"
                >
                  Revenir au simulateur
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

