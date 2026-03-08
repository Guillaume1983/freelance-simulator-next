'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator } from 'lucide-react';
import { calculateRegimes, computeTaxParts } from '@/lib/projections';
import { CHARGES_CATALOG } from '@/lib/constants';
import Footer from '@/components/Footer';

const defaultChargeAmounts = CHARGES_CATALOG.reduce((acc, c) => {
  acc[c.id] = c.amount;
  return acc;
}, {} as Record<string, number>);

export default function TJMRevenuNetPage() {
  const [tjm, setTjm] = useState(600);
  const [days, setDays] = useState(210);

  const params = useMemo(
    () => ({
      tjm,
      days,
      taxParts: computeTaxParts(1, 0),
      spouseIncome: 0,
      kmAnnuel: 10000,
      cvFiscaux: '6',
      typeVehicule: 'voiture' as const,
      vehiculeElectrique: false,
      loyerPercu: 350,
      sectionsActive: { vehicule: true, loyer: true },
      portageComm: 7,
      chargeAmounts: defaultChargeAmounts,
      activeCharges: ['compta', 'mutuelle', 'assurance', 'repas', 'tel'],
      acreEnabled: true,
      citySize: 'moyenne' as const,
      growthRate: 0.02,
      annee: 1,
      materielAnnuel: 0,
      avantagesOptimises: 1500,
      typeActiviteMicro: 'BNC' as const,
      prelevementLiberatoire: false,
      remunerationDirigeantMensuelle: 1,
      repartitionRemuneration: 100,
    }),
    [tjm, days]
  );

  const resultats = useMemo(() => calculateRegimes(params), [params]);
  const ca = tjm * days;

  return (
    <main className="min-h-screen bg-page-settings">
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          <Link
            href="/outils"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Retour aux outils
          </Link>
          <div className="mt-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shrink-0">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">TJM → Revenu net</h1>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Estimation du net selon le TJM et le nombre de jours (profil type : 1 part, charges moyennes, ACRE an 1).
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <h2 className="text-xl font-bold">CA annuel</h2>
            <p className="text-3xl font-black mt-2 tabular-nums">{ca.toLocaleString('fr-FR')} €</p>
            <p className="text-white/80 text-sm mt-1">{tjm} € × {days} jours</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">TJM (€)</label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={tjm || ''}
                  onChange={(e) => setTjm(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full mt-1 px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Jours travaillés / an</label>
                <input
                  type="number"
                  min={0}
                  max={365}
                  value={days || ''}
                  onChange={(e) => setDays(Math.max(0, Math.min(365, Number(e.target.value) || 0)))}
                  className="w-full mt-1 px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Résultats avec un profil type (charges, véhicule, loyer, 1 part, ACRE an 1). Pour personnaliser, utilisez le <Link href="/reglages" className="text-indigo-600 dark:text-indigo-400 hover:underline">comparateur</Link> ou le <Link href="/simulateur/sasu" className="text-indigo-600 dark:text-indigo-400 hover:underline">simulateur</Link>.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-600">
                    <th className="text-left py-2 font-semibold text-slate-700 dark:text-slate-300">Statut</th>
                    <th className="text-right py-2 font-semibold text-slate-700 dark:text-slate-300">Net annuel</th>
                    <th className="text-right py-2 font-semibold text-slate-700 dark:text-slate-300">Taux net</th>
                  </tr>
                </thead>
                <tbody>
                  {resultats.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 dark:border-slate-700">
                      <td className="py-2 text-slate-900 dark:text-white">{r.id}</td>
                      <td className="py-2 text-right tabular-nums font-medium">{Math.round(r.net).toLocaleString('fr-FR')} €</td>
                      <td className="py-2 text-right tabular-nums text-slate-600 dark:text-slate-400">
                        {r.tauxNet != null ? `${Number(r.tauxNet).toFixed(1)} %` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
