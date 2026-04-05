'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Car, Bike, Circle } from 'lucide-react';
import { getIK, getIKDetail, type TypeVehiculeIK } from '@/lib/financial/rates';
import { useSimulationContext } from '@/context/SimulationContext';
import NumberInput from '@/components/NumberInput';
import { cn } from '@/lib/utils';

const BANDES_MOTO = ['1-2', '3-5', '5+'] as const;
const BANDE_MOTO_LABEL: Record<string, string> = { '1-2': '1–2 cv', '3-5': '3–5 cv', '5+': '5+ cv' };

function parseCv(s: string | null, type: TypeVehiculeIK): string {
  if (!s) return type === 'voiture' ? '6' : '3-5';
  if (type === 'moto' && BANDES_MOTO.includes(s as (typeof BANDES_MOTO)[number])) return s;
  if (type === 'voiture') {
    const n = parseInt(s, 10);
    if (n >= 3 && n <= 7) return String(n);
    return '6';
  }
  return '3-5';
}

export function IndemnitesKmOutilPanel() {
  const searchParams = useSearchParams();
  const sim = useSimulationContext().sim ?? useSimulationContext();

  const [km, setKm] = useState(10000);
  const [type, setType] = useState<TypeVehiculeIK>('voiture');
  const [cvOrBande, setCvOrBande] = useState('6');
  const [electrique, setElectrique] = useState(false);

  useEffect(() => {
    const ikKm = searchParams.get('ik_km');
    const ikType = searchParams.get('ik_type');
    const ikCv = searchParams.get('ik_cv');
    const ikElec = searchParams.get('ik_elec');
    if (ikKm != null) setKm(Math.max(0, parseInt(ikKm, 10) || 0));
    if (ikType === 'voiture' || ikType === 'moto' || ikType === 'cyclo50') setType(ikType);
    if (ikCv != null) {
      const t: TypeVehiculeIK =
        ikType === 'voiture' || ikType === 'moto' || ikType === 'cyclo50' ? ikType : 'voiture';
      setCvOrBande(parseCv(ikCv, t));
    }
    if (ikElec === '1' || ikElec === 'true') setElectrique(true);
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get('ik_km') != null) return;
    setKm(sim?.state?.kmAnnuel ?? 10000);
    setType((sim?.state?.typeVehicule as TypeVehiculeIK) ?? 'voiture');
    setCvOrBande(String(sim?.state?.cvFiscaux ?? '6'));
    setElectrique(!!sim?.state?.vehiculeElectrique);
  }, [searchParams, sim?.state?.kmAnnuel, sim?.state?.typeVehicule, sim?.state?.cvFiscaux, sim?.state?.vehiculeElectrique]);

  const ikEstimate = useMemo(
    () => getIK(km, type, type === 'cyclo50' ? undefined : cvOrBande, electrique),
    [km, type, cvOrBande, electrique],
  );
  const detail = useMemo(
    () => getIKDetail(km, type, type === 'cyclo50' ? undefined : cvOrBande, electrique),
    [km, type, cvOrBande, electrique],
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-5 bg-linear-to-r from-sky-500 to-blue-500 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shrink-0">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">Véhicule</h2>
              <p className="text-sm text-white/75 mt-0.5">IK, frais réels</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl md:text-3xl font-bold tabular-nums">{Math.round(ikEstimate).toLocaleString('fr-FR')} €/an</p>
            <p className="text-sm text-white/80 mt-0.5">Indemnités kilométriques estimées</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700">
          <p className="font-semibold text-slate-900 dark:text-white mb-3">Type de véhicule</p>
          <div className="flex gap-3 flex-wrap">
            {(['voiture', 'moto', 'cyclo50'] as const).map((t) => {
              const label = t === 'voiture' ? 'Voiture' : t === 'moto' ? 'Moto' : 'Cyclo 50';
              const Icon = t === 'voiture' ? Car : t === 'moto' ? Bike : Circle;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    if (t === 'moto' && !BANDES_MOTO.includes(cvOrBande as (typeof BANDES_MOTO)[number])) setCvOrBande('3-5');
                    if (t === 'voiture' && BANDES_MOTO.includes(cvOrBande as (typeof BANDES_MOTO)[number])) setCvOrBande('6');
                  }}
                  className={cn(
                    'flex-1 min-w-[100px] p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all',
                    type === t
                      ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300',
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="font-medium text-sm">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <Circle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Véhicule électrique</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Majoration de 20 % sur les IK</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setElectrique(!electrique)}
              className={cn(
                'w-14 h-8 rounded-full transition-colors relative p-1 shrink-0',
                electrique ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-600',
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform',
                  electrique ? 'left-1 translate-x-6' : 'left-1 translate-x-0',
                )}
              />
            </button>
          </div>
        </div>

        <div className="p-5 rounded-xl border-2 transition-all bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <Car className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Kilomètres professionnels annuels</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Trajets clients, réunions, etc.</p>
              </div>
            </div>
            <div className="shrink-0">
              <NumberInput
                value={km}
                onChange={setKm}
                onIncrement={() => setKm((p) => p + 500)}
                onDecrement={() => setKm((p) => Math.max(0, p - 500))}
                suffix="km"
                label="Km"
              />
            </div>
          </div>
        </div>

        {type === 'voiture' && (
          <div className="p-5 rounded-xl bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Puissance fiscale</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Chevaux fiscaux (barème IK)</p>
                </div>
              </div>
              <select
                value={cvOrBande}
                onChange={(e) => setCvOrBande(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 shrink-0"
              >
                {[3, 4, 5, 6, 7].map((cv) => (
                  <option key={cv} value={cv}>
                    {cv} CV
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {type === 'moto' && (
          <div className="p-5 rounded-xl bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  <Bike className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Bande moto</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Barème IK</p>
                </div>
              </div>
              <select
                value={BANDES_MOTO.includes(cvOrBande as (typeof BANDES_MOTO)[number]) ? cvOrBande : '3-5'}
                onChange={(e) => setCvOrBande(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:border-indigo-500 shrink-0"
              >
                {BANDES_MOTO.map((b) => (
                  <option key={b} value={b}>
                    {BANDE_MOTO_LABEL[b]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {detail.tranches.some((t) => t.montant > 0) && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Détail par tranche</p>
            <div className="space-y-1.5">
              {detail.tranches
                .filter((t) => t.montant > 0)
                .map((t, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">{t.label}</span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">{t.montant.toLocaleString('fr-FR')} €</span>
                  </div>
                ))}
            </div>
            {electrique && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Dont majoration +20 % véhicule électrique.</p>
            )}
          </div>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Barème URSSAF · charge entreprise, net pour vous (exonéré cotis. et IR). Même réglages que l’onglet Véhicule du
          simulateur (arr. 27 mars 2023).
        </p>
      </div>
    </div>
  );
}
