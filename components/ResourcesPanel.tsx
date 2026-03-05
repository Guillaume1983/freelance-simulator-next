'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { ARTICLES } from '@/lib/articles';

export default function ResourcesPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="hidden md:block">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed left-0 top-[140px] z-[120] bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 rounded-r-2xl px-2.5 py-3.5 shadow-lg hover:bg-white hover:border-indigo-300 dark:hover:border-indigo-500 transition-all"
          aria-label="Ouvrir le panneau Ressources"
        >
          <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-300" />
        </button>
      )}

      {open && (
        <aside className="fixed left-0 top-[80px] h-[calc(100vh-96px)] w-[360px] z-[120] px-3">
          <div className="panel-projection-bg card-pro h-full border border-white/15 flex flex-col overflow-hidden shadow-xl">
            <div className="relative z-10 px-4 py-3 border-b border-white/15 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200/90">
                  Articles & ressources
                </p>
                <p className="text-[11px] font-bold text-white">
                  Aller plus loin
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                aria-label="Replier le panneau Ressources"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {/* Articles */}
              <section>
                <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-indigo-200/90 mb-2">
                  Derniers articles
                </h3>
                <div className="space-y-2.5">
                  {ARTICLES.slice(0, 4).map((article) => (
                    <article
                      key={article.slug}
                      className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm px-2.5 py-2 flex gap-2.5 items-start hover:bg-white/15 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/20 bg-white/5">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-indigo-200/80 mb-0.5">
                          {article.category}
                        </p>
                        <h4 className="text-[11px] font-900 text-white leading-snug line-clamp-2">
                          {article.title}
                        </h4>
                        <p className="mt-0.5 text-[10px] text-white/80 leading-snug line-clamp-2">
                          {article.excerpt}
                        </p>
                        <p
                          className="mt-0.5 text-[9px] text-white/60"
                          suppressHydrationWarning
                        >
                          {new Date(article.date).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          · {article.readingTime}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="mt-3">
                  <Link
                    href="/articles"
                    className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-indigo-200 hover:text-white transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    Voir tous les articles
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

