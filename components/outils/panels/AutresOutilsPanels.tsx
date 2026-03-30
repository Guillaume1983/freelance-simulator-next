'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { CFE_PAR_VILLE, type CitySize } from '@/lib/constants';
import { PLAFOND_MICRO_BNC, PLAFOND_MICRO_BIC } from '@/lib/constants';
import { calculateRegimes, computeTaxParts } from '@/lib/projections';
import { CHARGES_CATALOG } from '@/lib/constants';
import { computeIR, RATES_2026 } from '@/lib/financial/rates';
import { computeTNSCotisations } from '@/lib/financial/rates';

const CITY_LABELS: Record<CitySize, string> = {
  petite: 'Commune < 5 000 hab.',
  moyenne: 'Commune 5 000 – 20 000 hab.',
  grande: 'Commune > 20 000 hab.',
};

export function CfeOutilPanel() {
  const [citySize, setCitySize] = useState<CitySize>('moyenne');
  const cfe = CFE_PAR_VILLE[citySize];
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-5 bg-linear-to-r from-violet-500 to-violet-600 text-white">
        <h2 className="text-xl font-bold">Montant estimé</h2>
        <p className="text-white/80 text-sm mt-1">La CFE est due à partir de la 2ᵉ année (exonération possible an 1).</p>
        <p className="text-3xl font-black mt-4 tabular-nums">{cfe.toLocaleString('fr-FR')} €/an</p>
      </div>
      <div className="p-6 space-y-4">
        <label className="block font-semibold text-slate-700 dark:text-slate-300">Taille de la commune</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CFE_PAR_VILLE) as CitySize[]).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setCitySize(size)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                citySize === size
                  ? 'bg-violet-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {CITY_LABELS[size]}
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
          Les montants sont indicatifs. La CFE réelle dépend du taux voté par la commune et de la base d’imposition.
        </p>
      </div>
    </div>
  );
}

export function AcreOutilPanel() {
  const [cotisationsAn1, setCotisationsAn1] = useState(15000);
  const economie = useMemo(() => cotisationsAn1 * 0.5, [cotisationsAn1]);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-5 bg-linear-to-r from-emerald-500 to-emerald-600 text-white">
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
  );
}

type RegimeMicro = 'BNC' | 'BIC_SERVICE' | 'BIC_COMMERCE';
const REGIMES: { id: RegimeMicro; label: string; plafond: number }[] = [
  { id: 'BNC', label: 'BNC (bénéfices non commerciaux)', plafond: PLAFOND_MICRO_BNC },
  { id: 'BIC_SERVICE', label: 'BIC prestations de services', plafond: PLAFOND_MICRO_BNC },
  { id: 'BIC_COMMERCE', label: 'BIC ventes / commerce', plafond: PLAFOND_MICRO_BIC },
];

export function PlafondsMicroOutilPanel() {
  const [regime, setRegime] = useState<RegimeMicro>('BNC');
  const [caDejaFacture, setCaDejaFacture] = useState(0);
  const plafond = regime === 'BIC_COMMERCE' ? PLAFOND_MICRO_BIC : PLAFOND_MICRO_BNC;
  const reste = useMemo(() => Math.max(0, plafond - caDejaFacture), [plafond, caDejaFacture]);
  const depasse = caDejaFacture > plafond;
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-5 bg-linear-to-r from-amber-500 to-amber-600 text-white">
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
            <option key={r.id} value={r.id}>
              {r.label} — plafond {r.plafond.toLocaleString('fr-FR')} €
            </option>
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
          BNC / BIC services : plafond {PLAFOND_MICRO_BNC.toLocaleString('fr-FR')} €. BIC commerce : plafond{' '}
          {PLAFOND_MICRO_BIC.toLocaleString('fr-FR')} €.
        </p>
      </div>
    </div>
  );
}

const SEUIL_VENTES = 91_000;
const SEUIL_PRESTATIONS = 36_500;

