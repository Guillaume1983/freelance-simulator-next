'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wallet } from 'lucide-react';
import { computeTNSCotisations } from '@/lib/financial/rates';
import Footer from '@/components/Footer';

export default function CotisationsTNSPage() {
  const [benefice, setBenefice] = useState(45000);
  const [acreActive, setAcreActive] = useState(true);

  const result = useMemo(
    () => computeTNSCotisations(benefice, acreActive),
    [benefice, acreActive]
  );

  return (
    <main className="min-h-screen bg-page-settings">
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <Link
            href="/outils"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Retour aux outils
          </Link>
          <div className="mt-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg shrink-0">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cotisations TNS</h1>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Estimation des cotisations sociales pour un gérant TNS (EURL IR, professions libérales, SSI).
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-slate-500 to-slate-600 text-white">
            <h2 className="text-xl font-bold">Total cotisations</h2>
            <p className="text-white/80 text-sm mt-1">{acreActive ? 'An 1 avec ACRE (~−25 % hors CSG/CRDS)' : 'Sans ACRE'}</p>
            <p className="text-3xl font-black mt-4 tabular-nums">{Math.round(result.total).toLocaleString('fr-FR')} €</p>
            <p className="text-sm mt-1">Dont déductibles IR : {Math.round(result.deductible).toLocaleString('fr-FR')} €</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300">Bénéfice (€)</label>
              <input
                type="number"
                min={0}
                step={1000}
                value={benefice || ''}
                onChange={(e) => setBenefice(Math.max(0, Number(e.target.value) || 0))}
                className="w-full max-w-xs mt-1 px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={acreActive}
                onChange={(e) => setAcreActive(e.target.checked)}
                className="rounded border-slate-300"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">An 1 avec ACRE (réduction ~25 % hors CSG/CRDS)</span>
            </label>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-600">
                    <th className="text-left py-2 font-semibold text-slate-700 dark:text-slate-300">Poste</th>
                    <th className="text-right py-2 font-semibold text-slate-700 dark:text-slate-300">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {result.detail.map((d, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                      <td className="py-2 text-slate-900 dark:text-white">{d.label}</td>
                      <td className="py-2 text-right tabular-nums">{Math.round(d.amount).toLocaleString('fr-FR')} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Modèle simplifié (CIPAV classe A, taux 2025/2026). Les cotisations minimales et régimes spécifiques ne sont pas détaillés. À titre indicatif.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
