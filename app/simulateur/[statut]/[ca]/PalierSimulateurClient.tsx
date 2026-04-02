'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useReactToPrint } from 'react-to-print';
import { useSimulationContext } from '@/context/SimulationContext';
import { useUser } from '@/hooks/useUser';

import ConnectorModal from '@/components/ConnectorModal';
import RegimeFinancialBreakdown, { RetirementBadge } from '@/components/comparateur/RegimeFinancialBreakdown';
import { HistogramBarLabeled } from '@/components/simulateur/HistogramBarLabeled';
import { REGIME_COLORS, STATUT_HEADER_ICON, PDF_PAGE_STYLE } from '@/components/simulateur/regimeVisualTokens';
import {
  buildComparateurQuery,
  DAYS_FOR_PALIER,
  getPalierChargeMensuel,
  getPalierSeoIntro,
  PALIER_CHARGE_CATALOG_ID,
  STATUT_SLUG_TO_ID,
} from '@/lib/simulateur/paliers';
import { PLAFOND_MICRO_BNC, PLAFOND_MICRO_BIC } from '@/lib/constants';
import { projeterSurNAns } from '@/lib/projections';
import { ArrowLeft } from 'lucide-react';
import { cn, fmtEur } from '@/lib/utils';

type Props = { statutSlug: string; caAnnual: number; children?: React.ReactNode };