export function FranchiseTvaOutilPanel() {
  const [typeActivite, setTypeActivite] = useState<'ventes' | 'prestations'>('prestations');
  const [caPrevu, setCaPrevu] = useState(30000);
  const seuil = typeActivite === 'ventes' ? SEUIL_VENTES : SEUIL_PRESTATIONS;
  const enFranchise = useMemo(() => caPrevu <= seuil, [caPrevu, seuil]);
  const marge = useMemo(() => Math.max(0, seuil - caPrevu), [caPrevu, seuil]);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div
        className={`px-6 py-5 text-white ${enFranchise ? 'bg-linear-to-r from-sky-500 to-sky-600' : 'bg-linear-to-r from-amber-500 to-amber-600'}`}
      >
        <h2 className="text-xl font-bold">{enFranchise ? 'En franchise de TVA' : 'Au-delà de la franchise'}</h2>
        <p className="text-white/80 text-sm mt-1">
          Seuil {typeActivite === 'ventes' ? 'ventes' : 'prestations'} : {seuil.toLocaleString('fr-FR')} €.
        </p>
        {enFranchise && <p className="text-sm mt-2">Marge avant dépassement : {marge.toLocaleString('fr-FR')} €</p>}
      </div>
      <div className="p-6 space-y-4">
        <label className="block font-semibold text-slate-700 dark:text-slate-300">Type d’activité</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTypeActivite('prestations')}
            className={`px-4 py-2 rounded-xl font-medium ${typeActivite === 'prestations' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
          >
            Prestations de services (36 500 €)
          </button>
          <button
            type="button"
            onClick={() => setTypeActivite('ventes')}
            className={`px-4 py-2 rounded-xl font-medium ${typeActivite === 'ventes' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
          >
            Ventes (91 000 €)
          </button>
        </div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300">CA prévu ou réalisé (€)</label>
        <input
          type="number"
          min={0}
          step={1000}
          value={caPrevu || ''}
          onChange={(e) => setCaPrevu(Math.max(0, Number(e.target.value) || 0))}
          className="w-full max-w-xs px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          En franchise, vous ne facturez pas de TVA et ne pouvez pas la déduire. Règles détaillées sur impots.gouv.fr.
        </p>
      </div>
    </div>
  );
}

const defaultChargeAmountsTJm = CHARGES_CATALOG.reduce(
  (acc, c) => {
    acc[c.id] = c.amount;
    return acc;
  },
  {} as Record<string, number>,
);

