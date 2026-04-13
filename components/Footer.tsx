'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-4 md:px-6 mt-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-2 min-h-[44px]">
          <Image src="/logo-icon.png" alt="" width={20} height={20} className="opacity-70 dark:opacity-60" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            © 2026 freelance-simulateur.fr
          </span>
        </div>

        <nav
          aria-label="Liens de pied de page"
          className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 sm:gap-x-2 md:gap-x-3 text-sm font-bold"
        >
          <Link
            href="/a-propos"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-2 text-slate-700 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            À propos
          </Link>
          <Link
            href="/hypotheses"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-2 text-slate-700 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            Méthodologie
          </Link>
          <Link
            href="/glossaire"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-2 text-slate-700 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            Glossaire
          </Link>
          <Link
            href="/bareme"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-2 text-slate-700 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            Barèmes
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-2 text-slate-700 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            Contact
          </Link>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600" aria-hidden>
            |
          </span>
          <Link
            href="/cgu"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-2 text-slate-700 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            CGU
          </Link>
          <Link
            href="/mentions-legales"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-2 text-center text-slate-700 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            Mentions légales
          </Link>
          <Link
            href="/confidentialite"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-2 text-slate-700 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            Confidentialité
          </Link>
        </nav>
      </div>
    </footer>
  );
}