export default function PalierSimulateurClient({ statutSlug, caAnnual, children }: Props) {
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
  const { isConnected } = useUser();
  const [showConnectorModal, setShowConnectorModal] = useState(false);

  const statutId = STATUT_SLUG_TO_ID[statutSlug] ?? 'Portage';

  /**
   * Hypothèses palier SEO : CA = TJM × 200 j ; charges pro forfaitaires ~10 % du CA (catalogue `repas`) ;
   * pas d’IK / loyer / avantages / matériel ; foyer 1 adulte, 0 enfant, pas de revenu conjoint.
   */
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

  const simulations = useMemo(
    () =>
      projeterSurNAns(
        {
          tjm: sim.state.tjm,
          days: sim.state.days,
          taxParts: sim.state.taxParts,
          spouseIncome: sim.state.spouseIncome,
          kmAnnuel: sim.state.kmAnnuel,
          cvFiscaux: sim.state.cvFiscaux,
          typeVehicule: sim.state.typeVehicule ?? 'voiture',
          vehiculeElectrique: sim.state.vehiculeElectrique ?? false,
          loyerPercu: sim.state.loyerPercu,
          activeCharges: sim.state.activeCharges,
          sectionsActive: sim.state.sectionsActive,
          portageComm: sim.state.portageComm,
          chargeAmounts: sim.state.chargeAmounts,
          acreEnabled: sim.state.acreEnabled,
          citySize: sim.state.citySize,
          growthRate: sim.state.growthRate / 100,
          materielAnnuel: sim.state.materielAnnuel,
          avantagesOptimises: sim.state.avantagesOptimises,
          typeActiviteMicro: sim.state.typeActiviteMicro,
          prelevementLiberatoire: sim.state.prelevementLiberatoire,
          remunerationDirigeantMensuelle: sim.state.remunerationDirigeantMensuelle,
          repartitionRemuneration: sim.state.repartitionRemuneration,
        },
        growthByYear.map((v) => (v ?? 0) / 100),
      ),
    [sim.state, growthByYear],
  );

  const regime = simulations[0]?.find((x: { id: string }) => x.id === statutId);

  const regimesForBreakdown = useMemo(() => {
    const list = simulations
      .map((yr) => yr.find((x: { id: string }) => x.id === statutId))
      .filter(Boolean);
    return list as NonNullable<(typeof list)[number]>[];
  }, [simulations, statutId]);

  const typeMicro = sim.state?.typeActiviteMicro ?? 'BNC';
  const plafondMicro = typeMicro === 'BNC' ? PLAFOND_MICRO_BNC : PLAFOND_MICRO_BIC;
  const microPlafondExceeded = regime?.id === 'Micro' && regime.ca > plafondMicro;

  const colors = regime ? REGIME_COLORS[regime.id] ?? REGIME_COLORS.Portage : REGIME_COLORS.Portage;

  const comparateurHref = `/comparateur${buildComparateurQuery(caAnnual, statutSlug)}`;
  const simulateurHref = `/simulateur/${statutSlug}`;

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Palier-CA-${statutId}-FreelanceSimulateur`,
    pageStyle: PDF_PAGE_STYLE,
  });

  const handleExportPdf = () => {
    if (typeof document === 'undefined') return;
    document.getElementById('palier-pdf-btn')?.click();
  };

  const headerIcon = STATUT_HEADER_ICON[statutId] ?? STATUT_HEADER_ICON.Portage;
  const IconComp = headerIcon.Icon;

  return (
    <main className="min-h-screen bg-page-settings min-w-0">
      <button
        id="palier-pdf-btn"
        type="button"
        onClick={() => (isConnected ? handlePrint() : setShowConnectorModal(true))}
        className="sr-only"
      >
        PDF
      </button>

      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-indigo-100 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
          <Link
            href={simulateurHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Simulation 5 ans
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
              {statutId} à {Math.round(caAnnual / 1000)} k€ de CA : net et charges
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed text-[15px]">
              {getPalierSeoIntro(statutId, caAnnual)}
            </p>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-500 border-l-2 border-slate-300 dark:border-slate-600 pl-4">
              Hypothèses de ce palier : charges professionnelles forfaitaires à <strong>10 % du CA</strong> (sans
              indemnités kilométriques, loyer de bureau à domicile ni autres optimisations) ;{' '}
              <strong>impôts</strong> pour une personne <strong>seule sans enfant</strong> (1 part fiscale, aucun
              revenu conjoint). Rendu du tableau et de l&apos;histogramme comme dans l&apos;outil ; chiffres propres à
              ces hypothèses. Pour votre configuration :{' '}
              <Link href={simulateurHref} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                simulation sur 5 ans
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-2 w-full min-w-0">
          {sim.isLoading || !regime ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center text-slate-500 text-sm">
              Chargement des résultats…
            </div>
          ) : (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden flex flex-col">
              <div className={cn('h-1.5 w-full bg-linear-to-r shrink-0', colors.gradient)} />

              <div className="p-5 md:p-6 flex flex-col gap-6">
                <div className="flex items-start justify-center gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0 text-center px-1">
                    {microPlafondExceeded && (
                      <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Plafond micro dépassé
                        </span>
                      </div>
                    )}
                    <p className="text-3xl md:text-4xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                      {fmtEur(regime.net / 12)}
                      <span className="text-sm font-bold text-slate-400 dark:text-slate-500 ml-2">/ mois net</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {fmtEur(regime.net)} / an · CA {fmtEur(regime.ca)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                      <RetirementBadge quarters={regime.retirementQuarters ?? 0} regimeId={regime.id} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-1 min-w-0 lg:max-w-[min(100%,28rem)] lg:self-stretch flex min-h-0">
                    <div className="w-full min-h-0">
                      <RegimeFinancialBreakdown sim={sim} regime={regime} regimes={regimesForBreakdown} />
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-end lg:justify-center shrink-0 w-full lg:w-[min(240px,30vw)]">
                    <HistogramBarLabeled regime={regime} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 space-y-4 border-t border-slate-200 dark:border-slate-700 pt-8 mt-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Lire les résultats</h2>
          <p>
            À gauche : la ventilation détaillée ; à droite : la répartition du chiffre d&apos;affaires entre charges,
            cotisations, impôts et net (même mise en page que dans l&apos;outil).{' '}
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

      <div className="sr-only" aria-hidden>
        <div ref={printRef} className="p-6 text-slate-900">
          <h1 className="text-lg font-black">
            Palier CA — {statutId} ({fmtEur(caAnnual)} / an)
          </h1>
          {regime && (
            <div className="mt-4 space-y-2 text-sm">
              <p>
                <strong>Net mensuel :</strong> {fmtEur(regime.net / 12)}
              </p>
              <p>
                <strong>Net annuel :</strong> {fmtEur(regime.net)}
              </p>
              <p>
                <strong>CA :</strong> {fmtEur(regime.ca)}
              </p>
            </div>
          )}
        </div>
      </div>

      <ConnectorModal
        open={showConnectorModal}
        onClose={() => setShowConnectorModal(false)}
        title="Connectez-vous pour exporter en PDF"
        message="Connectez-vous ou créez un compte pour exporter en PDF et sauvegarder vos paramètres."
      />
      {children}
    </main>
  );
}
