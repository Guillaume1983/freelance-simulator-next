'use client';
import Link from 'next/link';
import { LineChart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-4 md:px-6 mt-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-900 dark:bg-indigo-600 p-1.5 rounded-lg">
            <LineChart className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
            © 2026 freelance-simulateur.fr
          </span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-bold text-slate-400 dark:text-slate-500">
          <Link href="/a-propos" className="hover:text-indigo-600 transition-colors">À propos</Link>
          <Link href="/hypotheses" className="hover:text-indigo-600 transition-colors">Méthodologie</Link>
          <Link href="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link>
          <span className="hidden sm:inline text-slate-200 dark:text-slate-700">|</span>
          <Link href="/cgu" className="hover:text-indigo-600 transition-colors">CGU</Link>
          <Link href="/mentions-legales" className="hover:text-indigo-600 transition-colors">Mentions légales</Link>
          <Link href="/confidentialite" className="hover:text-indigo-600 transition-colors">Confidentialité</Link>
        </nav>
      </div>
    </footer>
  );
}
