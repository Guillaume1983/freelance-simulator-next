'use client';

import Link from 'next/link';
import { ArrowLeft, TrendingUp, Briefcase, Store, Building2, Building } from 'lucide-react';
import Footer from '@/components/Footer';

/* Couleurs alignées sur SimulationSection (REGIME_COLORS) */
const STATUTS = [
  { href: '/simulateur/portage', slug: 'portage', label: 'Portage salarial', desc: 'Salarié du cabinet de portage, cotisations et net sur 5 ans', icon: Briefcase, iconClass: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' },
  { href: '/simulateur/micro', slug: 'micro', label: 'Micro-entreprise', desc: 'BNC / BIC, plafonds, ACRE et CFE sur 5 ans', icon: Store, iconClass: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' },
  { href: '/simulateur/eurl-ir', slug: 'eurl-ir', label: 'EURL à l’IR', desc: 'Société à l’impôt sur le revenu, gérant TNS, simulation 5 ans', icon: Building2, iconClass: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' },
  { href: '/simulateur/eurl-is', slug: 'eurl-is', label: 'EURL à l’IS', desc: 'Société à l’IS, rémunération + résultat, simulation 5 ans', icon: Building2, iconClass: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' },
  { href: '/simulateur/sasu', slug: 'sasu', label: 'SASU', desc: 'Société à l’IS, dividendes (PFU), ACRE an 1, simulation 5 ans', icon: Building, iconClass: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400' },
] as const;

export default function SimulateurHubPage() {
  return (
    <main className="min-h-screen bg-page-settings">
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Accueil
          </Link>
          <div className="mt-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Simulation 5 ans
              </h1>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Choisissez un statut pour lancer une simulation sur 5 ans (ACRE, CFE, croissance du CA).
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Ligne 1 : 3 statuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {STATUTS.slice(0, 3).map(({ href, label, desc, icon: Icon, iconClass }) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-5 md:p-6 text-center shadow-sm hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md transition-all block"
            >
              <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 ${iconClass}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wide">{label}</h3>
              <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-400">{desc}</p>
            </Link>
          ))}
        </div>
        {/* Ligne 2 : 2 statuts centrés */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-4 md:mt-6">
          {STATUTS.slice(3, 5).map(({ href, label, desc, icon: Icon, iconClass }) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-5 md:p-6 text-center shadow-sm hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md transition-all block w-full sm:w-[calc(50%-0.75rem)] md:max-w-[320px]"
            >
              <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 ${iconClass}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wide">{label}</h3>
              <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-400">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