export function TjmRevenuNetOutilPanel() {
  const [tjm, setTjm] = useState(600);
  const [days, setDays] = useState(210);
  const params = useMemo(
    () => ({
      tjm,
      days,
      taxParts: computeTaxParts(1, 0),
      spouseIncome: 0,
      kmAnnuel: 10000,
      cvFiscaux: '6',
      typeVehicule: 'voiture' as const,
      vehiculeElectrique: false,
      loyerPercu: 350,
      sectionsActive: { vehicule: true },
      portageComm: 7,
      chargeAmounts: defaultChargeAmountsTJm,
      activeCharges: ['compta', 'mutuelle', 'assurance', 'repas', 'tel'],
      acreEnabled: true,
      citySize: 'moyenne' as const,
      growthRate: 0.02,
      annee: 1,
      materielAnnuel: 0,
      avantagesOptimises: 1500,
      typeActiviteMicro: 'BNC' as const,
      prelevementLiberatoire: false,
      remunerationDirigeantMensuelle: 1,
      repartitionRemuneration: 100,
    }),
    [tjm, days],
  );
  const resultats = useMemo(() => calculateRegimes(params), [params]);
  const ca = tjm * days;
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-5 bg-linear-to-r from-indigo-500 to-indigo-600 text-white">
        <h2 className="text-xl font-bold">CA annuel</h2>
        <p className="text-3xl font-black mt-2 tabular-nums">{ca.toLocaleString('fr-FR')} €</p>
        <p className="text-white/80 text-sm mt-1">
          {tjm} € × {days} jours
        </p>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300">TJM (€)</label>
            <input
              type="number"
              min={0}
              step={50}
              value={tjm || ''}
              onChange={(e) => setTjm(Math.max(0, Number(e.target.value) || 0))}
              className="w-full mt-1 px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300">Jours travaillés / an</label>
            <input
              type="number"
              min={0}
              max={365}
              value={days || ''}
              onChange={(e) => setDays(Math.max(0, Math.min(365, Number(e.target.value) || 0)))}
              className="w-full mt-1 px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Profil type (charges, véhicule, loyer, 1 part, ACRE an 1). Personnaliser :{' '}
          <Link href="/comparateur" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            comparateur
          </Link>{' '}
          ou{' '}
          <Link href="/simulateur/sasu" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            simulateur
          </Link>
          .
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-600">
                <th className="text-left py-2 font-semibold text-slate-700 dark:text-slate-300">Statut</th>
                <th className="text-right py-2 font-semibold text-slate-700 dark:text-slate-300">Net annuel</th>
                <th className="text-right py-2 font-semibold text-slate-700 dark:text-slate-300">Taux net</th>
              </tr>
            </thead>
            <tbody>
              {resultats.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 dark:border-slate-700">
                  <td className="py-2 text-slate-900 dark:text-white">{r.id}</td>
                  <td className="py-2 text-right tabular-nums font-medium">{Math.round(r.net).toLocaleString('fr-FR')} €</td>
                  <td className="py-2 text-right tabular-nums text-slate-600 dark:text-slate-400">
                    {r.tauxNet != null ? `${Number(r.tauxNet).toFixed(1)} %` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const TRANCHES_IR = [
  { seuil: 11294, taux: 0, label: '0 %' },
  { seuil: 28797, taux: 0.11, label: '11 %' },
  { seuil: 82341, taux: 0.3, label: '30 %' },
  { seuil: 177106, taux: 0.41, label: '41 %' },
  { seuil: Infinity, taux: 0.45, label: '45 %' },
];

function getTrancheMarginale(revenuParPart: number): { taux: number; label: string } {
  for (let i = TRANCHES_IR.length - 1; i >= 0; i--) {
    if (revenuParPart > TRANCHES_IR[i].seuil) return { taux: TRANCHES_IR[i].taux, label: TRANCHES_IR[i].label };
  }
  return { taux: 0, label: '0 %' };
}

export function TauxEffectifIrOutilPanel() {
  const [revenuImposable, setRevenuImposable] = useState(40000);
  const [parts, setParts] = useState(1);
  const baseNet = useMemo(() => revenuImposable * (1 - RATES_2026.ir.abattement), [revenuImposable]);
  const parPart = useMemo(() => baseNet / parts, [baseNet, parts]);
  const impôt = useMemo(() => computeIR(revenuImposable, parts), [revenuImposable, parts]);
  const tauxEffectif = useMemo(() => (revenuImposable <= 0 ? 0 : impôt / revenuImposable), [revenuImposable, impôt]);
  const trancheMarginale = useMemo(() => getTrancheMarginale(parPart), [parPart]);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-5 bg-linear-to-r from-rose-500 to-rose-600 text-white">
        <h2 className="text-xl font-bold">Résumé</h2>
        <p className="text-3xl font-black mt-4 tabular-nums">{Math.round(impôt).toLocaleString('fr-FR')} €</p>
        <p className="text-white/80 text-sm mt-1">Impôt annuel · Taux effectif : {(tauxEffectif * 100).toFixed(1)} %</p>
        <p className="text-sm mt-2">Tranche marginale : {trancheMarginale.label}</p>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300">Revenu imposable du foyer (€)</label>
            <input
              type="number"
              min={0}
              step={1000}
              value={revenuImposable || ''}
              onChange={(e) => setRevenuImposable(Math.max(0, Number(e.target.value) || 0))}
              className="w-full mt-1 px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300">Nombre de parts</label>
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={parts}
              onChange={(e) => setParts(Math.max(0.5, Number(e.target.value) || 1))}
              className="w-full mt-1 px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Base après abattement 10 % : {Math.round(baseNet).toLocaleString('fr-FR')} € ; par part : {Math.round(parPart).toLocaleString('fr-FR')} €.
        </p>
        <div className="text-sm">
          <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Tranches du barème (par part)</p>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-0.5">
            {TRANCHES_IR.filter((t) => t.seuil !== Infinity).map((t, i) => (
              <li key={i}>
                Jusqu’à {t.seuil.toLocaleString('fr-FR')} € : {t.label}
              </li>
            ))}
            <li>Au-delà de 177 106 € : 45 %</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function CotisationsTnsOutilPanel() {
  const [benefice, setBenefice] = useState(45000);
  const [acreActive, setAcreActive] = useState(true);
  const result = useMemo(() => computeTNSCotisations(benefice, acreActive), [benefice, acreActive]);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-5 bg-linear-to-r from-slate-500 to-slate-600 text-white">
        <h2 className="text-xl font-bold">Total cotisations</h2>
        <p className="text-white/80 text-sm mt-1">{acreActive ? 'An 1 avec ACRE (~−25 % hors CSG/CRDS)' : 'Sans ACRE'}</p>
        <p className="text-3xl font-black mt-4 tabular-nums">{Math.round(result.total).toLocaleString('fr-FR')} €</p>
        <p className="text-sm mt-1">Dont déductibles IR : {Math.round(result.deductible).toLocaleString('fr-FR')} €</p>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300">Bénéfice (€)</label>
          <input
            type="number"
            min={0}
            step={1000}
            value={benefice || ''}
            onChange={(e) => setBenefice(Math.max(0, Number(e.target.value) || 0))}
            className="w-full max-w-xs mt-1 px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={acreActive}
            onChange={(e) => setAcreActive(e.target.checked)}
            className="rounded border-slate-300"
          />
          <span className="font-medium text-slate-700 dark:text-slate-300">An 1 avec ACRE (réduction ~25 % hors CSG/CRDS)</span>
        </label>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-600">
                <th className="text-left py-2 font-semibold text-slate-700 dark:text-slate-300">Poste</th>
                <th className="text-right py-2 font-semibold text-slate-700 dark:text-slate-300">Montant</th>
              </tr>
            </thead>
            <tbody>
              {result.detail.map((d, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                  <td className="py-2 text-slate-900 dark:text-white">{d.label}</td>
                  <td className="py-2 text-right tabular-nums">{Math.round(d.amount).toLocaleString('fr-FR')} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Modèle simplifié (CIPAV classe A). À titre indicatif.
        </p>
      </div>
    </div>
  );
}
