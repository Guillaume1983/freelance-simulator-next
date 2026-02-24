'use client';
import { CHARGES_CATALOG } from '@/hooks/useSimulation';
import { Car, Home, CheckCircle2, Circle } from 'lucide-react';

export default function ExpandPanels({ activePanel, sim }: any) {
  if (!activePanel) return null;

  return (
    <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* PANNEAU CATALOGUE DES CHARGES */}
      {activePanel === 'charges' && (
        <div className="card-pro p-8 border-t-4 border-t-rose-500 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-sm font-900 uppercase tracking-widest text-slate-900 dark:text-white">Catalogue des charges</h3>
              <p className="text-[11px] text-slate-500 font-bold uppercase mt-1">Sélectionnez vos dépenses professionnelles mensuelles</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-rose-500 uppercase italic">Total mensuel</span>
              <p className="text-2xl font-900 text-slate-900 dark:text-white leading-none">
                {Math.round(sim.resultats[0].fees / 12)} €
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {CHARGES_CATALOG.map((item) => {
              const isActive = sim.state.activeCharges.includes(item.id);
              return (
                <div 
                  key={item.id}
                  onClick={() => {
                    const newCharges = isActive 
                      ? sim.state.activeCharges.filter((id: string) => id !== item.id)
                      : [...sim.state.activeCharges, item.id];
                    sim.setters.setActiveCharges(newCharges);
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-3 group ${
                    isActive 
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-900/20' 
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    {isActive ? <CheckCircle2 className="w-5 h-5 text-rose-500" /> : <Circle className="w-5 h-5 text-slate-200" />}
                    <span className={`text-xs font-900 ${isActive ? 'text-rose-600' : 'text-slate-400'}`}>
                      {item.amount}€<span className="text-[9px] opacity-60">/m</span>
                    </span>
                  </div>
                  <p className={`text-[11px] font-800 uppercase tracking-tight leading-tight ${isActive ? 'text-rose-900 dark:text-rose-100' : 'text-slate-500'}`}>
                    {item.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PANNEAU OPTIMISATIONS (IK & LOYER) */}
      {activePanel === 'opti' && (
        <div className="card-pro p-8 border-t-4 border-t-emerald-500 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Colonne IK */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl text-emerald-600">
                  <Car size={20} />
                </div>
                <h3 className="text-sm font-900 uppercase tracking-widest dark:text-white">Indemnités Kilométriques</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Distance annuelle (km)</label>
                  <input 
                    type="number" 
                    value={sim.state.kmAnnuel}
                    onChange={(e) => sim.setters.setKmAnnuel(Number(e.target.value))}
                    className="w-full p-3 font-800 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Puissance Fiscale</label>
                  <select 
                    value={sim.state.cvFiscaux}
                    onChange={(e) => sim.setters.setCvFiscaux(e.target.value)}
                    className="w-full p-3 font-800 text-sm"
                  >
                    <option value="4">4 CV</option>
                    <option value="5">5 CV</option>
                    <option value="6">6 CV</option>
                    <option value="7">7 CV et +</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Colonne Loyer */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600">
                  <Home size={20} />
                </div>
                <h3 className="text-sm font-900 uppercase tracking-widest dark:text-white">Location Bureau (Domicile)</h3>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">Loyer mensuel perçu (TTC)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={sim.state.loyerPercu}
                    onChange={(e) => sim.setters.setLoyerPercu(Number(e.target.value))}
                    className="w-full p-3 font-800 text-sm"
                  />
                  <span className="absolute right-4 top-3 text-[10px] font-black text-slate-300">EUR / MOIS</span>
                </div>
                <p className="text-[10px] text-slate-400 italic font-medium">Ce montant sera réinjecté en revenu net sans cotisations sociales.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}