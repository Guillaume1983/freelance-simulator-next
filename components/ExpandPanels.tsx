'use client';
import { useRef } from 'react';
import { CHARGES_CATALOG } from '@/lib/constants';
import Link from 'next/link';
import { Car, Bike, Home, CheckCircle2, Circle, Users, Zap, Building2, Gift, Receipt, User, ShieldCheck, Calculator } from 'lucide-react';

export default function ExpandPanels({ activePanel, sim }: any) {
  if (!activePanel) return null;
  if (!sim?.state) return null;

  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startHold = (fn: () => void) => {
    fn();
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdDelayRef.current) {
      clearTimeout(holdDelayRef.current);
      holdDelayRef.current = null;
    }
    holdDelayRef.current = setTimeout(() => {
      holdTimerRef.current = setInterval(fn, 120);
    }, 300);
  };

  const stopHold = () => {
    if (holdDelayRef.current) {
      clearTimeout(holdDelayRef.current);
      holdDelayRef.current = null;
    }
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const totalDepensesMensuelles = Math.round(
    CHARGES_CATALOG.reduce((sum, item) => {
      const amount = sim.state.chargeAmounts?.[item.id] ?? item.amount;
      return sum + (amount || 0);
    }, 0) + ((sim.state.materielAnnuel ?? 0) / 36)
  );

  const totalPortageMensuel = Math.round(
    CHARGES_CATALOG.reduce((sum, item) => {
      if (item.portageWarning) return sum;
      const amount = sim.state.chargeAmounts?.[item.id] ?? item.amount;
      return sum + (amount || 0);
    }, 0) + ((sim.state.materielAnnuel ?? 0) / 36)
  );

  const materielAnnuel = sim.state.materielAnnuel ?? 0;
  const kmAnnuel = sim.state.kmAnnuel ?? 0;
  const loyerPercu = sim.state.loyerPercu ?? 0;
  const loyerAnnuel = loyerPercu * 12;
  const avantagesOptimises = sim.state.avantagesOptimises ?? 1500;
  const spouseIncome = sim.state.spouseIncome ?? 0;
  const typeVehicule = sim.state.typeVehicule ?? 'voiture';
  const cvFiscauxRaw = sim.state.cvFiscaux ?? '6';
  const cvFiscaux = typeVehicule === 'voiture' ? (Number(cvFiscauxRaw) || 6) : cvFiscauxRaw;
  const cvMin = typeVehicule === 'voiture' ? 3 : 0;
  const cvMax = typeVehicule === 'voiture' ? 7 : 0;
  const BANDES_MOTO = ['1-2', '3-5', '5+'] as const;
  const BANDE_MOTO_LABEL: Record<string, string> = { '1-2': '1–2 cv', '3-5': '3–5 cv', '5+': '5+ cv' };
  const CITY_ORDER = ['petite', 'moyenne', 'grande'] as const;
  const CITY_LABEL: Record<string, string> = {
    petite: 'Petite ville ≈ 300 €/an',
    moyenne: 'Ville moyenne ≈ 550 €/an',
    grande: 'Grande ville ≈ 900 €/an',
  };
  const currentCity: string = sim.state.citySize ?? 'petite';
  const cityIndex = Math.max(0, CITY_ORDER.indexOf(currentCity as any));
  const cityLabel = CITY_LABEL[currentCity] ?? CITY_LABEL.petite;
  const avantagesMensuel = avantagesOptimises / 12;

  const nonWarning = CHARGES_CATALOG.filter(c => !c.portageWarning);
  const warning    = CHARGES_CATALOG.filter(c =>  c.portageWarning);

  const renderChargeRow = (item: typeof CHARGES_CATALOG[number] | undefined) => {
    if (!item) return null;
    const isAmber  = item.portageWarning;
    const amount   = sim.state.chargeAmounts?.[item.id] ?? item.amount;
    const safeAmount = typeof amount === 'number' && !Number.isNaN(amount) ? amount : 0;
    return (
      <div
        key={item.id}
        className="w-full flex items-center justify-between rounded-2xl px-3 py-2 text-left bg-white/10 dark:bg-slate-900/60 border border-white/15 text-white"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className={`w-4 h-4 ${isAmber ? 'text-amber-300' : 'text-emerald-300'}`} />
          <div className="flex flex-col">
            <span className="text-[10px] font-800 uppercase tracking-tight text-white/85">{item.name}</span>
            <span className="text-[9px] text-white/65">{safeAmount.toLocaleString()} €/mois</span>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2" onClick={e => e.stopPropagation()}>
          <div className="relative">
            <input
              type="number"
              value={safeAmount}
              onChange={e => {
                const v = Number(e.target.value);
                const normalized = Number.isNaN(v) ? 0 : Math.max(0, v);
                sim.setters.setChargeAmounts((prev: Record<string, number> | undefined) => {
                  const base = prev || {};
                  return {
                    ...base,
                    [item.id]: normalized,
                  };
                });
              }}
              onFocus={e => e.target.select()}
              className="tjm-days-input w-16 pr-5 py-1 text-[10px] font-bold text-right"
            />
            <span className="absolute right-1 top-1 text-[8px] font-black text-white/70">€/m</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
              onMouseDown={() =>
                startHold(() =>
                  sim.setters.setChargeAmounts((prev: Record<string, number> | undefined) => {
                    const base = prev || {};
                    const current = base[item.id] ?? item.amount ?? 0;
                    const safeCurrent =
                      typeof current === 'number' && !Number.isNaN(current) ? current : 0;
                    return {
                      ...base,
                      [item.id]: safeCurrent + 1,
                    };
                  }),
                )
              }
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={() =>
                startHold(() =>
                  sim.setters.setChargeAmounts((prev: Record<string, number> | undefined) => {
                    const base = prev || {};
                    const current = base[item.id] ?? item.amount ?? 0;
                    const safeCurrent =
                      typeof current === 'number' && !Number.isNaN(current) ? current : 0;
                    return {
                      ...base,
                      [item.id]: safeCurrent + 1,
                    };
                  }),
                )
              }
              onTouchEnd={stopHold}
              onTouchCancel={stopHold}
              aria-label={`Augmenter ${item.name}`}
            >
              ▲
            </button>
            <button
              type="button"
              className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
              onMouseDown={() =>
                startHold(() =>
                  sim.setters.setChargeAmounts((prev: Record<string, number> | undefined) => {
                    const base = prev || {};
                    const current = base[item.id] ?? item.amount ?? 0;
                    const safeCurrent =
                      typeof current === 'number' && !Number.isNaN(current) ? current : 0;
                    return {
                      ...base,
                      [item.id]: Math.max(0, safeCurrent - 1),
                    };
                  }),
                )
              }
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={() =>
                startHold(() =>
                  sim.setters.setChargeAmounts((prev: Record<string, number> | undefined) => {
                    const base = prev || {};
                    const current = base[item.id] ?? item.amount ?? 0;
                    const safeCurrent =
                      typeof current === 'number' && !Number.isNaN(current) ? current : 0;
                    return {
                      ...base,
                      [item.id]: Math.max(0, safeCurrent - 1),
                    };
                  }),
                )
              }
              onTouchEnd={stopHold}
              onTouchCancel={stopHold}
              aria-label={`Diminuer ${item.name}`}
            >
              ▼
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-6 px-4 md:px-0 animate-in fade-in slide-in-from-top-4 duration-500">

      {/* PANNEAU ACTIVITÉ */}
      {activePanel === 'activite' && (
        <div className="card-pro mt-3 md:mt-4 bg-white/10 dark:bg-slate-900/60 text-white border border-indigo-300/60 dark:border-indigo-500/70 px-4 md:px-6 py-5">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-xl text-indigo-200"><Zap size={18} /></div>
              <h3 className="text-xs font-900 uppercase tracking-widest text-white">Activité</h3>
            </div>
            <span className="text-lg font-black text-white tabular-nums">{Math.round((sim.state.tjm || 0) * (sim.state.days || 0)).toLocaleString()} €/an</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <div className="rounded-xl px-3 py-2.5 bg-white/10 border border-white/15 flex items-center justify-between gap-2 text-white">
              <span className="text-[10px] font-bold uppercase text-white/85">TJM (€/jour)</span>
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <input type="number" value={sim.state.tjm ?? ''} onChange={e => { const v = Number(e.target.value); sim.setters.setTjm(Number.isNaN(v) ? 0 : Math.max(0, v)); }} onFocus={e => e.target.select()} className="tjm-days-input w-20 py-1.5 px-2 text-[11px] font-bold rounded-lg bg-white/10 border border-white/20 text-right" placeholder="0" />
                <div className="flex flex-col gap-0.5">
                  <button type="button" className="w-5 h-3 rounded bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white hover:bg-white/20" onMouseDown={() => startHold(() => sim.setters.setTjm((p: number) => (p || 0) + 1))} onMouseUp={stopHold} onMouseLeave={stopHold} aria-label="+TJM">▲</button>
                  <button type="button" className="w-5 h-3 rounded bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white hover:bg-white/20" onMouseDown={() => startHold(() => sim.setters.setTjm((p: number) => Math.max(0, (p || 0) - 1)))} onMouseUp={stopHold} onMouseLeave={stopHold} aria-label="-TJM">▼</button>
                </div>
              </div>
            </div>
            <div className="rounded-xl px-3 py-2.5 bg-white/10 border border-white/15 flex items-center justify-between gap-2 text-white">
              <span className="text-[10px] font-bold uppercase text-white/85">Jours / an</span>
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <input type="number" value={sim.state.days ?? ''} onChange={e => { const v = Number(e.target.value); sim.setters.setDays(Number.isNaN(v) ? 0 : Math.max(0, v)); }} onFocus={e => e.target.select()} className="tjm-days-input w-20 py-1.5 px-2 text-[11px] font-bold rounded-lg bg-white/10 border border-white/20 text-right" placeholder="0" />
                <div className="flex flex-col gap-0.5">
                  <button type="button" className="w-5 h-3 rounded bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white hover:bg-white/20" onMouseDown={() => startHold(() => sim.setters.setDays((p: number) => (p || 0) + 1))} onMouseUp={stopHold} onMouseLeave={stopHold} aria-label="+Jours">▲</button>
                  <button type="button" className="w-5 h-3 rounded bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white hover:bg-white/20" onMouseDown={() => startHold(() => sim.setters.setDays((p: number) => Math.max(0, (p || 0) - 1)))} onMouseUp={stopHold} onMouseLeave={stopHold} aria-label="-Jours">▼</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PANNEAU CHARGES */}
      {activePanel === 'charges' && (
        <div className="card-pro mt-3 md:mt-4 bg-white/10 dark:bg-slate-900/60 text-white border border-rose-300/60 dark:border-rose-500/70 px-4 md:px-6 py-5">

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-xl text-emerald-200"><Receipt size={18} /></div>
              <h3 className="text-xs font-900 uppercase tracking-widest text-white">Charges pro</h3>
            </div>
            <div className="flex gap-6">
              <div className="text-right">
                <span className="text-[9px] font-bold text-amber-300 uppercase">Portage</span>
                <p className="text-base font-black text-amber-200 tabular-nums">{Math.round(totalPortageMensuel)} €/mois</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-rose-300 uppercase">EURL · SASU</span>
                <p className="text-base font-black text-white tabular-nums">{totalDepensesMensuelles} €/mois</p>
              </div>
            </div>
          </div>

          {/* Grille 5 colonnes — mobile : 1 col, desktop : 5 cols */}
          <div className="hidden md:grid md:grid-cols-5 md:gap-3">

            {/* Ligne d'en-têtes des groupes */}
            <div className="col-span-2 pb-1 border-b border-emerald-300/60 mb-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-300">Portage · EURL · SASU</span>
            </div>
            <div className="col-span-3 pb-1 border-b border-amber-300/60 mb-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-200">EURL · SASU uniquement</span>
            </div>

            {/* Ligne 1 : nonWarning[0..1], warning[0..2] */}
            {renderChargeRow(nonWarning[0])}
            {renderChargeRow(nonWarning[1])}
            {renderChargeRow(warning[0])}
            {renderChargeRow(warning[1])}
            {renderChargeRow(warning[2])}

            {/* Ligne 2 : nonWarning[2], matériel, warning[3..5] */}
            {renderChargeRow(nonWarning[2])}
            {/* Matériel annuel — col 2, ligne 2, même puce que les autres dépenses */}
            <div className="rounded-2xl px-3 py-2 bg-white/10 dark:bg-slate-900/60 border border-white/15 flex items-center justify-between gap-2 text-white">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-800 uppercase tracking-tight text-white/85">Matériel annuel</span>
                  <span className="text-[9px] text-white/65">amorti 3 ans</span>
                </div>
              </div>
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <div className="relative">
                    <input
                      type="number"
                      value={materielAnnuel}
                      onChange={e => {
                        const v = Number(e.target.value);
                        sim.setters.setMaterielAnnuel(Number.isNaN(v) ? 0 : Math.max(0, v));
                      }}
                      onFocus={e => e.target.select()}
                      className="tjm-days-input w-20 pr-8 py-1 text-[10px] font-bold text-right"
                      placeholder="0"
                    />
                    <span className="absolute right-1.5 top-1 text-[8px] font-black text-white/70">€/an</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
                      onMouseDown={() =>
                        startHold(() =>
                          sim.setters.setMaterielAnnuel((prev: number) => (prev || 0) + 1)
                        )
                      }
                      onMouseUp={stopHold}
                      onMouseLeave={stopHold}
                      onTouchStart={() =>
                        startHold(() =>
                          sim.setters.setMaterielAnnuel((prev: number) => (prev || 0) + 1)
                        )
                      }
                      onTouchEnd={stopHold}
                      onTouchCancel={stopHold}
                      aria-label="Augmenter le matériel annuel"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
                      onMouseDown={() =>
                        startHold(() =>
                          sim.setters.setMaterielAnnuel((prev: number) =>
                            Math.max(0, (prev || 0) - 1),
                          )
                        )
                      }
                      onMouseUp={stopHold}
                      onMouseLeave={stopHold}
                      onTouchStart={() =>
                        startHold(() =>
                          sim.setters.setMaterielAnnuel((prev: number) =>
                            Math.max(0, (prev || 0) - 1),
                          )
                        )
                      }
                      onTouchEnd={stopHold}
                      onTouchCancel={stopHold}
                      aria-label="Diminuer le matériel annuel"
                    >
                      ▼
                    </button>
                  </div>
                </div>
            </div>
            {renderChargeRow(warning[3])}
            {renderChargeRow(warning[4])}
            {renderChargeRow(warning[5])}

          </div>

            {/* Mobile : liste verticale avec séparateur entre les groupes */}
          <div className="md:hidden space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/70">Portage · EURL · SASU</p>
            {nonWarning.map(renderChargeRow)}
            {/* Matériel */}
            <div className="rounded-2xl px-3 py-2 bg-white/10 dark:bg-slate-900/60 border border-white/15 flex items-center justify-between gap-2 text-white">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-800 uppercase tracking-tight text-white/85">Matériel annuel</span>
                  <span className="text-[9px] text-white/65">amorti 3 ans</span>
                </div>
              </div>
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <div className="relative">
                  <input
                    type="number"
                    value={materielAnnuel}
                    onChange={e => {
                      const v = Number(e.target.value);
                      sim.setters.setMaterielAnnuel(Number.isNaN(v) ? 0 : Math.max(0, v));
                    }}
                    onFocus={e => e.target.select()}
                    className="tjm-days-input w-20 pr-8 py-1 text-[10px] font-bold text-right"
                    placeholder="0"
                  />
                  <span className="absolute right-1.5 top-1 text-[8px] font-black text-white/70">€/an</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
                    onMouseDown={() =>
                      startHold(() =>
                        sim.setters.setMaterielAnnuel((prev: number) => (prev || 0) + 1)
                      )
                    }
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    onTouchStart={() =>
                      startHold(() =>
                        sim.setters.setMaterielAnnuel((prev: number) => (prev || 0) + 1)
                      )
                    }
                    onTouchEnd={stopHold}
                    onTouchCancel={stopHold}
                    aria-label="Augmenter le matériel annuel"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
                    onMouseDown={() =>
                      startHold(() =>
                        sim.setters.setMaterielAnnuel((prev: number) =>
                          Math.max(0, (prev || 0) - 1),
                        )
                      )
                    }
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    onTouchStart={() =>
                      startHold(() =>
                        sim.setters.setMaterielAnnuel((prev: number) =>
                          Math.max(0, (prev || 0) - 1),
                        )
                      )
                    }
                    onTouchEnd={stopHold}
                    onTouchCancel={stopHold}
                    aria-label="Diminuer le matériel annuel"
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-amber-200 pt-2">EURL · SASU uniquement</p>
            {warning.map(renderChargeRow)}
          </div>

        </div>
      )}

      {/* PANNEAU VÉHICULE */}
      {activePanel === 'vehicule' && (
        <div className="card-pro mt-3 md:mt-4 bg-white/10 dark:bg-slate-900/60 text-white border border-emerald-300/60 dark:border-emerald-500/70 px-4 md:px-6 py-5">
          <div className="max-w-xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-xl text-emerald-200"><Car size={18} /></div>
              <h3 className="text-xs font-900 uppercase tracking-widest text-white">Indemnités kilométriques</h3>
            </div>
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-white/70 uppercase">Type</span>
              <div className="flex gap-1.5 flex-wrap">
                {(['voiture', 'moto', 'cyclo50'] as const).map((t) => {
                  const isVoiture = t === 'voiture';
                  const isMoto = t === 'moto';
                  const isCyclo = t === 'cyclo50';
                  const label = isVoiture ? 'Voiture' : isMoto ? 'Moto' : 'Cyclo 50';
                  const Icon = isVoiture ? Car : isMoto ? Bike : Circle;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        sim.setters.setTypeVehicule(t);
                        if (t === 'moto' && !BANDES_MOTO.includes(cvFiscauxRaw as any)) sim.setters.setCvFiscaux('3-5');
                        if (t === 'voiture' && BANDES_MOTO.includes(cvFiscauxRaw as any)) sim.setters.setCvFiscaux('6');
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                        typeVehicule === t
                          ? 'bg-emerald-500/30 border-emerald-400 text-white'
                          : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer rounded-xl px-3 py-2 bg-white/5 border border-white/15 hover:bg-white/10 transition">
              <input
                type="checkbox"
                checked={sim.state.vehiculeElectrique ?? false}
                onChange={e => sim.setters.setVehiculeElectrique(e.target.checked)}
                className="rounded accent-emerald-500"
                onClick={e => e.stopPropagation()}
              />
              <span className="text-[10px] font-bold text-white/90">Véhicule électrique</span>
              <span className="text-[9px] text-white/60">(+20 % barème URSSAF)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 min-w-0">
                <div className="rounded-2xl px-3 py-2 bg-white/10 dark:bg-slate-900/60 border border-white/15 flex items-center justify-between gap-2 text-white min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-800 uppercase tracking-tight text-white/85 truncate">Distance annuelle</span>
                      <span className="text-[9px] text-white/65">km / an</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <div className="relative">
                      <input
                        type="number"
                        value={kmAnnuel}
                        onChange={e => {
                          const v = Number(e.target.value);
                          sim.setters.setKmAnnuel(Number.isNaN(v) ? 0 : Math.max(0, v));
                        }}
                        onFocus={e => e.target.select()}
                        className="tjm-days-input w-20 pr-5 py-1 text-[10px] font-bold text-right"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
                        onMouseDown={() =>
                          startHold(() =>
                            sim.setters.setKmAnnuel((prev: number) => (prev || 0) + 1),
                          )
                        }
                        onMouseUp={stopHold}
                        onMouseLeave={stopHold}
                        onTouchStart={() =>
                          startHold(() =>
                            sim.setters.setKmAnnuel((prev: number) => (prev || 0) + 1),
                          )
                        }
                        onTouchEnd={stopHold}
                        onTouchCancel={stopHold}
                        aria-label="Augmenter la distance annuelle"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
                        onMouseDown={() =>
                          startHold(() =>
                            sim.setters.setKmAnnuel((prev: number) =>
                              Math.max(0, (prev || 0) - 1),
                            ),
                          )
                        }
                        onMouseUp={stopHold}
                        onMouseLeave={stopHold}
                        onTouchStart={() =>
                          startHold(() =>
                            sim.setters.setKmAnnuel((prev: number) =>
                              Math.max(0, (prev || 0) - 1),
                            ),
                          )
                        }
                        onTouchEnd={stopHold}
                        onTouchCancel={stopHold}
                        aria-label="Diminuer la distance annuelle"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {typeVehicule !== 'cyclo50' && (
              <div className="space-y-2 min-w-0">
                <div className="rounded-2xl px-3 py-2 bg-white/10 dark:bg-slate-900/60 border border-white/15 flex items-center justify-between gap-2 text-white min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-800 uppercase tracking-tight text-white/85 truncate">
                        {typeVehicule === 'voiture' ? 'Puissance fiscale' : 'Bande moto'}
                      </span>
                      <span className="text-[9px] text-white/65">barème IK</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    {typeVehicule === 'moto' ? (
                      <select
                        value={BANDES_MOTO.includes(cvFiscauxRaw as any) ? cvFiscauxRaw : '3-5'}
                        onChange={e => sim.setters.setCvFiscaux(e.target.value)}
                        className="tjm-days-input w-full min-w-[72px] px-2 py-1 text-[10px] font-bold rounded-lg bg-white/10 border border-white/25 text-white"
                      >
                        {BANDES_MOTO.map((b) => (
                          <option key={b} value={b} className="text-slate-800">{BANDE_MOTO_LABEL[b]}</option>
                        ))}
                      </select>
                    ) : (
                      <>
                        <div className="relative">
                          <input
                            type="number"
                            value={cvFiscaux}
                            min={cvMin}
                            max={cvMax}
                            onChange={e => {
                              const v = Number(e.target.value);
                              const next = Math.min(cvMax, Math.max(cvMin, Number.isNaN(v) ? cvMin : v));
                              sim.setters.setCvFiscaux(String(next));
                            }}
                            onFocus={e => e.target.select()}
                            className="tjm-days-input w-16 pr-6 py-1 text-[10px] font-bold text-right"
                            placeholder="6"
                          />
                          <span className="absolute right-1.5 top-1 text-[8px] font-black text-white/70">CV</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
                            onMouseDown={() =>
                              startHold(() => {
                                const next = Math.min(cvMax, (Number(sim.state.cvFiscaux) || 6) + 1);
                                sim.setters.setCvFiscaux(String(next));
                              })
                            }
                            onMouseUp={stopHold}
                            onMouseLeave={stopHold}
                            onTouchStart={() =>
                              startHold(() => {
                                const next = Math.min(cvMax, (Number(sim.state.cvFiscaux) || 6) + 1);
                                sim.setters.setCvFiscaux(String(next));
                              })
                            }
                            onTouchEnd={stopHold}
                            onTouchCancel={stopHold}
                            aria-label="Augmenter la puissance fiscale"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
                            onMouseDown={() =>
                              startHold(() => {
                                const next = Math.max(cvMin, (Number(sim.state.cvFiscaux) || 6) - 1);
                                sim.setters.setCvFiscaux(String(next));
                              })
                            }
                            onMouseUp={stopHold}
                            onMouseLeave={stopHold}
                            onTouchStart={() =>
                              startHold(() => {
                                const next = Math.max(cvMin, (Number(sim.state.cvFiscaux) || 6) - 1);
                                sim.setters.setCvFiscaux(String(next));
                              })
                            }
                            onTouchEnd={stopHold}
                            onTouchCancel={stopHold}
                            aria-label="Diminuer la puissance fiscale"
                          >
                            ▼
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
          <Link
            href={`/outils/indemnites-km?ik_km=${kmAnnuel}&ik_type=${typeVehicule}&ik_cv=${encodeURIComponent(cvFiscauxRaw ?? (typeVehicule === 'voiture' ? '6' : '3-5'))}&ik_elec=${sim.state.vehiculeElectrique ? '1' : '0'}`}
            className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-200 hover:text-white transition-colors"
          >
            <Calculator className="w-3.5 h-3.5" />
            Simuler le barème en détail
          </Link>
          <p className="mt-2 text-[9px] text-white/60">Barème URSSAF · charge entreprise, net pour vous (exonéré cotis. et IR).</p>
        </div>
      )}

      {/* PANNEAU OPTIMISATIONS */}
      {activePanel === 'opti' && (
        <div className="card-pro mt-3 md:mt-4 bg-white/10 dark:bg-slate-900/60 text-white border border-emerald-300/60 dark:border-emerald-500/70 px-4 md:px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-xl text-blue-200"><Home size={18} /></div>
                <h3 className="text-xs font-900 uppercase tracking-widest text-white">Loyer perçu</h3>
              </div>
              <div className="rounded-xl px-3 py-2.5 bg-white/10 border border-white/15 flex items-center justify-between gap-2 text-white">
                <div>
                  <span className="text-[10px] font-bold uppercase text-white/85">Mensuel TTC</span>
                  <span className="text-[9px] text-white/60 block">{loyerPercu > 0 ? `${loyerAnnuel.toLocaleString()} €/an` : '—'}</span>
                </div>
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <input
                    type="number"
                    value={loyerPercu}
                    onChange={e => { const v = Number(e.target.value); sim.setters.setLoyerPercu(Number.isNaN(v) ? 0 : Math.max(0, v)); }}
                    onFocus={e => e.target.select()}
                    className="tjm-days-input w-20 py-1.5 px-2 text-[11px] font-bold rounded-lg bg-white/10 border border-white/20 text-right"
                    placeholder="0"
                  />
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
                        onMouseDown={() =>
                          startHold(() =>
                            sim.setters.setLoyerPercu((prev: number) => (prev || 0) + 1),
                          )
                        }
                        onMouseUp={stopHold}
                        onMouseLeave={stopHold}
                        onTouchStart={() =>
                          startHold(() =>
                            sim.setters.setLoyerPercu((prev: number) => (prev || 0) + 1),
                          )
                        }
                        onTouchEnd={stopHold}
                        onTouchCancel={stopHold}
                        aria-label="Augmenter le loyer perçu"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
                        onMouseDown={() =>
                          startHold(() =>
                            sim.setters.setLoyerPercu((prev: number) =>
                              Math.max(0, (prev || 0) - 1),
                            ),
                          )
                        }
                        onMouseUp={stopHold}
                        onMouseLeave={stopHold}
                        onTouchStart={() =>
                          startHold(() =>
                            sim.setters.setLoyerPercu((prev: number) =>
                              Math.max(0, (prev || 0) - 1),
                            ),
                          )
                        }
                        onTouchEnd={stopHold}
                        onTouchCancel={stopHold}
                        aria-label="Diminuer le loyer perçu"
                      >
                        ▼
                      </button>
                    </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-xl text-violet-200"><Gift size={18} /></div>
                <h3 className="text-xs font-900 uppercase tracking-widest text-white">Avantages</h3>
              </div>
              <div className="rounded-xl px-3 py-2.5 bg-white/10 border border-white/15 flex items-center justify-between gap-2 text-white">
                <div>
                  <span className="text-[10px] font-bold uppercase text-white/85">Annuel (CE, chèques vacances…)</span>
                  <span className="text-[9px] text-white/60 block">{avantagesOptimises > 0 ? `${Math.round(avantagesMensuel)} €/mois` : '—'}</span>
                </div>
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <input
                    type="number"
                    value={avantagesOptimises}
                    onChange={e => { const v = Number(e.target.value); sim.setters.setAvantagesOptimises(Number.isNaN(v) ? 0 : Math.max(0, v)); }}
                    onFocus={e => e.target.select()}
                    className="tjm-days-input w-20 py-1.5 px-2 text-[11px] font-bold rounded-lg bg-white/10 border border-white/20 text-right"
                    placeholder="1500"
                  />
                  <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
                        onMouseDown={() =>
                          startHold(() =>
                            sim.setters.setAvantagesOptimises(
                              (prev: number) => (prev || 0) + 1,
                            ),
                          )
                        }
                        onMouseUp={stopHold}
                        onMouseLeave={stopHold}
                        onTouchStart={() =>
                          startHold(() =>
                            sim.setters.setAvantagesOptimises(
                              (prev: number) => (prev || 0) + 1,
                            ),
                          )
                        }
                        onTouchEnd={stopHold}
                        onTouchCancel={stopHold}
                        aria-label="Augmenter les avantages optimisés"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
                        onMouseDown={() =>
                          startHold(() =>
                            sim.setters.setAvantagesOptimises((prev: number) =>
                              Math.max(0, (prev || 0) - 1),
                            ),
                          )
                        }
                        onMouseUp={stopHold}
                        onMouseLeave={stopHold}
                        onTouchStart={() =>
                          startHold(() =>
                            sim.setters.setAvantagesOptimises((prev: number) =>
                              Math.max(0, (prev || 0) - 1),
                            ),
                          )
                        }
                        onTouchEnd={stopHold}
                        onTouchCancel={stopHold}
                        aria-label="Diminuer les avantages optimisés"
                      >
                        ▼
                      </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[10px] text-white/70 italic font-medium text-center">
            Loyer perçu (location à son entreprise) et avantages CE/CSE (chèques vacances, etc.) sont des leviers d&apos;optimisation — réinjectés en revenu net dans les plafonds légaux.
          </p>
        </div>
      )}

      {/* PANNEAU COTISATIONS (ACRE + CFE) */}
      {activePanel === 'cotisations' && (
        <div className="card-pro mt-3 md:mt-4 bg-white/10 dark:bg-slate-900/60 text-white border border-indigo-300/60 dark:border-indigo-500/70 px-4 md:px-6 py-5 md:py-6">
          <div className="max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-xl text-emerald-200"><ShieldCheck size={18} /></div>
                <h3 className="text-xs font-900 uppercase tracking-widest text-white">ACRE</h3>
              </div>
              <div
                onClick={() => sim.setters.setAcreEnabled(!sim.state.acreEnabled)}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 border cursor-pointer transition-colors ${
                  sim.state.acreEnabled ? 'bg-emerald-500/20 border-emerald-300/70' : 'bg-white/5 border-white/15'
                }`}
              >
                <p className="text-[10px] font-black uppercase text-white/90">Allègement an 1</p>
                <div className={`w-9 h-5 rounded-full flex items-center transition-colors ${sim.state.acreEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow mx-0.5 transition-transform ${sim.state.acreEnabled ? 'translate-x-4' : ''}`} />
                </div>
              </div>
              <p className="text-[9px] text-white/60">≈ −50 % cotis. an 1 (hors CSG/CRDS)</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-xl text-rose-200"><Building2 size={18} /></div>
                <h3 className="text-xs font-900 uppercase tracking-widest text-white">CFE</h3>
              </div>
              <label className="block text-[9px] font-bold text-white/75 uppercase">Taille de la ville</label>
              <select
                value={currentCity}
                onChange={e => sim.setters.setCitySize(e.target.value)}
                className="w-full max-w-[200px] p-2 text-[11px] font-bold rounded-lg border border-white/30 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/70"
              >
                {CITY_ORDER.map(key => (
                  <option key={key} value={key} className="bg-white text-slate-900">{CITY_LABEL[key]}</option>
                ))}
              </select>
              <p className="text-[9px] text-white/60">0 € an 1 (création), puis selon ville.</p>
            </div>
          </div>
        </div>
      )}

      {/* PANNEAU FOYER (Situation familiale — IR) */}
      {activePanel === 'foyer' && (
        <div className="card-pro mt-3 md:mt-4 bg-white/10 dark:bg-slate-900/60 text-white border border-amber-300/70 dark:border-amber-500/70 px-4 md:px-6 py-5 md:py-6">
          <div className="max-w-xl space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-xl text-amber-200"><Users size={18} /></div>
                <h3 className="text-xs font-900 uppercase tracking-widest text-white">Situation familiale</h3>
              </div>
              <span className="px-2 py-1 rounded-full bg-amber-500/20 text-[9px] font-black uppercase">{sim.state.taxParts} parts</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex rounded-lg bg-white/5 p-1 border border-white/15">
                <button
                  type="button"
                  onClick={() => sim.setters.setNbAdultes(1)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-[10px] font-bold uppercase transition-colors ${sim.state.nbAdultes === 1 ? 'bg-amber-500 text-white' : 'text-white/70 hover:bg-white/10'}`}
                >
                  <User className="w-3.5 h-3.5" /> Célibataire
                </button>
                <button
                  type="button"
                  onClick={() => sim.setters.setNbAdultes(2)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-[10px] font-bold uppercase transition-colors ${sim.state.nbAdultes === 2 ? 'bg-amber-500 text-white' : 'text-white/70 hover:bg-white/10'}`}
                >
                  <Users className="w-3.5 h-3.5" /> Couple
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-white/75 uppercase">Enfants</span>
                <button type="button" onClick={() => sim.setters.setNbEnfants(Math.max(0, sim.state.nbEnfants - 1))} className="w-7 h-7 rounded-full bg-white/10 font-black text-white hover:bg-amber-500/90 flex items-center justify-center" aria-label="Moins">−</button>
                <span className="min-w-6 text-center font-900 text-white tabular-nums">{sim.state.nbEnfants}</span>
                <button type="button" onClick={() => sim.setters.setNbEnfants(Math.min(6, sim.state.nbEnfants + 1))} className="w-7 h-7 rounded-full bg-white/10 font-black text-white hover:bg-amber-500/90 flex items-center justify-center" aria-label="Plus">+</button>
              </div>
            </div>
            <div className="rounded-xl px-3 py-2.5 bg-white/10 border border-white/15 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-white/85">Revenus conjoint</span>
                <span className="text-[9px] text-white/60 block">{spouseIncome.toLocaleString()} €/an</span>
              </div>
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <input
                  type="number"
                  value={spouseIncome}
                  onChange={e => { const v = Number(e.target.value); sim.setters.setSpouseIncome(Number.isNaN(v) ? 0 : Math.max(0, v)); }}
                  onFocus={e => e.target.select()}
                  className="tjm-days-input w-24 py-1.5 px-2 text-[11px] font-bold rounded-lg bg-white/10 border border-white/20 text-right"
                  placeholder="0"
                  disabled={sim.state.nbAdultes < 2}
                />
                <span className="text-[8px] text-white/60">€/an</span>
              </div>
            </div>
            {sim.state.nbAdultes < 2 && <p className="text-[9px] text-white/60 italic">Mode Couple pour saisir le conjoint.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
