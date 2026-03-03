'use client';
import { CHARGES_CATALOG } from '@/lib/constants';
import { Car, Home, CheckCircle2, Circle, Users, Zap, Building2, Gift } from 'lucide-react';

export default function ExpandPanels({ activePanel, sim }: any) {
  if (!activePanel) return null;

  const totalDepensesMensuelles = Math.round(
    CHARGES_CATALOG.reduce((sum, item) => {
      if (!sim.state.activeCharges.includes(item.id)) return sum;
      return sum + (sim.state.chargeAmounts?.[item.id] ?? item.amount);
    }, 0) + ((sim.state.materielAnnuel ?? 0) / 36)
  );

  const totalPortageMensuel = Math.round(
    CHARGES_CATALOG.reduce((sum, item) => {
      if (item.portageWarning) return sum;
      if (!sim.state.activeCharges.includes(item.id)) return sum;
      return sum + (sim.state.chargeAmounts?.[item.id] ?? item.amount);
    }, 0) + ((sim.state.materielAnnuel ?? 0) / 36)
  );

  const nonWarning = CHARGES_CATALOG.filter(c => !c.portageWarning);
  const warning    = CHARGES_CATALOG.filter(c =>  c.portageWarning);

  const renderChargeBtn = (item: typeof CHARGES_CATALOG[number] | undefined) => {
    if (!item) return null;
    const isActive = sim.state.activeCharges.includes(item.id);
    const isAmber  = item.portageWarning;
    const amount   = sim.state.chargeAmounts?.[item.id] ?? item.amount;
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
          isActive && !isAmber ? 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200/60 dark:border-rose-800/60'
          : isActive && isAmber ? 'bg-amber-50/60 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/40'
          : 'bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center gap-2">
          {isActive
            ? <CheckCircle2 className={`w-4 h-4 ${isAmber ? 'text-amber-400' : 'text-rose-500'}`} />
            : <Circle className="w-4 h-4 text-slate-300" />
          }
          <div className="flex flex-col">
            <span className={`text-[10px] font-800 uppercase tracking-tight ${
              isActive && isAmber ? 'text-amber-700 dark:text-amber-300'
              : isActive ? 'text-rose-900 dark:text-rose-100'
              : 'text-slate-500'
            }`}>{item.name}</span>
            <span className="text-[9px] text-slate-400">{amount.toLocaleString()} €/mois</span>
          </div>
        </div>
        <div className="relative ml-2" onClick={e => e.stopPropagation()}>
          <input
            type="number"
            value={amount}
            onChange={e => sim.setters.setChargeAmounts({ ...sim.state.chargeAmounts, [item.id]: Number(e.target.value) || 0 })}
            className="w-16 pr-5 py-1 text-[10px] font-bold bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg text-right"
          />
          <span className="absolute right-1 top-1 text-[8px] font-black text-slate-400">€/m</span>
        </div>
      </button>
    );
  };

  return (
    <div className="mb-6 px-4 md:px-0 animate-in fade-in slide-in-from-top-4 duration-500">

      {/* PANNEAU CATALOGUE DES CHARGES */}
      {activePanel === 'charges' && (
        <div className="mt-2 md:mt-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 px-4 md:px-6 py-4 md:py-5 shadow-sm">

          {/* En-tête */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 md:gap-0 mb-5">
            <div>
              <h3 className="text-xs md:text-sm font-900 uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                Dépenses professionnelles
              </h3>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                Mensuelles · TVA 20% récupérée en société · Matériel amorti 3 ans · Micro : abattement forfaitaire, dépenses non déductibles
              </p>
            </div>
            <div className="flex gap-4 items-end">
              <div className="text-right">
                <span className="text-[9px] font-black text-amber-500 uppercase italic">Portage</span>
                <p className="text-lg font-900 text-amber-600 dark:text-amber-400 leading-none">
                  {Math.round(totalPortageMensuel)} €<span className="text-[9px] font-normal text-slate-400 ml-0.5">/mois</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black text-rose-500 uppercase italic">EURL · SASU</span>
                <p className="text-xl font-900 text-slate-900 dark:text-white leading-none">
                  {totalDepensesMensuelles} €<span className="text-[9px] font-normal text-slate-400 ml-0.5">/mois</span>
                </p>
              </div>
            </div>
          </div>

          {/* Grille 5 colonnes — mobile : 1 col, desktop : 5 cols */}
          <div className="hidden md:grid md:grid-cols-5 md:gap-3">

            {/* Ligne d'en-têtes des groupes */}
            <div className="col-span-2 pb-1 border-b border-slate-200 dark:border-slate-700 mb-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Portage · EURL · SASU</span>
            </div>
            <div className="col-span-3 pb-1 border-b border-amber-200 dark:border-amber-800/50 mb-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">EURL · SASU uniquement</span>
            </div>

            {/* Ligne 1 : nonWarning[0..1], warning[0..2] */}
            {renderChargeBtn(nonWarning[0])}
            {renderChargeBtn(nonWarning[1])}
            {renderChargeBtn(warning[0])}
            {renderChargeBtn(warning[1])}
            {renderChargeBtn(warning[2])}

            {/* Ligne 2 : nonWarning[2], matériel, warning[3..5] */}
            {renderChargeBtn(nonWarning[2])}
            {/* Matériel annuel — col 2, ligne 2 */}
            <div className="rounded-2xl px-3 py-2 bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-800 uppercase tracking-tight text-slate-600 dark:text-slate-300">Matériel annuel</span>
                <span className="text-[9px] text-slate-400">amorti 3 ans</span>
              </div>
              <div className="relative" onClick={e => e.stopPropagation()}>
                <input
                  type="number"
                  value={sim.state.materielAnnuel ?? 0}
                  onChange={e => sim.setters.setMaterielAnnuel(Number(e.target.value) || 0)}
                  className="w-20 pr-8 py-1 text-[10px] font-bold bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg text-right"
                  placeholder="0"
                />
                <span className="absolute right-1.5 top-1 text-[8px] font-black text-slate-400">€/an</span>
              </div>
            </div>
            {renderChargeBtn(warning[3])}
            {renderChargeBtn(warning[4])}
            {renderChargeBtn(warning[5])}

          </div>

          {/* Mobile : liste verticale avec séparateur entre les groupes */}
          <div className="md:hidden space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Portage · EURL · SASU</p>
            {nonWarning.map(renderChargeBtn)}
            {/* Matériel */}
            <div className="rounded-2xl px-3 py-2 bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-800 uppercase tracking-tight text-slate-600 dark:text-slate-300">Matériel annuel</span>
                <span className="text-[9px] text-slate-400">amorti 3 ans</span>
              </div>
              <div className="relative" onClick={e => e.stopPropagation()}>
                <input
                  type="number"
                  value={sim.state.materielAnnuel ?? 0}
                  onChange={e => sim.setters.setMaterielAnnuel(Number(e.target.value) || 0)}
                  className="w-20 pr-8 py-1 text-[10px] font-bold bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg text-right"
                  placeholder="0"
                />
                <span className="absolute right-1.5 top-1 text-[8px] font-black text-slate-400">€/an</span>
              </div>
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 pt-2">EURL · SASU uniquement</p>
            {warning.map(renderChargeBtn)}
          </div>

        </div>
      )}

      {/* PANNEAU OPTIMISATIONS (IK, LOYER, AVANTAGES) */}
      {activePanel === 'opti' && (
        <div className="card-pro px-5 md:px-8 py-6 md:py-8 border-t-4 border-t-emerald-500 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
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

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 dark:bg-violet-900/40 rounded-xl text-violet-600"><Gift size={20} /></div>
                <h3 className="text-sm font-900 uppercase tracking-widest dark:text-white">Avantages optimisés</h3>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">Montant annuel (CE, CSE, etc.)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={sim.state.avantagesOptimises ?? 1500}
                    onChange={e => sim.setters.setAvantagesOptimises(Number(e.target.value) || 0)}
                    className="w-full p-3 font-800 text-sm pr-12"
                    placeholder="1500"
                  />
                  <span className="absolute right-3 top-3 text-[10px] font-black text-slate-300">€/an</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PANNEAU SITUATION FISCALE */}
      {activePanel === 'fiscal' && (
        <div className="card-pro px-5 md:px-8 py-6 md:py-8 border-t-4 border-t-amber-500 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Situation familiale */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600"><Users size={20} /></div>
                <h3 className="text-sm font-900 uppercase tracking-widest dark:text-white">Situation fiscale</h3>
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

          </div>
        </div>
      )}
    </div>
  );
}
