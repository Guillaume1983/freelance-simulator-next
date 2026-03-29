'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CFE_PAR_VILLE, type CitySize } from '@/lib/constants';
import Footer from '@/components/Footer';
import { PageSettingsPageHeader } from '@/components/PageSettingsPageHeader';

const CITY_LABELS: Record<CitySize, string> = {
  petite: 'Commune < 5 000 hab.',
  moyenne: 'Commune 5 000 – 20 000 hab.',
  grande: 'Commune > 20 000 hab.',
};

export default function CFEPage() {
  const [citySize, setCitySize] = useState<CitySize>('moyenne');
  const cfe = CFE_PAR_VILLE[citySize];

  return (
    <main className="min-h-screen bg-page-settings">
      <PageSettingsPageHeader
        backHref="/outils"
        backLabel="Retour aux outils"
        title="CFE"
        subtitle="Cotisation foncière des entreprises — estimation selon la taille de la commune."
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-violet-500 to-violet-600 text-white">
            <h2 className="text-xl font-bold">Montant estimé</h2>
            <p className="text-white/80 text-sm mt-1">La CFE est due à partir de la 2ᵉ année (exonération possible an 1).</p>
            <p className="text-3xl font-black mt-4 tabular-nums">{cfe.toLocaleString('fr-FR')} €/an</p>
          </div>
          <div className="p-6 space-y-4">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">Taille de la commune</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CFE_PAR_VILLE) as CitySize[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setCitySize(size)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    citySize === size
                      ? 'bg-violet-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {CITY_LABELS[size]}
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
              Les montants sont indicatifs. La CFE réelle dépend du taux voté par la commune et de la base d’imposition. Consultez impots.gouv.fr ou votre centre des impôts pour le montant exact.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
