'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Percent } from 'lucide-react';
import Footer from '@/components/Footer';

const SEUIL_VENTES = 91_000;
const SEUIL_PRESTATIONS = 36_500;

type TypeActivite = 'ventes' | 'prestations';

export default function FranchiseTVAPage() {
  const [typeActivite, setTypeActivite] = useState<TypeActivite>('prestations');
  const [caPrevu, setCaPrevu] = useState(30000);
  const seuil = typeActivite === 'ventes' ? SEUIL_VENTES : SEUIL_PRESTATIONS;
  const enFranchise = useMemo(() => caPrevu <= seuil, [caPrevu, seuil]);
  const marge = useMemo(() => Math.max(0, seuil - caPrevu), [caPrevu, seuil]);

  return (
    <main className="min-h-screen bg-page-settings">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-indigo-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <Link
            href="/outils"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Retour aux outils
          </Link>
          <div className="mt-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shrink-0">
              <Percent className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Franchise de TVA</h1>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Seuils de la franchise en base (ventes 91 000 €, prestations 36 500 €) et position par rapport à votre CA.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className={`px-6 py-5 text-white ${enFranchise ? 'bg-gradient-to-r from-sky-500 to-sky-600' : 'bg-gradient-to-r from-amber-500 to-amber-600'}`}>
            <h2 className="text-xl font-bold">
              {enFranchise ? 'En franchise de TVA' : 'Au-delà de la franchise'}
            </h2>
            <p className="text-white/80 text-sm mt-1">
              Seuil {typeActivite === 'ventes' ? 'ventes' : 'prestations'} : {seuil.toLocaleString('fr-FR')} €.
            </p>
            {enFranchise && <p className="text-sm mt-2">Marge avant dépassement : {marge.toLocaleString('fr-FR')} €</p>}
          </div>
          <div className="p-6 space-y-4">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">Type d’activité</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTypeActivite('prestations')}
                className={`px-4 py-2 rounded-xl font-medium ${typeActivite === 'prestations' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                Prestations de services (36 500 €)
              </button>
              <button
                type="button"
                onClick={() => setTypeActivite('ventes')}
                className={`px-4 py-2 rounded-xl font-medium ${typeActivite === 'ventes' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                Ventes (91 000 €)
              </button>
            </div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300">CA prévu ou réalisé (€)</label>
            <input
              type="number"
              min={0}
              step={1000}
              value={caPrevu || ''}
              onChange={(e) => setCaPrevu(Math.max(0, Number(e.target.value) || 0))}
              className="w-full max-w-xs px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              En franchise, vous ne facturez pas de TVA et ne pouvez pas la déduire. Au-delà du seuil, assujettissement possible. Règles détaillées sur impots.gouv.fr.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
