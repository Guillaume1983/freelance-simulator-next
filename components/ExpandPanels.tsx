'use client';

import { CHARGES_CATALOG } from '@/lib/constants';
import { cn, fmtEur } from '@/lib/utils';
import Link from 'next/link';
import {
  Car,
  Bike,
  Home,
  CheckCircle2,
  Circle,
  Users,
  Zap,
  Building2,
  Gift,
  Receipt,
  User,
  ShieldCheck,
  Calculator,
  Plus,
  Minus,
  Info,
} from 'lucide-react';
import { getIK } from '@/lib/financial/rates';
import NumberInput from '@/components/NumberInput';

function FieldCard({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-5 rounded-xl border-2 transition-all bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-700">
            <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{label}</p>
            {description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <div className="shrink-0">{children}</div>
      </div>
    </div>
  );
}

function InfoBox({
  children,
  variant = 'info',
}: {
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'success';
}) {
  const styles = {
    info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    warning:
      'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    success:
      'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
  };
  return (
    <div className={cn('p-4 rounded-xl border-2 flex items-start gap-3', styles[variant])}>
      <Info className="w-5 h-5 shrink-0 mt-0.5" />
      <p className="text-sm">{children}</p>
    </div>
  );
}

export default function ExpandPanels({ activePanel, sim }: any) {
  if (!activePanel) return null;
  if (!sim?.state) return null;

  const materielAnnuel = sim.state.materielAnnuel ?? 0;
  const kmAnnuel = sim.state.kmAnnuel ?? 0;
  const loyerPercu = sim.state.loyerPercu ?? 0;
  const loyerAnnuel = loyerPercu * 12;
  const avantagesOptimises = sim.state.avantagesOptimises ?? 1500;
  const spouseIncome = sim.state.spouseIncome ?? 0;
  const typeVehicule = sim.state.typeVehicule ?? 'voiture';
  const cvFiscauxRaw = sim.state.cvFiscaux ?? '6';
  const BANDES_MOTO = ['1-2', '3-5', '5+'] as const;
  const BANDE_MOTO_LABEL: Record<string, string> = { '1-2': '1–2 cv', '3-5': '3–5 cv', '5+': '5+ cv' };
  const CITY_ORDER = ['petite', 'moyenne', 'grande'] as const;
  const CITY_OPTIONS: { key: (typeof CITY_ORDER)[number]; label: string; amount: string }[] = [
    { key: 'petite', label: 'Petite ville', amount: '~300 €/an' },
    { key: 'moyenne', label: 'Ville moyenne', amount: '~550 €/an' },
    { key: 'grande', label: 'Grande ville', amount: '~900 €/an' },
  ];
  const currentCity: string = sim.state.citySize ?? 'petite';

  const nonWarning = CHARGES_CATALOG.filter(c => !c.portageWarning);
  const warning    = CHARGES_CATALOG.filter(c =>  c.portageWarning);

  const renderChargeRow = (item: (typeof CHARGES_CATALOG)[number]) => {
    const amount = sim.state.chargeAmounts?.[item.id] ?? item.amount;
    const safeAmount = typeof amount === 'number' && !Number.isNaN(amount) ? amount : 0;
    return (
      <div
        key={item.id}
        className="flex items-center justify-between p-4 rounded-xl border-2 transition-colors bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
      >
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {safeAmount} €/mois
          </p>
        </div>
        <NumberInput
          value={safeAmount}
          onChange={(v) =>
            sim.setters.setChargeAmounts((prev: Record<string, number> | undefined) => ({
              ...(prev || {}),
              [item.id]: v,
            }))
          }
          onIncrement={() =>
            sim.setters.setChargeAmounts((prev: Record<string, number> | undefined) => ({
              ...(prev || {}),
              [item.id]: (prev?.[item.id] ?? item.amount ?? 0) + 5,
            }))
          }
          onDecrement={() =>
            sim.setters.setChargeAmounts((prev: Record<string, number> | undefined) => ({
              ...(prev || {}),
              [item.id]: Math.max(0, (prev?.[item.id] ?? item.amount ?? 0) - 5),
            }))
          }
          suffix="€"
          label={item.name}
        />
      </div>
    );
  };

  const annualRevenue = (sim.state.tjm || 0) * (sim.state.days || 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* PANNEAU ACTIVITÉ */}
      {activePanel === 'activite' && (
        <>
          <FieldCard
            icon={Zap}
            label="Taux Journalier Moyen (TJM)"
            description="Votre tarif journalier facturé"
          >
            <NumberInput
              value={sim.state.tjm ?? 0}
              onChange={(v) => sim.setters.setTjm(v)}
              onIncrement={() => sim.setters.setTjm((p: number) => (p || 0) + 10)}
              onDecrement={() => sim.setters.setTjm((p: number) => Math.max(0, (p || 0) - 10))}
              suffix="€"
              label="TJM"
            />
          </FieldCard>
          <FieldCard
            icon={Receipt}
            label="Jours travaillés par an"
            description="Nombre de jours facturés annuellement"
          >
            <NumberInput
              value={sim.state.days ?? 0}
              onChange={(v) => sim.setters.setDays(v)}
              onIncrement={() => sim.setters.setDays((p: number) => Math.min(365, (p || 0) + 5))}
              onDecrement={() => sim.setters.setDays((p: number) => Math.max(0, (p || 0) - 5))}
              suffix="j"
              label="Jours"
            />
          </FieldCard>
          <InfoBox variant="info">
            Avec un TJM de {sim.state.tjm} € sur {sim.state.days} jours, vous générez un CA annuel de{' '}
            {fmtEur(annualRevenue)}. En micro-entreprise, le plafond est de 77 700 € pour les
            services.
          </InfoBox>
        </>
      )}

      {/* PANNEAU CHARGES */}
      {activePanel === 'charges' && (
        <>
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              Charges déductibles (toutes structures)
            </h3>
            <div className="grid gap-3">
              {nonWarning.map(renderChargeRow)}
            </div>
          </div>
          {warning.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                EURL / SASU uniquement (non déductible en portage)
              </h3>
              <div className="grid gap-3">
                {warning.map(renderChargeRow)}
              </div>
            </div>
          )}
        </>
      )}

      {/* PANNEAU AMORTISSEMENT */}
      {activePanel === 'amortissement' && (
        <>
          <FieldCard
            icon={Calculator}
            label="Achat matériel (année 1)"
            description="Ordinateur, équipement… amorti sur 3 ans (EURL/SASU)"
          >
            <NumberInput
              value={materielAnnuel}
              onChange={(v) => sim.setters.setMaterielAnnuel(v)}
              onIncrement={() => sim.setters.setMaterielAnnuel((p: number) => (p || 0) + 100)}
              onDecrement={() => sim.setters.setMaterielAnnuel((p: number) => Math.max(0, (p || 0) - 100))}
              suffix="€"
              label="Achat matériel"
            />
          </FieldCard>
          <InfoBox variant="info">
            L’achat de matériel (PC, écran, téléphone pro…) peut être amorti sur 3 ans en EURL ou SASU.
            La déduction est répartie sur 3 exercices. En micro-entreprise et en portage, ce poste n’est pas déductible.
          </InfoBox>
        </>
      )}

      {/* PANNEAU VÉHICULE */}
      {activePanel === 'vehicule' && (() => {
        const ikEstimate = getIK(
          kmAnnuel,
          typeVehicule,
          typeVehicule === 'cyclo50' ? undefined : cvFiscauxRaw,
          sim.state.vehiculeElectrique ?? false
        );
        return (
          <>
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
                        sim.setters.setTypeVehicule(t);
                        if (t === 'moto' && !BANDES_MOTO.includes(cvFiscauxRaw as any))
                          sim.setters.setCvFiscaux('3-5');
                        if (t === 'voiture' && BANDES_MOTO.includes(cvFiscauxRaw as any))
                          sim.setters.setCvFiscaux('6');
                      }}
                      className={cn(
                        'flex-1 min-w-[100px] p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all',
                        typeVehicule === t
                          ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300'
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
                  onClick={() => sim.setters.setVehiculeElectrique(!sim.state.vehiculeElectrique)}
                  className={cn(
                    'w-14 h-8 rounded-full transition-colors relative p-1 shrink-0',
                    sim.state.vehiculeElectrique ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-600'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform',
                      sim.state.vehiculeElectrique ? 'left-1 translate-x-6' : 'left-1 translate-x-0'
                    )}
                  />
                </button>
              </div>
            </div>
            <FieldCard
              icon={Car}
              label="Kilomètres professionnels annuels"
              description="Trajets clients, réunions, etc."
            >
              <NumberInput
                value={kmAnnuel}
                onChange={(v) => sim.setters.setKmAnnuel(v)}
                onIncrement={() => sim.setters.setKmAnnuel((p: number) => (p || 0) + 500)}
                onDecrement={() => sim.setters.setKmAnnuel((p: number) => Math.max(0, (p || 0) - 500))}
                suffix="km"
                label="Km"
              />
            </FieldCard>
            {typeVehicule === 'voiture' && (
              <FieldCard
                icon={Car}
                label="Puissance fiscale"
                description="Chevaux fiscaux (barème IK)"
              >
                <select
                  value={cvFiscauxRaw}
                  onChange={(e) => sim.setters.setCvFiscaux(e.target.value)}
                  className="px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30"
                >
                  {[3, 4, 5, 6, 7].map((cv) => (
                    <option key={cv} value={cv}>
                      {cv} CV
                    </option>
                  ))}
                </select>
              </FieldCard>
            )}
            {typeVehicule === 'moto' && (
              <FieldCard
                icon={Bike}
                label="Bande moto"
                description="Barème IK"
              >
                <select
                  value={BANDES_MOTO.includes(cvFiscauxRaw as any) ? cvFiscauxRaw : '3-5'}
                  onChange={(e) => sim.setters.setCvFiscaux(e.target.value)}
                  className="px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:border-indigo-500"
                >
                  {BANDES_MOTO.map((b) => (
                    <option key={b} value={b}>
                      {BANDE_MOTO_LABEL[b]}
                    </option>
                  ))}
                </select>
              </FieldCard>
            )}
            <Link
              href={`/outils/indemnites-km?ik_km=${kmAnnuel}&ik_type=${typeVehicule}&ik_cv=${encodeURIComponent(cvFiscauxRaw ?? (typeVehicule === 'voiture' ? '6' : '3-5'))}&ik_elec=${sim.state.vehiculeElectrique ? '1' : '0'}`}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              <Calculator className="w-4 h-4" />
              Simuler le barème en détail
            </Link>
            <InfoBox variant="info">
              Les indemnités kilométriques suivent le barème URSSAF : déductibles pour l&apos;entreprise (EURL/SASU) et
              exonérées de cotisations et d&apos;impôt sur le revenu pour vous.
            </InfoBox>
          </>
        );
      })()}

      {/* PANNEAU OPTIMISATIONS */}
      {activePanel === 'opti' && (
        <>
          <FieldCard
            icon={Home}
            label="Loyer perçu (sous-location bureau)"
            description="Si vous louez une partie de votre domicile à votre société"
          >
            <NumberInput
              value={loyerPercu}
              onChange={(v) => sim.setters.setLoyerPercu(v)}
              onIncrement={() => sim.setters.setLoyerPercu((p: number) => (p || 0) + 50)}
              onDecrement={() => sim.setters.setLoyerPercu((p: number) => Math.max(0, (p || 0) - 50))}
              suffix="€"
              label="Loyer"
            />
          </FieldCard>
          <FieldCard
            icon={Gift}
            label="Avantages optimisés"
            description="CE, CSE, chèques vacances…"
          >
            <NumberInput
              value={avantagesOptimises}
              onChange={(v) => sim.setters.setAvantagesOptimises(v)}
              onIncrement={() => sim.setters.setAvantagesOptimises((p: number) => (p || 0) + 100)}
              onDecrement={() =>
                sim.setters.setAvantagesOptimises((p: number) => Math.max(0, (p || 0) - 100))
              }
              suffix="€"
              label="Avantages"
            />
          </FieldCard>
          <InfoBox variant="info">
            Loyer perçu (location à son entreprise) et avantages CE/CSE (chèques vacances, etc.) sont
            des leviers d&apos;optimisation — réinjectés en revenu net dans les plafonds légaux.
          </InfoBox>
        </>
      )}

      {/* PANNEAU COTISATIONS (ACRE + CFE) */}
      {activePanel === 'cotisations' && (
        <>
          {/* Ligne ACRE */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">ACRE</h3>
            </div>
            <div
              onClick={() => sim.setters.setAcreEnabled(!sim.state.acreEnabled)}
              className="flex items-center justify-between rounded-xl px-4 py-3 border-2 cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600"
            >
              <p className="font-semibold text-slate-900 dark:text-white">Allègement an 1</p>
              <div
                className={cn(
                  'w-12 h-7 rounded-full flex items-center transition-colors',
                  sim.state.acreEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 bg-white rounded-full shadow mx-0.5 transition-transform',
                    sim.state.acreEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  )}
                />
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              ≈ −50 % cotis. an 1 (hors CSG/CRDS)
            </p>
          </div>

          {/* Ligne CFE */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">CFE</h3>
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
              Taille de la ville (CFE)
            </p>
            <div className="flex gap-3 flex-wrap">
              {CITY_OPTIONS.map(({ key, label, amount }) => {
                const isSelected = currentCity === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => sim.setters.setCitySize(key)}
                    className={cn(
                      'flex-1 min-w-[100px] p-4 rounded-xl border-2 text-left transition-all',
                      isSelected
                        ? 'bg-violet-50 dark:bg-violet-950/30 border-violet-500 dark:border-violet-400 text-violet-700 dark:text-violet-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
                    )}
                  >
                    <p className="font-semibold">{label}</p>
                    <p className={cn(
                      'text-sm mt-0.5',
                      isSelected ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-slate-400'
                    )}>
                      {amount}
                    </p>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              0 € an 1 (création), puis selon ville.
            </p>
          </div>
          <InfoBox variant="info">
            Les cotisations sociales sont calculées selon la structure choisie. ACRE et CFE
            s&apos;appliquent aux créations et reprises d&apos;entreprise.
          </InfoBox>
        </>
      )}

      {/* PANNEAU FOYER (Situation familiale — IR) */}
      {activePanel === 'foyer' && (
        <>
          <div className="w-full p-5 rounded-xl bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <p className="font-semibold text-slate-900 dark:text-white">Situation familiale</p>
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold">
                {sim.state.taxParts} parts
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Composition du foyer</span>
                <div className="inline-flex w-fit rounded-xl bg-slate-100 dark:bg-slate-700 p-1 gap-0.5">
                  <button
                    type="button"
                    onClick={() => sim.setters.setNbAdultes(1)}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                      sim.state.nbAdultes === 1
                        ? 'bg-slate-700 dark:bg-slate-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                    )}
                  >
                    <User className="w-4 h-4" /> Célibataire
                  </button>
                  <button
                    type="button"
                    onClick={() => sim.setters.setNbAdultes(2)}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                      sim.state.nbAdultes === 2
                        ? 'bg-slate-700 dark:bg-slate-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                    )}
                  >
                    <Users className="w-4 h-4" /> Couple
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Enfants</span>
                <div className="flex items-center gap-2 w-fit">
                  <button
                    type="button"
                    onClick={() => sim.setters.setNbEnfants(Math.max(0, (sim.state.nbEnfants ?? 0) - 1))}
                    className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                    aria-label="Moins d’enfants"
                  >
                    <Minus className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </button>
                  <span className="min-w-8 text-center font-semibold text-slate-900 dark:text-white tabular-nums">
                    {sim.state.nbEnfants ?? 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => sim.setters.setNbEnfants(Math.min(6, (sim.state.nbEnfants ?? 0) + 1))}
                    className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                    aria-label="Plus d’enfants"
                  >
                    <Plus className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </button>
                </div>
              </div>
            </div>
            {sim.state.nbAdultes < 2 && (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 italic">
                Passez en mode Couple pour saisir les revenus du conjoint.
              </p>
            )}
          </div>
          <FieldCard
            icon={Users}
            label="Revenus du conjoint"
            description="Pour le calcul du quotient familial"
          >
            <NumberInput
              value={spouseIncome}
              onChange={(v) => sim.setters.setSpouseIncome(v)}
              onIncrement={() => sim.setters.setSpouseIncome((p: number) => (p || 0) + 1000)}
              onDecrement={() => sim.setters.setSpouseIncome((p: number) => Math.max(0, (p || 0) - 1000))}
              suffix="€"
              label="Revenus conjoint"
              disabled={sim.state.nbAdultes < 2}
            />
          </FieldCard>
          <InfoBox variant="info">
            Le quotient familial impacte le calcul de l&apos;impôt sur le revenu.
          </InfoBox>
        </>
      )}
    </div>
  );
}
