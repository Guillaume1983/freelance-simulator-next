'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import Footer from '@/components/Footer';
import { PageSettingsPageHeader } from '@/components/PageSettingsPageHeader';

export default function ACREPage() {
  const [cotisationsAn1, setCotisationsAn1] = useState(15000);
  const economie = useMemo(() => cotisationsAn1 * 0.5, [cotisationsAn1]);

  return (
    <main className="min-h-screen bg-page-settings">
      <PageSettingsPageHeader
        backHref="/outils"
        backLabel="Retour aux outils"
        title="ACRE"
        subtitle="Aide aux créateurs et repreneurs d’entreprises — depuis le décret 2026-69, exonération partielle d’environ 25 % des cotisations la 1ʳᵉ année (hors CSG/CRDS), modélisée ici de façon simplifiée."
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <h2 className="text-xl font-bold">Économie estimée (an 1)</h2>
            <p className="text-white/80 text-sm mt-1">Si vous étiez redevable de ces cotisations sans ACRE.</p>
            <p className="text-3xl font-black mt-4 tabular-nums">− {Math.round(economie).toLocaleString('fr-FR')} €</p>
          </div>
          <div className="p-6 space-y-4">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              Cotisations sociales annuelles (TNS / Micro) sans ACRE — an 1
            </label>
            <input
              type="number"
              min={0}
              step={500}
              value={cotisationsAn1}
              onChange={(e) => setCotisationsAn1(Math.max(0, Number(e.target.value) || 0))}
              className="w-full max-w-xs px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Avec ACRE : vous payez environ 75 % de ce montant (soit ~25 % d&apos;exonération, hors CSG/CRDS non réductibles).
              L’ACRE ne s’applique pas au portage salarial ni aux assimilés salariés.
            </p>
            <p className="text-sm">
              <a
                href="https://www.urssaf.fr/portail/home/independant/creer-ou-reprendre-une-entreprise/laide-aux-jeunes-entreprises-acre.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Éligibilité et conditions ACRE (URSSAF)
                <ExternalLink size={14} />
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
