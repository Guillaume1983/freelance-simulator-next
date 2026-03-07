'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Car, Bike, Circle, ArrowLeft, ExternalLink, CheckCircle2 } from 'lucide-react';
import { getIKDetail, type TypeVehiculeIK } from '@/lib/financial/rates';
import { useSimulationContext } from '@/context/SimulationContext';
import Footer from '@/components/Footer';

const BANDES_MOTO = ['1-2', '3-5', '5+'] as const;
const BANDE_MOTO_LABEL: Record<string, string> = { '1-2': '1–2 cv', '3-5': '3–5 cv', '5+': '5+ cv' };

function parseCv(s: string | null, type: TypeVehiculeIK): string {
  if (!s) return type === 'voiture' ? '6' : '3-5';
  if (type === 'moto' && BANDES_MOTO.includes(s as any)) return s;
  if (type === 'voiture') {
    const n = parseInt(s, 10);
    if (n >= 3 && n <= 7) return String(n);
    return '6';
  }
  return type === 'voiture' ? '6' : '3-5';
}

export default function IndemnitesKmPage() {
  const searchParams = useSearchParams();
  const sim = useSimulationContext().sim ?? useSimulationContext();

  const [km, setKm] = useState(10000);
  const [type, setType] = useState<TypeVehiculeIK>('voiture');
  const [cvOrBande, setCvOrBande] = useState('6');
  const [electrique, setElectrique] = useState(false);

  // Préremplir depuis l’URL
  useEffect(() => {
    const ikKm = searchParams.get('ik_km');
    const ikType = searchParams.get('ik_type');
    const ikCv = searchParams.get('ik_cv');
    const ikElec = searchParams.get('ik_elec');
    if (ikKm != null) setKm(Math.max(0, parseInt(ikKm, 10) || 0));
    if (ikType === 'voiture' || ikType === 'moto' || ikType === 'cyclo50') setType(ikType);
    if (ikCv != null) setCvOrBande(parseCv(ikCv, (ikType as TypeVehiculeIK) || type));
    if (ikElec === '1' || ikElec === 'true') setElectrique(true);
  }, [searchParams]);

  // Préremplir depuis les paramètres de simulation (si pas d’params URL)
  useEffect(() => {
    if (searchParams.get('ik_km') != null) return;
    setKm(sim?.state?.kmAnnuel ?? 10000);
    setType((sim?.state?.typeVehicule as TypeVehiculeIK) ?? 'voiture');
    setCvOrBande(String(sim?.state?.cvFiscaux ?? '6'));
    setElectrique(!!sim?.state?.vehiculeElectrique);
  }, [searchParams.get('ik_km'), sim?.state?.kmAnnuel, sim?.state?.typeVehicule, sim?.state?.cvFiscaux, sim?.state?.vehiculeElectrique]);

  const detail = useMemo(
    () => getIKDetail(km, type, type === 'cyclo50' ? undefined : cvOrBande, electrique),
    [km, type, cvOrBande, electrique]
  );

  const applyToReglages = () => {
    const params = new URLSearchParams();
    params.set('panel', 'vehicule');
    params.set('ik_km', String(km));
    params.set('ik_type', type);
    params.set('ik_cv', cvOrBande);
    params.set('ik_elec', electrique ? '1' : '0');
    window.location.href = `/reglages?${params.toString()}`;
  };

  return (
    <>
      <main className="relative z-10 min-h-screen bg-white dark:bg-slate-950">
        <div className="top-accent-bar" aria-hidden />

        <div className="max-w-[640px] mx-auto px-4 md:px-6 py-8 md:py-10">
          <Link
            href="/reglages"
            className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Retour aux paramètres
          </Link>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Simulateur d’indemnités kilométriques
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Barème URSSAF (arr. 27 mars 2023). Ces montants sont déductibles dans le cadre de votre activité.
          </p>

          <div className="mt-8 p-5 md:p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-5">
            <div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Type de véhicule</span>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {(['voiture', 'moto', 'cyclo50'] as const).map((t) => {
                  const Icon = t === 'voiture' ? Car : t === 'moto' ? Bike : Circle;
                  const label = t === 'voiture' ? 'Voiture' : t === 'moto' ? 'Moto' : 'Cyclo 50';
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setType(t);
                        if (t === 'moto' && !BANDES_MOTO.includes(cvOrBande as any)) setCvOrBande('3-5');
                        if (t === 'voiture' && BANDES_MOTO.includes(cvOrBande as any)) setCvOrBande('6');
                      }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold border transition ${
                        type === t
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {type !== 'cyclo50' && (
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  {type === 'voiture' ? 'Puissance fiscale' : 'Bande moto'}
                </label>
                {type === 'voiture' ? (
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {['3', '4', '5', '6', '7'].map((cv) => (
                      <button
                        key={cv}
                        type="button"
                        onClick={() => setCvOrBande(cv)}
                        className={`px-3 py-2 rounded-xl text-[12px] font-bold border transition ${
                          cvOrBande === cv
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {cv} cv
                      </button>
                    ))}
                  </div>
                ) : (
                  <select
                    value={cvOrBande}
                    onChange={(e) => setCvOrBande(e.target.value)}
                    className="mt-1.5 w-full max-w-[160px] px-3 py-2 rounded-xl text-[13px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                  >
                    {BANDES_MOTO.map((b) => (
                      <option key={b} value={b}>{BANDE_MOTO_LABEL[b]}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Distance annuelle (km)</label>
              <input
                type="number"
                value={km}
                onChange={(e) => setKm(Math.max(0, parseInt(e.target.value, 10) || 0))}
                onFocus={(e) => e.target.select()}
                className="mt-1.5 w-full max-w-[140px] px-3 py-2 rounded-xl text-[14px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                min={0}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={electrique}
                onChange={(e) => setElectrique(e.target.checked)}
                className="rounded accent-indigo-600"
              />
              <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Véhicule électrique</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">(+20 % barème)</span>
            </label>
          </div>

          <div className="mt-6 p-5 md:p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-black uppercase tracking-wide text-indigo-900 dark:text-indigo-100">Résultat</h2>
            </div>
            <p className="text-2xl md:text-3xl font-black text-indigo-700 dark:text-indigo-300">
              {Math.round(detail.total).toLocaleString('fr-FR')} € <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">/ an</span>
            </p>
            {detail.majorationElectrique && (
              <p className="mt-1 text-[12px] text-indigo-600 dark:text-indigo-400">Dont majoration +20 % véhicule électrique</p>
            )}
            <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-800 space-y-2">
              {detail.tranches.filter((t) => t.montant > 0).map((t, i) => (
                <div key={i} className="flex justify-between text-[12px]">
                  <span className="text-slate-600 dark:text-slate-400">{t.label}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{t.montant.toLocaleString('fr-FR')} €</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={applyToReglages}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors"
            >
              <ExternalLink size={16} />
              Appliquer à mes paramètres (onglet Véhicule)
            </button>
            <Link
              href="/reglages"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Modifier les paramètres
            </Link>
          </div>

          <p className="mt-6 text-[11px] text-slate-500 dark:text-slate-400">
            Ces paramètres (véhicule, km, puissance) sont les mêmes que dans l’onglet <strong>Véhicule</strong> des paramètres de simulation. En cliquant sur « Appliquer », ils seront recopiés dans vos réglages et utilisés pour le comparateur et les projections 5 ans.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-950 mt-12">
          <Footer />
        </div>
      </main>
    </>
  );
}
