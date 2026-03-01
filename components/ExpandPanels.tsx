'use client';
import { CHARGES_CATALOG } from '@/lib/constants';
import { Car, Home, CheckCircle2, Circle, Users, Zap, Building2, TrendingUp, ShieldCheck } from 'lucide-react';

export default function ExpandPanels({ activePanel, sim }: any) {
  if (!activePanel) return null;

  return (
    <div className="mb-6 px-4 md:px-0 animate-in fade-in slide-in-from-top-4 duration-500">

      {/* PANNEAU CATALOGUE DES CHARGES */}
      {activePanel === 'charges' && (
        <div className="mt-2 md:mt-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 px-4 md:px-6 py-4 md:py-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 md:gap-0 mb-4">
            <div>
              <h3 className="text-xs md:text-sm font-900 uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                Catalogue des charges
              </h3>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                Active uniquement ce que tu supportes vraiment chaque mois.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black text-rose-500 uppercase italic">Total mensuel</span>
              <p className="text-xl font-900 text-slate-900 dark:text-white leading-none">
                {Math.round(sim.resultats[0].fees / 12)} €
              </p>
            </div>
          </div>

          <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 md:gap-3">
            {CHARGES_CATALOG.map((item) => {
              const isActive = sim.state.activeCharges.includes(item.id);
              const currentAmount = sim.state.chargeAmounts?.[item.id] ?? item.amount;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    const newCharges = isActive
                      ? sim.state.activeCharges.filter((id: string) => id !== item.id)
                      : [...sim.state.activeCharges, item.id];
                    sim.setters.setActiveCharges(newCharges);
                  }}
                  className={`w-full flex items-center justify-between rounded-2xl px-3 py-2 text-left transition-colors ${
                    isActive
                      ? 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200/60 dark:border-rose-800/60'
                      : 'bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isActive ? <CheckCircle2 className="w-4 h-4 text-rose-500" /> : <Circle className="w-4 h-4 text-slate-300" />}
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-800 uppercase tracking-tight ${isActive ? 'text-rose-900 dark:text-rose-100' : 'text-slate-500'}`}>
                        {item.name}
                      </span>
                      <span className="text-[9px] text-slate-400">{currentAmount.toLocaleString()} €/mois</span>
                    </div>
                  </div>
                  <div className="relative ml-2" onClick={e => e.stopPropagation()}>
                    <input
                      type="number"
                      value={currentAmount}
                      onChange={e => {
                        sim.setters.setChargeAmounts({ ...sim.state.chargeAmounts, [item.id]: Number(e.target.value) || 0 });
                      }}
                      className="w-16 pr-5 py-1 text-[10px] font-bold bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg text-right"
                    />
                    <span className="absolute right-1 top-1 text-[8px] font-black text-slate-400">€/m</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* PANNEAU OPTIMISATIONS (IK & LOYER) */}
      {activePanel === 'opti' && (
        <div className="card-pro px-5 md:px-8 py-6 md:py-8 border-t-4 border-t-emerald-500 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl text-emerald-600"><Car size={20} /></div>
                <h3 className="text-sm font-900 uppercase tracking-widest dark:text-white">Indemnités Kilométriques</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Distance annuelle (km)</label>
                  <input type="number" value={sim.state.kmAnnuel} onChange={e => sim.setters.setKmAnnuel(Number(e.target.value))} className="w-full p-3 font-800 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Puissance Fiscale</label>
                  <select value={sim.state.cvFiscaux} onChange={e => sim.setters.setCvFiscaux(e.target.value)} className="w-full p-3 font-800 text-sm">
                    <option value="4">4 CV</option>
                    <option value="5">5 CV</option>
                    <option value="6">6 CV</option>
                    <option value="7">7 CV et +</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600"><Home size={20} /></div>
                <h3 className="text-sm font-900 uppercase tracking-widest dark:text-white">Location Bureau (Domicile)</h3>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">Loyer mensuel perçu (TTC)</label>
                <div className="relative">
                  <input type="number" value={sim.state.loyerPercu} onChange={e => sim.setters.setLoyerPercu(Number(e.target.value))} className="w-full p-3 font-800 text-sm" />
                  <span className="absolute right-4 top-3 text-[10px] font-black text-slate-300">EUR / MOIS</span>
                </div>
                <p className="text-[10px] text-slate-400 italic font-medium">Ce montant sera réinjecté en revenu net sans cotisations sociales.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PANNEAU FISCAL : foyer, CFE, ACRE, croissance */}
      {activePanel === 'fiscal' && (
        <div className="card-pro px-5 md:px-8 py-6 md:py-8 border-t-4 border-t-amber-500 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Situation familiale */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600"><Users size={20} /></div>
                <h3 className="text-sm font-900 uppercase tracking-widest dark:text-white">Foyer fiscal</h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Situation</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([1, 2] as const).map(n => (
                      <button
                        key={n}
                        onClick={() => sim.setters.setNbAdultes(n)}
                        className={`py-2 rounded-xl text-[10px] font-black uppercase transition-colors ${
                          sim.state.nbAdultes === n
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {n === 1 ? 'Célibataire' : 'Couple'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Enfants à charge</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => sim.setters.setNbEnfants(Math.max(0, sim.state.nbEnfants - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 font-black text-slate-600 dark:text-slate-300 hover:bg-amber-100 transition-colors"
                    >−</button>
                    <span className="flex-1 text-center font-900 text-lg dark:text-white">{sim.state.nbEnfants}</span>
                    <button
                      onClick={() => sim.setters.setNbEnfants(Math.min(6, sim.state.nbEnfants + 1))}
                      className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 font-black text-slate-600 dark:text-slate-300 hover:bg-amber-100 transition-colors"
                    >+</button>
                  </div>
                </div>

                <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 px-3 py-2 border border-amber-100 dark:border-amber-800/40">
                  <p className="text-[9px] font-black text-amber-600 uppercase">Parts fiscales calculées</p>
                  <p className="text-xl font-900 text-amber-700 dark:text-amber-300">{sim.state.taxParts} parts</p>
                </div>
              </div>
            </div>

            {/* Revenus conjoint */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600"><Zap size={20} /></div>
                <h3 className="text-sm font-900 uppercase tracking-widest dark:text-white">Revenus conjoint</h3>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase">Salaire annuel net du conjoint</label>
                <div className="relative">
                  <input
                    type="number"
                    value={sim.state.spouseIncome}
                    onChange={e => sim.setters.setSpouseIncome(Number(e.target.value))}
                    className="w-full p-3 font-800 text-sm pr-12"
                    placeholder="0"
                    disabled={sim.state.nbAdultes < 2}
                  />
                  <span className="absolute right-3 top-3 text-[10px] font-black text-slate-300">€/an</span>
                </div>
                {sim.state.nbAdultes < 2 && (
                  <p className="text-[9px] text-slate-400 italic">Activez le mode "Couple" pour saisir les revenus du conjoint.</p>
                )}
                <p className="text-[9px] text-slate-400 italic">Impacte le calcul de l&apos;IR via la déclaration commune.</p>
              </div>
            </div>

            {/* CFE & ACRE */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-xl text-rose-600"><Building2 size={20} /></div>
                <h3 className="text-sm font-900 uppercase tracking-widest dark:text-white">CFE & ACRE</h3>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Taille de votre ville</label>
                  <select
                    value={sim.state.citySize}
                    onChange={e => sim.setters.setCitySize(e.target.value)}
                    className="w-full p-2.5 font-800 text-sm"
                  >
                    <option value="petite">Petite ville ≈ 300 €/an</option>
                    <option value="moyenne">Ville moyenne ≈ 550 €/an</option>
                    <option value="grande">Grande ville ≈ 900 €/an</option>
                  </select>
                </div>
                <p className="text-[9px] text-slate-400 italic">CFE = 0 € la 1ère année (exonération création). S&apos;applique à partir de l&apos;an 2 sur la projection.</p>

                <div
                  onClick={() => sim.setters.setAcreEnabled(!sim.state.acreEnabled)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 border cursor-pointer transition-colors ${
                    sim.state.acreEnabled
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">ACRE activé</p>
                    <p className="text-[9px] text-slate-400">Cotisations réduites 50% an 1</p>
                  </div>
                  <div className={`w-9 h-5 rounded-full transition-colors flex items-center ${sim.state.acreEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${sim.state.acreEnabled ? 'translate-x-4' : ''}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Croissance & Retraite */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600"><TrendingUp size={20} /></div>
                <h3 className="text-sm font-900 uppercase tracking-widest dark:text-white">Projection</h3>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Croissance CA / an: <span className="text-indigo-500">{sim.state.growthRate}%</span>
                  </label>
                  <input
                    type="range"
                    min={0} max={50} step={5}
                    value={sim.state.growthRate}
                    onChange={e => sim.setters.setGrowthRate(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[8px] text-slate-400 font-bold">
                    <span>0%</span><span>25%</span><span>50%</span>
                  </div>
                </div>

                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 px-3 py-2.5 border border-blue-100 dark:border-blue-800/40">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck size={13} className="text-blue-600" />
                    <p className="text-[9px] font-black text-blue-600 uppercase">Retraite (4 trimestres)</p>
                  </div>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    L&apos;indicateur ✅/⚠️ dans le tableau indique si votre CA valide les 4 trimestres requis par an pour votre régime (basé sur les seuils 2026).
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
