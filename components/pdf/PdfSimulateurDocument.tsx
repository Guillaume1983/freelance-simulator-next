'use client';

import RegimeFinancialBreakdown, { RetirementBadge } from '@/components/comparateur/RegimeFinancialBreakdown';
import { PdfCoverHeader } from '@/components/pdf/PdfCoverHeader';
import { PdfStatutPageHeader } from '@/components/pdf/PdfStatutPageHeader';
import { PdfVentilationRow } from '@/components/pdf/PdfVentilationRow';
import { RegimeParamsPdfReadonly, SimulationParamsPdfSummary } from '@/components/pdf/RegimeParamsPdfReadonly';
import { REGIME_COLORS } from '@/components/simulateur/regimeVisualTokens';
import { PLAFOND_MICRO_BNC, PLAFOND_MICRO_BIC } from '@/lib/constants';
import { fmtEur } from '@/lib/utils';

export function PdfSimulateurDocument({
  sim,
  simulations,
  growthByYear,
  statutId,
}: {
  sim: any;
  simulations: { id: string; ca: number; fees: number; cotis: number; ir: number; net: number; lines?: { id?: string; amount?: number }[]; cashInCompany?: number; retirementQuarters?: number }[][];
  growthByYear: number[];
  statutId: string;
}) {
  const state = sim.state ?? {};
  const typeMicro = state.typeActiviteMicro ?? 'BNC';
  const plafondMicro = typeMicro === 'BNC' ? PLAFOND_MICRO_BNC : PLAFOND_MICRO_BIC;
  const now = new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' });
  const barTone = REGIME_COLORS[statutId]?.bg ?? 'bg-slate-500';

  return (
    <div className="pdf-print-document-root bg-white text-slate-900" lang="fr">
      <section
        className="pdf-print-page pdf-print-page--cover mb-2"
        style={{ pageBreakAfter: 'always' }}
      >
        <div className="pdf-print-page-fill">
          <PdfCoverHeader
            title={`Simulation sur 5 ans : ${statutId}`}
            subtitle={`Généré le ${now}. Projection multi-annuelle indicative (ACRE, CFE, croissance du CA). Résultats non contractuels ; valider avec un expert-comptable.`}
          />
          <SimulationParamsPdfSummary
            state={state}
            variant="simulateur"
            growthByYear={growthByYear}
          />
          <p className="mt-auto border-t border-slate-200 pt-4 text-[10px] leading-relaxed text-slate-500">
            Chaque page suivante correspond à une année de projection (1 à 5) pour le statut {statutId}, mêmes hypothèses
            charges et foyer. Détails : https://www.freelance-simulateur.fr/hypotheses
          </p>
        </div>
      </section>

      {simulations.map((yearRegs, yearIdx) => {
        const regime = yearRegs.find((x) => x.id === statutId);
        if (!regime) return null;
        const microExceeded = regime.id === 'Micro' && regime.ca > plafondMicro;

        return (
          <section
            key={yearIdx}
            className="pdf-print-page pdf-print-page--statut mb-2"
            style={{ pageBreakAfter: yearIdx < simulations.length - 1 ? 'always' : 'auto' }}
          >
            <div className="flex flex-col gap-2">
              <PdfStatutPageHeader
                barClassName={barTone}
                title={
                  <>
                    {statutId} · année {yearIdx + 1} / 5
                  </>
                }
                caRight={
                  <>
                    CA {fmtEur(regime.ca)} / an
                  </>
                }
              />
              {yearIdx > 0 && (
                <p className="text-[10px] text-slate-600">
                  Croissance du CA vs année précédente :{' '}
                  <span className="font-black text-emerald-700">+{growthByYear[yearIdx] ?? 0} %</span>
                </p>
              )}
              {microExceeded && (
                <p className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-1.5 rounded">
                  Plafond micro-entreprise dépassé pour cette activité ({String(typeMicro)}).
                </p>
              )}

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <SimulationParamsPdfSummary
                  state={state}
                  variant="simulateur"
                  compact
                  yearIndex={yearIdx}
                  growthByYear={growthByYear}
                />
              </div>
              <RegimeParamsPdfReadonly regimeId={statutId} state={state} />

              <div className="flex flex-wrap items-center gap-2">
                <RetirementBadge quarters={regime.retirementQuarters ?? 0} regimeId={regime.id} />
              </div>

              <PdfVentilationRow regime={regime}>
                <RegimeFinancialBreakdown forPrint sim={sim} regime={regime} />
              </PdfVentilationRow>
            </div>
          </section>
        );
      })}
    </div>
  );
}
