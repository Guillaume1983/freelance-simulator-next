'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Receipt } from 'lucide-react';
import { computeIR, RATES_2026 } from '@/lib/financial/rates';
import Footer from '@/components/Footer';

const TRANCHES = [
  { seuil: 11294, taux: 0, label: '0 %' },
  { seuil: 28797, taux: 0.11, label: '11 %' },
  { seuil: 82341, taux: 0.30, label: '30 %' },
  { seuil: 177106, taux: 0.41, label: '41 %' },
  { seuil: Infinity, taux: 0.45, label: '45 %' },
];

function getTrancheMarginale(revenuParPart: number): { taux: number; label: string } {
  for (let i = TRANCHES.length - 1; i >= 0; i--) {
    if (revenuParPart > TRANCHES[i].seuil) return { taux: TRANCHES[i].taux, label: TRANCHES[i].label };
  }
  return { taux: 0, label: '0 %' };
}

export default function TauxEffectifIRPage() {
  const [revenuImposable, setRevenuImposable] = useState(40000);
  const [parts, setParts] = useState(1);

  const baseNet = useMemo(() => revenuImposable * (1 - RATES_2026.ir.abattement), [revenuImposable]);
  const parPart = useMemo(() => baseNet / parts, [baseNet, parts]);
  const impôt = useMemo(() => computeIR(revenuImposable, parts), [revenuImposable, parts]);
  const tauxEffectif = useMemo(() => (revenuImposable <= 0 ? 0 : impôt / revenuImposable), [revenuImposable, impôt]);
  const trancheMarginale = useMemo(() => getTrancheMarginale(parPart), [parPart]);

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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shrink-0">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Taux effectif IR</h1>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Impôt sur le revenu : tranche marginale et taux effectif (barème 2025/2026, abattement 10 %).
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-rose-500 to-rose-600 text-white">
            <h2 className="text-xl font-bold">Résumé</h2>
            <p className="text-3xl font-black mt-4 tabular-nums">{Math.round(impôt).toLocaleString('fr-FR')} €</p>
            <p className="text-white/80 text-sm mt-1">Impôt annuel · Taux effectif : {(tauxEffectif * 100).toFixed(1)} %</p>
            <p className="text-sm mt-2">Tranche marginale : {trancheMarginale.label}</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Revenu imposable du foyer (€)</label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={revenuImposable || ''}
                  onChange={(e) => setRevenuImposable(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full mt-1 px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Nombre de parts</label>
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={parts}
                  onChange={(e) => setParts(Math.max(0.5, Number(e.target.value) || 1))}
                  className="w-full mt-1 px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Base après abattement 10 % : {Math.round(baseNet).toLocaleString('fr-FR')} € ; par part : {Math.round(parPart).toLocaleString('fr-FR')} €. Barème progressif par tranche.
            </p>
            <div className="text-sm">
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Tranches du barème (par part)</p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-0.5">
                {TRANCHES.filter(t => t.seuil !== Infinity).map((t, i) => (
                  <li key={i}>Jusqu’à {t.seuil.toLocaleString('fr-FR')} € : {t.label}</li>
                ))}
                <li>Au-delà de 177 106 € : 45 %</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
