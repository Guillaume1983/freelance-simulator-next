'use client';

import Link from 'next/link';
import { Car, Building2, Sparkles, TrendingUp, Percent, Calculator, Receipt, Wallet } from 'lucide-react';
import Footer from '@/components/Footer';
import { PageSettingsPageHeader } from '@/components/PageSettingsPageHeader';

const OUTILS = [
  { href: '/outils/indemnites-km', label: 'Indemnités kilométriques', desc: 'Barème URSSAF (voiture, moto, électrique)', icon: Car, iconClass: 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400' },
  { href: '/outils/cfe', label: 'CFE', desc: 'Estimation cotisation foncière des entreprises selon la ville', icon: Building2, iconClass: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400' },
  { href: '/outils/acre', label: 'ACRE', desc: 'Impact de l’ACRE sur les cotisations la 1ʳᵉ année', icon: Sparkles, iconClass: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' },
  { href: '/outils/plafonds-micro', label: 'Plafonds Micro', desc: 'BNC / BIC : seuils et reste à facturer avant dépassement', icon: TrendingUp, iconClass: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' },
  { href: '/outils/franchise-tva', label: 'Franchise de TVA', desc: 'Seuils 91 000 € / 36 500 € et position par rapport à votre CA', icon: Percent, iconClass: 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400' },
  { href: '/outils/tjm-revenu-net', label: 'TJM → Revenu net', desc: 'Estimation du net à partir du TJM et du nombre de jours', icon: Calculator, iconClass: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' },
  { href: '/outils/taux-effectif-ir', label: 'Taux effectif IR', desc: 'Tranche marginale et taux effectif d’imposition', icon: Receipt, iconClass: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400' },
  { href: '/outils/cotisations-tns', label: 'Cotisations TNS', desc: 'Estimation des cotisations gérant TNS (EURL IR, professions libérales)', icon: Wallet, iconClass: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
] as const;

export default function OutilsHubPage() {
  return (
    <main className="min-h-screen bg-page-settings">
      <PageSettingsPageHeader
        backHref="/"
        backLabel="Retour à l'accueil"
        title="Outils"
        subtitle="Calculatrices et simulateurs pour freelance et création d’entreprise."
        tertiary={
          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 italic">
            Outils fournis à titre indicatif : ils ne remplacent pas un avis fiscal, social ou juridique adapté à votre situation.
          </p>
        }
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {OUTILS.map(({ href, label, desc, icon: Icon, iconClass }) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-5 md:p-6 text-center shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all block"
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
