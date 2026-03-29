'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { PLAFOND_MICRO_BNC, PLAFOND_MICRO_BIC } from '@/lib/constants';
import Footer from '@/components/Footer';
import { PageSettingsPageHeader } from '@/components/PageSettingsPageHeader';

type RegimeMicro = 'BNC' | 'BIC_SERVICE' | 'BIC_COMMERCE';

const REGIMES: { id: RegimeMicro; label: string; plafond: number }[] = [
  { id: 'BNC', label: 'BNC (bénéfices non commerciaux)', plafond: PLAFOND_MICRO_BNC },
  { id: 'BIC_SERVICE', label: 'BIC prestations de services', plafond: PLAFOND_MICRO_BNC },
  { id: 'BIC_COMMERCE', label: 'BIC ventes / commerce', plafond: PLAFOND_MICRO_BIC },
];

export default function PlafondsMicroPage() {
  const [regime, setRegime] = useState<RegimeMicro>('BNC');
  const [caDejaFacture, setCaDejaFacture] = useState(0);
  const plafond = regime === 'BIC_COMMERCE' ? PLAFOND_MICRO_BIC : PLAFOND_MICRO_BNC;
  const reste = useMemo(() => Math.max(0, plafond - caDejaFacture), [plafond, caDejaFacture]);
  const depasse = caDejaFacture > plafond;

  return (
    <main className="min-h-screen bg-page-settings">
      <PageSettingsPageHeader
        backHref="/outils"
        backLabel="Retour aux outils"
        title="Plafonds Micro"
        subtitle="Seuils de chiffre d’affaires (Loi de Finances 2026) et reste à facturer avant dépassement."
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            <h2 className="text-xl font-bold">Plafond et reste à facturer</h2>
            <p className="text-3xl font-black mt-4 tabular-nums">
              {depasse ? 'Dépassement' : 'Reste'} : {Math.abs(reste).toLocaleString('fr-FR')} €
            </p>
            {depasse && <p className="text-sm text-amber-100 mt-1">Vous dépassez le plafond micro.</p>}
          </div>
          <div className="p-6 space-y-4">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">Régime micro</label>
            <select
              value={regime}
              onChange={(e) => setRegime(e.target.value as RegimeMicro)}
              className="w-full max-w-md px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {REGIMES.map((r) => (
                <option key={r.id} value={r.id}>{r.label} — plafond {r.plafond.toLocaleString('fr-FR')} €</option>
              ))}
            </select>
            <label className="block font-semibold text-slate-700 dark:text-slate-300">CA déjà facturé (€)</label>
            <input
              type="number"
              min={0}
              step={1000}
              value={caDejaFacture || ''}
              onChange={(e) => setCaDejaFacture(Math.max(0, Number(e.target.value) || 0))}
              className="w-full max-w-xs px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              BNC / BIC services : plafond {PLAFOND_MICRO_BNC.toLocaleString('fr-FR')} €. BIC commerce : plafond {PLAFOND_MICRO_BIC.toLocaleString('fr-FR')} €. Au-delà, bascule possible au régime du réel.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
