'use client';

import { fmtEur } from '@/lib/utils';

/** Paramètres spécifiques au statut (lecture seule, export PDF). */
export function RegimeParamsPdfReadonly({
  regimeId,
  state,
}: {
  regimeId: string;
  state: Record<string, unknown>;
}) {
  const portageComm = Number(state.portageComm ?? 0);
  const typeMicro = String(state.typeActiviteMicro ?? 'BNC');
  const prel = Boolean(state.prelevementLiberatoire);
  const remTns = Math.round(Number(state.remunerationDirigeantMensuelle ?? 1) * 100);
  const partSalaire = Math.max(0, Math.min(100, Math.round(Number(state.repartitionRemuneration ?? 0))));

  const rows: { label: string; value: string }[] = [];

  if (regimeId === 'Portage') {
    rows.push({ label: 'Frais de gestion portage', value: `${Math.max(0, Math.min(20, portageComm))} %` });
  }
  if (regimeId === 'Micro') {
    rows.push({ label: 'Type d’activité micro', value: typeMicro });
    rows.push({ label: 'Prélèvement libératoire', value: prel ? 'Oui' : 'Non' });
  }
  if (regimeId === 'EURL IS') {
    rows.push({ label: 'Rémunération TNS (versement)', value: `${remTns} % du résultat` });
  }
  if (regimeId === 'SASU') {
    rows.push({ label: 'Part versée en salaire', value: `${partSalaire} %` });
  }

  if (rows.length === 0) return null;

  return (
    <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Options de calcul ({regimeId})</p>
      <ul className="space-y-0.5 text-[10px] text-slate-800">
        {rows.map((r) => (
          <li key={r.label} className="flex justify-between gap-3">
            <span className="text-slate-600">{r.label}</span>
            <span className="font-bold tabular-nums text-right">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function cityLabel(size: string): string {
  if (size === 'petite') return 'Commune petite (CFE minimale)';
  if (size === 'grande') return 'Commune grande (CFE max.)';
  return 'Commune moyenne';
}

/**
 * Récap des hypothèses communes (PDF).
 */
export function SimulationParamsPdfSummary({
  state,
  variant,
  compact = false,
  yearIndex,
  growthByYear,
}: {
  state: Record<string, unknown>;
  variant: 'comparateur' | 'simulateur';
  compact?: boolean;
  /** Année courante (0–4) pour la variante simulateur. */
  yearIndex?: number;
  growthByYear?: number[];
}) {
  const tjm = Number(state.tjm ?? 0);
  const days = Number(state.days ?? 0);
  const ca = tjm * days;
  const taxParts = Number(state.taxParts ?? 1);
  const spouse = Number(state.spouseIncome ?? 0);
  const km = Number(state.kmAnnuel ?? 0);
  const cv = String(state.cvFiscaux ?? '');
  const vehicule = String(state.typeVehicule ?? 'voiture');
  const elec = Boolean(state.vehiculeElectrique);
  const sections = state.sectionsActive as { vehicule?: boolean } | undefined;
  const ikActif = Boolean(sections?.vehicule);
  const loyer = Number(state.loyerPercu ?? 0);
  const mat = Number(state.materielAnnuel ?? 0);
  const av = Number(state.avantagesOptimises ?? 0);
  const citySize = String(state.citySize ?? 'moyenne');
  const baseGrowth = Number(state.growthRate ?? 0);
  const chargeAmounts = state.chargeAmounts as Record<string, number> | undefined;
  const activeCharges = state.activeCharges as string[] | undefined;

  let chargesMensuel = 0;
  if (chargeAmounts && activeCharges?.length) {
    for (const id of activeCharges) {
      chargesMensuel += Number(chargeAmounts[id] ?? 0);
    }
  }

  const growthLine =
    variant === 'simulateur' &&
    yearIndex != null &&
    growthByYear &&
    yearIndex > 0 ? (
      <li className="flex justify-between gap-3">
        <span className="text-slate-600">Croissance du CA vs année précédente</span>
        <span className="font-bold">+{growthByYear[yearIndex] ?? 0} %</span>
      </li>
    ) : null;

  const baseGrowthBlock =
    variant === 'simulateur' && !compact && yearIndex === undefined ? (
      <li className="flex justify-between gap-3">
        <span className="text-slate-600">Croissance par défaut (réglage)</span>
        <span className="font-bold">{baseGrowth} % / an</span>
      </li>
    ) : null;

  return (
    <div className={compact ? 'mt-0' : 'mt-0'}>
      {!compact && (
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Hypothèses saisies</p>
      )}
      <ul className={`space-y-1 text-[10px] text-slate-800 ${compact ? 'opacity-90' : ''}`}>
        <li className="flex justify-between gap-3">
          <span className="text-slate-600">TJM × jours travaillés</span>
          <span className="font-bold tabular-nums text-right">
            {fmtEur(tjm)} × {days} j → CA {fmtEur(ca)}/an
          </span>
        </li>
        {!compact && (
          <>
            <li className="flex justify-between gap-3">
              <span className="text-slate-600">Foyer fiscal (parts)</span>
              <span className="font-bold">{taxParts} part(s)</span>
            </li>
            <li className="flex justify-between gap-3">
              <span className="text-slate-600">Revenu du conjoint (réf.)</span>
              <span className="font-bold tabular-nums">{fmtEur(spouse)}/an</span>
            </li>
            <li className="flex justify-between gap-3">
              <span className="text-slate-600">Charges déductibles (total saisi)</span>
              <span className="font-bold tabular-nums">{fmtEur(chargesMensuel * 12)}/an</span>
            </li>
            <li className="flex justify-between gap-3">
              <span className="text-slate-600">Indemnités km / véhicule</span>
              <span className="font-bold text-right">
                {ikActif
                  ? `${fmtEur(km)} km/an · ${vehicule} · ${cv} CV${elec ? ' · électrique' : ''}`
                  : 'Non activé'}
              </span>
            </li>
            <li className="flex justify-between gap-3">
              <span className="text-slate-600">Loyer chargé / avantages (montants annuels saisis)</span>
              <span className="font-bold tabular-nums text-right">
                loyer {fmtEur(loyer)}/an · av. {fmtEur(av)}/an
              </span>
            </li>
            <li className="flex justify-between gap-3">
              <span className="text-slate-600">Matériel (amortissement an 1)</span>
              <span className="font-bold tabular-nums">{fmtEur(mat)}/an</span>
            </li>
            {variant === 'simulateur' && (
              <li className="flex justify-between gap-3">
                <span className="text-slate-600">ACRE (exonération / réduction an 1)</span>
                <span className="font-bold">{Boolean(state.acreEnabled) ? 'Activée' : 'Désactivée'}</span>
              </li>
            )}
            <li className="flex justify-between gap-3">
              <span className="text-slate-600">CFE (taille de commune)</span>
              <span className="font-bold text-right">{cityLabel(citySize)}</span>
            </li>
            {variant === 'simulateur' && baseGrowthBlock}
            {variant === 'simulateur' &&
              growthByYear &&
              yearIndex === undefined &&
              growthByYear.length > 1 && (
                <li className="flex flex-col gap-1 border-t border-slate-200 pt-2 mt-1">
                  <span className="text-slate-600 font-bold">Croissance du CA (série projection)</span>
                  <ul className="pl-2 space-y-0.5 text-[9px] text-slate-700">
                    {growthByYear.map((g, idx) =>
                      idx === 0 ? null : (
                        <li key={idx}>
                          Année {idx + 1} : +{g ?? 0} % par rapport à l&apos;année {idx}
                        </li>
                      ),
                    )}
                  </ul>
                </li>
              )}
          </>
        )}
        {variant === 'simulateur' && growthLine}
      </ul>
    </div>
  );
}
