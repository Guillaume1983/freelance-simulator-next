'use client';

import Link from 'next/link';
import { ArrowLeft, Car, Building2, Sparkles, TrendingUp, Percent, Calculator, Receipt, Wallet, Wrench } from 'lucide-react';
import Footer from '@/components/Footer';

const OUTILS = [
  { href: '/outils/indemnites-km', label: 'Indemnités kilométriques', desc: 'Barème URSSAF (voiture, moto, électrique)', icon: Car, color: 'teal' },
  { href: '/outils/cfe', label: 'CFE', desc: 'Estimation cotisation foncière des entreprises selon la ville', icon: Building2, color: 'violet' },
  { href: '/outils/acre', label: 'ACRE', desc: 'Impact de l’ACRE sur les cotisations la 1ʳᵉ année', icon: Sparkles, color: 'emerald' },
  { href: '/outils/plafonds-micro', label: 'Plafonds Micro', desc: 'BNC / BIC : seuils et reste à facturer avant dépassement', icon: TrendingUp, color: 'amber' },
  { href: '/outils/franchise-tva', label: 'Franchise de TVA', desc: 'Seuils 91 000 € / 36 500 € et position par rapport à votre CA', icon: Percent, color: 'sky' },
  { href: '/outils/tjm-revenu-net', label: 'TJM → Revenu net', desc: 'Estimation du net à partir du TJM et du nombre de jours', icon: Calculator, color: 'indigo' },
  { href: '/outils/taux-effectif-ir', label: 'Taux effectif IR', desc: 'Tranche marginale et taux effectif d’imposition', icon: Receipt, color: 'rose' },
  { href: '/outils/cotisations-tns', label: 'Cotisations TNS', desc: 'Estimation des cotisations gérant TNS (EURL IR, professions libérales)', icon: Wallet, color: 'slate' },
] as const;

const colorClasses: Record<string, string> = {
  teal: 'from-teal-500 to-teal-600 border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  violet: 'from-violet-500 to-violet-600 border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  emerald: 'from-emerald-500 to-emerald-600 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  amber: 'from-amber-500 to-amber-600 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  sky: 'from-sky-500 to-sky-600 border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
  indigo: 'from-indigo-500 to-indigo-600 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  rose: 'from-rose-500 to-rose-600 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  slate: 'from-slate-500 to-slate-600 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300',
};

export default function OutilsHubPage() {
  return (
    <main className="min-h-screen bg-page-settings">
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Accueil
          </Link>
          <div className="mt-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shrink-0">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Outils
              </h1>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Calculatrices et simulateurs pour freelance et création d’entreprise.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {OUTILS.map(({ href, label, desc, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-xl border-2 p-5 transition-all hover:shadow-lg hover:scale-[1.02] block ${colorClasses[color]}`}
            >
              <div className="w-10 h-10 rounded-lg bg-white/20 dark:bg-white/10 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-white">{label}</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
