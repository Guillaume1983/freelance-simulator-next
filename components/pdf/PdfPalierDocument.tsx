'use client';

import RegimeFinancialBreakdown, { RetirementBadge } from '@/components/comparateur/RegimeFinancialBreakdown';
import { PdfCoverHeader } from '@/components/pdf/PdfCoverHeader';
import { PdfStatutPageHeader } from '@/components/pdf/PdfStatutPageHeader';
import { PdfVentilationRow } from '@/components/pdf/PdfVentilationRow';
import { RegimeParamsPdfReadonly, SimulationParamsPdfSummary } from '@/components/pdf/RegimeParamsPdfReadonly';
import { REGIME_COLORS } from '@/components/simulateur/regimeVisualTokens';
import { PLAFOND_MICRO_BNC, PLAFOND_MICRO_BIC } from '@/lib/constants';
import { fmtEur } from '@/lib/utils';

export function PdfPalierDocument({
  sim,
  regime,
  statutId,
  caAnnual,
}: {
  sim: any;
  regime: any;
  statutId: string;
  caAnnual: number;
}) {
  const state = sim.state ?? {};
  const typeMicro = state.typeActiviteMicro ?? 'BNC';
  const plafondMicro = typeMicro === 'BNC' ? PLAFOND_MICRO_BNC : PLAFOND_MICRO_BIC;
  const now = new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' });
  const microExceeded = regime.id === 'Micro' && regime.ca > plafondMicro;
  const barTone = REGIME_COLORS[statutId]?.bg ?? 'bg-slate-500';

  return (
    <div className="pdf-print-document-root bg-white text-slate-900" lang="fr">
      <section className="pdf-print-page pdf-print-page--statut">
        <div className="flex flex-col gap-2">
          <PdfCoverHeader
            title={`Palier CA SEO — ${statutId}`}
            badge="Palier SEO"
            subtitle={`Ordre de grandeur ~${Math.round(caAnnual / 1000)} k€ / an · généré le ${now}. Hypothèses forfaitaires (charges, foyer simplifié). Pour votre cas, privilégiez la simulation sur 5 ans.`}
          />

          <PdfStatutPageHeader
            barClassName={barTone}
            title={statutId}
            caRight={
              <>
                CA cible {fmtEur(caAnnual)} / an
              </>
            }
          />

          {microExceeded && (
            <p className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-1.5 rounded">
              Plafond micro-entreprise dépassé pour cette activité ({String(typeMicro)}).
            </p>
          )}

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <SimulationParamsPdfSummary state={state} variant="comparateur" compact />
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
    </div>
  );
}
