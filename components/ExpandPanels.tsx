'use client';

import { CHARGES_CATALOG } from '@/lib/constants';
import { cn } from '@/lib/utils';
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
import NumberInput from '@/components/NumberInput';

function FieldCard({
  icon: Icon,
  label,
  description,
  children,
  color = 'slate',
  showIcon = false,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  children: React.ReactNode;
  color?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan' | 'blue';
  /** Permet de supprimer l'icône si elle est déjà présente dans un header parent. */
  showIcon?: boolean;
}) {
  const colorClasses: Record<string, { bg: string; text: string }> = {
    slate: { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-400' },
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/50', text: 'text-indigo-600 dark:text-indigo-400' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/50', text: 'text-emerald-600 dark:text-emerald-400' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-600 dark:text-amber-400' },
    rose: { bg: 'bg-rose-100 dark:bg-rose-900/50', text: 'text-rose-600 dark:text-rose-400' },
    violet: { bg: 'bg-violet-100 dark:bg-violet-900/50', text: 'text-violet-600 dark:text-violet-400' },
    cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/50', text: 'text-cyan-600 dark:text-cyan-400' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400' },
  };
  const colors = colorClasses[color] ?? colorClasses.slate;

  return (
    <div className="w-full p-1 rounded-lg">
      <div className="flex items-center justify-end gap-3">
        <div className="flex items-center justify-end gap-3 min-w-0">
          {showIcon && (
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', colors.bg)}>
              <Icon className={cn('w-4 h-4', colors.text)} />
            </div>
          )}
          <div className="min-w-[150px] text-right pr-1 h-9 flex items-center justify-end">
            <p className="font-medium text-[13px] text-slate-900 dark:text-white leading-none whitespace-nowrap">
              {label}
            </p>
            {description ? null : null}
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
    info: 'text-blue-700 dark:text-blue-300',
    warning:
      'text-amber-700 dark:text-amber-300',
    success:
      'text-emerald-700 dark:text-emerald-300',
  };
  return (
    <div className={cn('text-xs leading-relaxed', styles[variant])}>
      {children}
    </div>
  );
}

