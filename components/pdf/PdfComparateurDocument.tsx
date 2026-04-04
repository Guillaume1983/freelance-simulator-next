'use client';

import RegimeFinancialBreakdown from '@/components/comparateur/RegimeFinancialBreakdown';
import { PdfCoverHeader } from '@/components/pdf/PdfCoverHeader';
import { PdfStatutPageHeader } from '@/components/pdf/PdfStatutPageHeader';
import { PdfVentilationRow } from '@/components/pdf/PdfVentilationRow';
import { RegimeParamsPdfReadonly, SimulationParamsPdfSummary } from '@/components/pdf/RegimeParamsPdfReadonly';
import { REGIME_COLORS } from '@/components/simulateur/regimeVisualTokens';
import { PLAFOND_MICRO_BNC, PLAFOND_MICRO_BIC } from '@/lib/constants';
import { fmtEur } from '@/lib/utils';

export function PdfComparateurDocument({ sim, regimes }: { sim: any; regimes: any[] }) {
  const state = sim.state ?? {};
  const typeMicro = state.typeActiviteMicro ?? 'BNC';
  const plafondMicro = typeMicro === 'BNC' ? PLAFOND_MICRO_BNC : PLAFOND_MICRO_BIC;
  const now = new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' });

  return (
    <div className="pdf-print-document-root bg-white text-slate-900" lang="fr">
      <section
        className="pdf-print-page pdf-print-page--cover mb-2"
        style={{ pageBreakAfter: 'always' }}
      >
        <div className="pdf-print-page-fill">
          <PdfCoverHeader
            title="Comparatif des statuts"
            subtitle={`Document généré le ${now}. Projections indicatives (barèmes et hypothèses en vigueur). Ne remplace pas un conseil personnalisé (expert-comptable).`}
          />
          <SimulationParamsPdfSummary state={state} variant="comparateur" />
          <p className="mt-auto border-t border-slate-200 pt-4 text-[10px] leading-relaxed text-slate-500">
            Les pages suivantes détaillent chaque statut : ventilation, explications de calcul et répartition du chiffre
            d&apos;affaires. Méthodologie : https://www.freelance-simulateur.fr/hypotheses
          </p>
        </div>
      </section>

      {regimes.map((regime, idx) => {
        const microExceeded = regime.id === 'Micro' && regime.ca > plafondMicro;
        const barTone = REGIME_COLORS[regime.id]?.bg ?? 'bg-slate-500';
        return (
          <section
            key={regime.id}
            className="pdf-print-page pdf-print-page--statut mb-2"
            style={{ pageBreakAfter: idx < regimes.length - 1 ? 'always' : 'auto' }}
          >
            <div className="flex flex-col gap-2">
              <PdfStatutPageHeader
                barClassName={barTone}
                title={regime.id}
                caRight={
                  <>
                    CA {fmtEur(regime.ca)} / an
                  </>
                }
              />
              {microExceeded && (
                <p className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-1.5 rounded">
                  Attention : CA supérieur au plafond micro-entreprise pour une activité {String(typeMicro)} (voir plafonds
                  en vigueur).
                </p>
              )}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <SimulationParamsPdfSummary state={state} variant="comparateur" compact />
              </div>
              <RegimeParamsPdfReadonly regimeId={regime.id} state={state} />

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
