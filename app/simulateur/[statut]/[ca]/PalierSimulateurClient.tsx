'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSimulationContext } from '@/context/SimulationContext';
import SimulationSection from '@/components/SimulationSection';
import Footer from '@/components/Footer';
import {
  buildComparateurQuery,
  DAYS_FOR_PALIER,
  getPalierChargeMensuel,
  getPalierSeoIntro,
  PALIER_CHARGE_CATALOG_ID,
  STATUT_SLUG_TO_ID,
} from '@/lib/simulateur/paliers';
import { ArrowLeft, Briefcase, Building2, Building, Store } from 'lucide-react';

const STATUT_HEADER_ICON: Record<string, { Icon: typeof Briefcase; iconClass: string }> = {
  Portage: { Icon: Briefcase, iconClass: 'bg-indigo-500 text-white' },
  Micro: { Icon: Store, iconClass: 'bg-amber-500 text-white' },
  'EURL IR': { Icon: Building2, iconClass: 'bg-emerald-500 text-white' },
  'EURL IS': { Icon: Building2, iconClass: 'bg-blue-500 text-white' },
  SASU: { Icon: Building, iconClass: 'bg-violet-500 text-white' },
};

type Props = { statutSlug: string; caAnnual: number };

export default function PalierSimulateurClient({ statutSlug, caAnnual }: Props) {
  const router = useRouter();
  const ctx = useSimulationContext();
  const sim = ctx.sim ?? ctx;
  const {
    setTjm,
    setDays,
    setNbAdultes,
    setNbEnfants,
    setSpouseIncome,
    setSectionsActive,
    setAvantagesOptimises,
    setMaterielAnnuel,
    setActiveCharges,
    setChargeAmounts,
  } = sim.setters;

  const statutId = STATUT_SLUG_TO_ID[statutSlug] ?? 'Portage';
  const [activeRegime, setActiveRegimeState] = useState(statutId);

  useEffect(() => {
    setActiveRegimeState(statutId);
  }, [statutId]);

  /** Hypothèse palier : 10 % du CA en charges pro, pas d’optimisations (IK / loyer / avantages). */
  useEffect(() => {
    if (sim.isLoading) return;
    const tjm = Math.max(1, Math.round(caAnnual / DAYS_FOR_PALIER));
    setTjm(tjm);
    setDays(DAYS_FOR_PALIER);
    setSectionsActive({ vehicule: false });
    setAvantagesOptimises(0);
    setMaterielAnnuel(0);
    const mensuel = getPalierChargeMensuel(caAnnual);
    setActiveCharges([PALIER_CHARGE_CATALOG_ID]);
    setChargeAmounts((prev) => ({
      ...prev,
      [PALIER_CHARGE_CATALOG_ID]: mensuel,
    }));
    /** IR / prélèvements : célibataire sans enfant (1 part), pas de revenu conjoint */
    setNbAdultes(1);
    setNbEnfants(0);
    setSpouseIncome(0);
  }, [
    caAnnual,
    sim.isLoading,
    setTjm,
    setDays,
    setNbAdultes,
    setNbEnfants,
    setSpouseIncome,
    setSectionsActive,
    setAvantagesOptimises,
    setMaterielAnnuel,
    setActiveCharges,
    setChargeAmounts,
  ]);

  const growthByYear = useMemo(() => [0, 0, 0, 0, 0], []);

  const setActiveRegime = (id: string) => {
    const newSlug = Object.entries(STATUT_SLUG_TO_ID).find(([, v]) => v === id)?.[0];
    if (newSlug) router.push(`/simulateur/${newSlug}/${caAnnual}`);
  };

  const comparateurHref = `/comparateur${buildComparateurQuery(caAnnual, statutSlug)}`;
  const simulateurHref = `/simulateur/${statutSlug}`;

  const handleExportPdf = () => {
    if (typeof document === 'undefined') return;
    document.getElementById('simulateur-pdf-btn')?.click();
  };

  const headerIcon = STATUT_HEADER_ICON[statutId] ?? STATUT_HEADER_ICON.Portage;
  const IconComp = headerIcon.Icon;

  return (
    <main className="min-h-screen bg-page-settings min-w-0">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-indigo-100 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
          <Link
            href="/simulateur"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Simulateur
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 md:px-6 pb-12">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 mb-3 pt-8">
          <span className="font-black uppercase tracking-[0.18em]">Palier CA</span>
          <span>·</span>
          <span className="font-semibold">{statutId}</span>
          <span>·</span>
          <span>~{Math.round(caAnnual / 1000)} k€ / an</span>
        </div>

        <div className="flex items-start gap-4 mb-8">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md shrink-0 ${headerIcon.iconClass}`}
          >
            <IconComp className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {statutId} à {Math.round(caAnnual / 1000)} k€ de CA : net et charges (année 1)
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed text-[15px]">
              {getPalierSeoIntro(statutId, caAnnual)}
            </p>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-500 border-l-2 border-slate-300 dark:border-slate-600 pl-4">
              Hypothèses de ce palier : charges professionnelles forfaitaires à <strong>10 % du CA</strong> (sans
              indemnités kilométriques, loyer de bureau à domicile ni autres optimisations) ;{' '}
              <strong>impôts</strong> calculés pour une personne <strong>célibataire sans enfant</strong> (1 part
              fiscale, aucun revenu conjoint). Ce n&apos;est pas votre configuration personnalisée ({' '}
              <Link href="/reglages" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                réglages
              </Link>
              ).
            </p>
          </div>
        </div>

        {/* Même largeur que le texte : tableau + histogramme fusionnés dans SimulationSection */}
        <div className="mt-2 w-full min-w-0">
          <SimulationSection
            sim={sim}
            activeRegime={activeRegime}
            setActiveRegime={setActiveRegime}
            singleRegime
            palierMode
            articleSplitLayout
            growthByYear={growthByYear}
          />
        </div>

        <div className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 space-y-4 border-t border-slate-200 dark:border-slate-700 pt-8 mt-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Lire les résultats</h2>
          <p>
            À gauche : le détail pour la première année avec charges à 10 % du CA (sans ligne « optimisations »). À
            droite : la répartition du chiffre d&apos;affaires entre charges, cotisations, impôts et net.{' '}
            <Link href="/hypotheses" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Méthodologie de calcul
            </Link>
            .
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <Link
              href={simulateurHref}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Ouvrir la simulation sur 5 ans pour {statutId}
            </Link>
            {' — projection multi-années avec croissance et CFE. '}
            <Link
              href={comparateurHref}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Comparer les cinq statuts
            </Link>
            {' avec le même ordre de grandeur de CA.'}
          </p>
          <p className="text-sm">
            <button
              type="button"
              onClick={handleExportPdf}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Exporter cette vue en PDF
            </button>
            <span className="text-slate-500 dark:text-slate-500"> (connexion requise pour l&apos;export)</span>
          </p>
        </div>
      </article>

      <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <Footer />
      </div>
    </main>
  );
}