export default function ExpandPanels({
  activePanel,
  sim,
  activeRegimeId,
  suppressNonApplicablePanels,
}: any) {
  if (!activePanel) return null;
  if (!sim?.state) return null;

  const isMicro = Boolean(suppressNonApplicablePanels) && activeRegimeId === 'Micro';

  const materielAnnuel = sim.state.materielAnnuel ?? 0;
  const kmAnnuel = sim.state.kmAnnuel ?? 0;
  const loyerPercu = sim.state.loyerPercu ?? 0;
  const loyerAnnuel = loyerPercu * 12;
  const avantagesOptimises = sim.state.avantagesOptimises ?? 1500;
  const spouseIncome = sim.state.spouseIncome ?? 0;
  const vehiculeActive = sim.state.sectionsActive?.vehicule ?? false;
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
    const raw = sim.state.chargeAmounts?.[item.id] ?? 0;
    const safeAmount = typeof raw === 'number' && !Number.isNaN(raw) ? raw : 0;
    return (
      <div
        key={item.id}
        className="w-full flex items-center justify-end gap-3 p-1 rounded-lg"
      >
        <p className="min-w-[150px] font-medium text-[13px] text-slate-900 dark:text-white leading-none text-right pr-1 h-9 flex items-center justify-end">
          {item.name}
        </p>
        <div className="shrink-0 flex items-center gap-2">
          <NumberInput
            value={safeAmount}
            onChange={(v) => {
              sim.setters.setChargeAmounts((prev: Record<string, number> | undefined) => ({
                ...(prev || {}),
                [item.id]: v,
              }));
              sim.setters.setActiveCharges((prevIds: string[]) => {
                if (v > 0) {
                  return prevIds.includes(item.id) ? prevIds : [...prevIds, item.id];
                }
                return prevIds.filter((id) => id !== item.id);
              });
            }}
            onIncrement={() => {
              const next = safeAmount + 5;
              sim.setters.setChargeAmounts((prev: Record<string, number> | undefined) => ({
                ...(prev || {}),
                [item.id]: next,
              }));
              sim.setters.setActiveCharges((prevIds: string[]) => {
                return prevIds.includes(item.id) ? prevIds : [...prevIds, item.id];
              });
            }}
            onDecrement={() => {
              const next = Math.max(0, safeAmount - 5);
              sim.setters.setChargeAmounts((prev: Record<string, number> | undefined) => ({
                ...(prev || {}),
                [item.id]: next,
              }));
              sim.setters.setActiveCharges((prevIds: string[]) => {
                if (next <= 0) return prevIds.filter((id) => id !== item.id);
                return prevIds.includes(item.id) ? prevIds : [...prevIds, item.id];
              });
            }}
            suffix="€"
            label={item.name}
          />
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">/mois</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-1.5 animate-in fade-in duration-300">
      {/* PANNEAU ACTIVITÉ */}
      {activePanel === 'activite' && (
        <>
          <FieldCard
            icon={Zap}
            label="Taux Journalier Moyen (TJM)"
            description="Votre tarif journalier facturé aux clients"
            color="indigo"
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
            description="Nombre de jours facturés sur l'année"
            color="indigo"
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
            Votre chiffre d&apos;affaires est calculé automatiquement : TJM × Jours = CA annuel.
          </InfoBox>
        </>
      )}

      {/* PANNEAU CHARGES */}
      {activePanel === 'charges' && !isMicro && (
        <>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 px-1">
              <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Charges déductibles (toutes structures)
              </h3>
            </div>
            <div className="grid gap-0.5">
              {nonWarning.map(renderChargeRow)}
            </div>
          </div>
          {warning.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center gap-2 px-1">
                <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  EURL / SASU uniquement
                </h3>
              </div>
              <div className="grid gap-0.5">
                {warning.map(renderChargeRow)}
              </div>
              <InfoBox variant="warning">
                Ces charges ne sont pas déductibles en portage salarial.
              </InfoBox>
            </div>
          )}
        </>
      )}

      {activePanel === 'charges' && isMicro && (
        <div className="p-4 text-xs text-slate-500 dark:text-slate-400">
          Non disponible pour la micro-entreprise.
        </div>
      )}

      {/* PANNEAU AMORTISSEMENT */}
      {activePanel === 'amortissement' && !isMicro && (
        <>
          <FieldCard
            icon={Calculator}
            label="Achat matériel (année 1)"
            description="Ordinateur, écran, téléphone pro, mobilier…"
            color="amber"
          >
            <NumberInput
              value={materielAnnuel}
              onChange={(v) => sim.setters.setMaterielAnnuel(v)}
              onIncrement={() => sim.setters.setMaterielAnnuel((p: number) => (p || 0) + 100)}
              onDecrement={() => sim.setters.setMaterielAnnuel((p: number) => Math.max(0, (p || 0) - 100))}
              suffix="€"
              label="Achat matériel"
              inputClassName="w-40 min-w-[10rem] max-w-[min(100%,12rem)]"
            />
          </FieldCard>
          <InfoBox variant="info">
            Le matériel professionnel est amorti sur 3 ans en EURL/SASU (déduction répartie sur 3 exercices).
            Non applicable en micro-entreprise ou en portage.
          </InfoBox>
        </>
      )}

      {activePanel === 'amortissement' && isMicro && (
        <div className="p-4 text-xs text-slate-500 dark:text-slate-400">
          Non disponible pour la micro-entreprise.
        </div>
      )}

      {/* PANNEAU VÉHICULE */}
      {activePanel === 'vehicule' && !isMicro && (() => {
        return (
          <>
            <div className="space-y-3">
              {/* Activation IK */}
              <div className="p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <Car className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Indemnités kilométriques
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      sim.setters.setSectionsActive((prev: any) => ({ ...prev, vehicule: true }));
                    }}
                    className={cn(
                      'flex-1 min-w-[120px] p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all text-sm',
                      vehiculeActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                    )}
                  >
                    <Car className="w-4 h-4" />
                    <span className="font-semibold">Avec IK</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sim.setters.setSectionsActive((prev: any) => ({ ...prev, vehicule: false }));
                    }}
                    className={cn(
                      'flex-1 min-w-[120px] p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all text-sm',
                      !vehiculeActive
                        ? 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                    )}
                  >
                    <Circle className="w-4 h-4" />
                    <span className="font-semibold">Sans IK</span>
                  </button>
                </div>
              </div>

              <div className={vehiculeActive ? 'space-y-3' : 'hidden'}>
                {/* Type véhicule */}
                <div className="p-3 rounded-lg">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2 px-1">
                    Type de véhicule
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {(['voiture', 'moto', 'cyclo50'] as const).map((t) => {
                      const label = t === 'voiture' ? 'Voiture' : t === 'moto' ? 'Moto' : 'Cyclo 50';
                      const VIcon = t === 'voiture' ? Car : t === 'moto' ? Bike : Circle;
                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={!vehiculeActive}
                          onClick={() => {
                            sim.setters.setTypeVehicule(t);
                            if (t === 'moto' && !BANDES_MOTO.includes(cvFiscauxRaw as any))
                              sim.setters.setCvFiscaux('3-5');
                            if (t === 'voiture' && BANDES_MOTO.includes(cvFiscauxRaw as any))
                              sim.setters.setCvFiscaux('6');
                          }}
                          className={cn(
                            'flex-1 min-w-[80px] p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all',
                            typeVehicule === t
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300',
                            !vehiculeActive && 'opacity-50 pointer-events-none'
                          )}
                        >
                          <VIcon className="w-5 h-5" />
                          <span className="font-medium text-xs">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Électrique toggle */}
                <div className="p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">Véhicule électrique</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Majoration +20% sur les IK</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!vehiculeActive}
                      onClick={() => sim.setters.setVehiculeElectrique(!sim.state.vehiculeElectrique)}
                      className={cn(
                        'w-12 h-7 rounded-full transition-colors relative shrink-0',
                        sim.state.vehiculeElectrique ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-600',
                        !vehiculeActive && 'opacity-50 pointer-events-none'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform',
                          sim.state.vehiculeElectrique ? 'left-0.5 translate-x-5' : 'left-0.5 translate-x-0'
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Km annuels */}
                <FieldCard
                  icon={Car}
                  label="Kilomètres annuels"
                  description="Trajets clients, réunions, formations…"
                  color="emerald"
                >
                  <NumberInput
                    value={vehiculeActive ? kmAnnuel : 0}
                    disabled={!vehiculeActive}
                    onChange={(v) => sim.setters.setKmAnnuel(v)}
                    onIncrement={() => sim.setters.setKmAnnuel((p: number) => (p || 0) + 500)}
                    onDecrement={() => sim.setters.setKmAnnuel((p: number) => Math.max(0, (p || 0) - 500))}
                    suffix="km"
                    label="Km"
                  />
                </FieldCard>

                {/* Puissance fiscale voiture */}
                {typeVehicule === 'voiture' && (
                  <FieldCard
                    icon={Car}
                    label="Puissance fiscale"
                    description="Chevaux fiscaux pour le barème"
                    color="emerald"
                  >
                    <select
                      value={cvFiscauxRaw}
                      disabled={!vehiculeActive}
                      onChange={(e) => sim.setters.setCvFiscaux(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30"
                    >
                      {[3, 4, 5, 6, 7].map((cv) => (
                        <option key={cv} value={cv}>
                          {cv} CV
                        </option>
                      ))}
                    </select>
                  </FieldCard>
                )}

                {/* Bande moto */}
                {typeVehicule === 'moto' && (
                  <FieldCard
                    icon={Bike}
                    label="Bande moto"
                    description="Catégorie pour le barème IK"
                    color="emerald"
                  >
                    <select
                      value={BANDES_MOTO.includes(cvFiscauxRaw as any) ? cvFiscauxRaw : '3-5'}
                      disabled={!vehiculeActive}
                      onChange={(e) => sim.setters.setCvFiscaux(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30"
                    >
                      {BANDES_MOTO.map((b) => (
                        <option key={b} value={b}>
                          {BANDE_MOTO_LABEL[b]}
                        </option>
                      ))}
                    </select>
                  </FieldCard>
                )}

                {/* Info + lien */}
                <InfoBox variant="info">
                  Les IK suivent le barème URSSAF : déductibles en EURL/SASU, exonérées de cotisations et d&apos;IR pour vous.
                </InfoBox>

                <Link
                  href={`/outils?outil=indemnites-km&ik_km=${kmAnnuel}&ik_type=${typeVehicule}&ik_cv=${encodeURIComponent(cvFiscauxRaw ?? (typeVehicule === 'voiture' ? '6' : '3-5'))}&ik_elec=${sim.state.vehiculeElectrique ? '1' : '0'}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition-colors"
                >
                  <Calculator className="w-4 h-4" />
                  Simuler le barème en détail
                </Link>
              </div>
            </div>
          </>
        );
      })()}

      {activePanel === 'vehicule' && isMicro && (
        <div className="p-4 text-xs text-slate-500 dark:text-slate-400">
          Non disponible pour la micro-entreprise.
        </div>
      )}

      {/* PANNEAU OPTIMISATIONS */}
      {activePanel === 'opti' && (
        <>
          <FieldCard
            icon={Home}
            label="Loyer perçu mensuel"
            description="Sous-location d'une partie de votre domicile à votre société"
            color="violet"
          >
            <NumberInput
              value={loyerPercu}
              onChange={(v) => {
                sim.setters.setLoyerPercu(v);
              }}
              onIncrement={() => {
                const next = (loyerPercu ?? 0) + 50;
                sim.setters.setLoyerPercu(next);
              }}
              onDecrement={() => {
                const next = Math.max(0, (loyerPercu ?? 0) - 50);
                sim.setters.setLoyerPercu(next);
              }}
              suffix="€"
              label="Loyer"
            />
          </FieldCard>
          <FieldCard
            icon={Gift}
            label="Avantages annuels"
            description="CE, CSE, chèques vacances, culture…"
            color="violet"
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
          <InfoBox variant="success">
            Ces leviers d&apos;optimisation sont réinjectés en revenu net, dans les plafonds légaux.
          </InfoBox>
        </>
      )}

      {/* PANNEAU COTISATIONS (ACRE + CFE) */}
      {activePanel === 'cotisations' && (
        <>
          {/* Ligne ACRE */}
          <div className="p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">ACRE</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">≈ −50% cotisations an 1</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => sim.setters.setAcreEnabled(!sim.state.acreEnabled)}
                className={cn(
                  'w-12 h-7 rounded-full transition-colors relative shrink-0',
                  sim.state.acreEnabled ? 'bg-cyan-500' : 'bg-slate-200 dark:bg-slate-600'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform',
                    sim.state.acreEnabled ? 'left-0.5 translate-x-5' : 'left-0.5 translate-x-0'
                  )}
                />
              </button>
            </div>
          </div>

          {/* Ligne CFE */}
          <div className="p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-6 h-6 rounded-md bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                CFE (taille de la ville)
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {CITY_OPTIONS.map(({ key, label, amount }) => {
                const isSelected = currentCity === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => sim.setters.setCitySize(key)}
                    className={cn(
                      'flex-1 min-w-[90px] p-3 rounded-lg border text-left transition-all',
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-400 dark:border-rose-600 text-rose-700 dark:text-rose-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
                    )}
                  >
                    <p className="font-semibold text-sm">{label}</p>
                    <p className={cn(
                      'text-xs mt-0.5',
                      isSelected ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
                    )}>
                      {amount}
                    </p>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              0 € la 1ère année (création), puis selon la ville.
            </p>
          </div>
          <InfoBox variant="info">
            ACRE et CFE s&apos;appliquent aux créations et reprises d&apos;entreprise.
          </InfoBox>
        </>
      )}

      {/* PANNEAU FOYER (Situation familiale — IR) */}
      {activePanel === 'foyer' && (
        <>
          <div className="w-full p-3 rounded-lg space-y-4">
            {/* Composition du foyer */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1">
                <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Composition du foyer
                </span>
              </div>
              <div className="inline-flex w-fit rounded-lg bg-slate-100 dark:bg-slate-700 p-0.5 gap-0.5">
                <button
                  type="button"
                  onClick={() => sim.setters.setNbAdultes(1)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition-colors',
                    sim.state.nbAdultes === 1
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  )}
                >
                  <User className="w-3.5 h-3.5" /> Célibataire
                </button>
                <button
                  type="button"
                  onClick={() => sim.setters.setNbAdultes(2)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition-colors',
                    sim.state.nbAdultes === 2
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  )}
                >
                  <Users className="w-3.5 h-3.5" /> Couple
                </button>
              </div>
            </div>

            {/* Enfants */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide px-1">
                Enfants à charge
              </span>
              <div className="flex items-center gap-2 w-fit">
                <button
                  type="button"
                  onClick={() => sim.setters.setNbEnfants(Math.max(0, (sim.state.nbEnfants ?? 0) - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                  aria-label="Moins d'enfants"
                >
                  <Minus className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                </button>
                <span className="min-w-8 text-center font-bold text-slate-900 dark:text-white tabular-nums">
                  {sim.state.nbEnfants ?? 0}
                </span>
                <button
                  type="button"
                  onClick={() => sim.setters.setNbEnfants(Math.min(6, (sim.state.nbEnfants ?? 0) + 1))}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                  aria-label="Plus d'enfants"
                >
                  <Plus className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </button>
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
            showIcon={false}
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
