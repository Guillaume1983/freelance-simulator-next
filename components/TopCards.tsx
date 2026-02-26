'use client';
import { Zap, Receipt, Sparkles, Users, ChevronDown } from 'lucide-react';

export default function TopCards({ sim, togglePanel }: any) {
  const fmt = (v: number) => Math.round(v).toLocaleString() + " €";

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-4 mt-8 max-w-[1600px] mx-auto px-4 md:px-6">
      {/* Production */}
      <div className="card-pro px-4 md:px-5 py-4 md:py-5 border-l-4 border-l-indigo-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 p-3 rounded-2xl"><Zap className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Production Annuelle</p>
            <p className="font-900 text-slate-900 dark:text-white text-xl tracking-tight">{fmt(sim.state.tjm * sim.state.days)}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-24">
          <div className="relative">
            <span className="absolute right-2 top-1 text-[8px] font-bold text-slate-300">TJM</span>
            <input type="number" value={sim.state.tjm} onChange={(e) => sim.setters.setTjm(Number(e.target.value))} className="w-full !text-left pl-2 text-xs font-bold h-7" />
          </div>
          <div className="relative">
            <span className="absolute right-2 top-1 text-[8px] font-bold text-slate-300">JOURS</span>
            <input type="number" value={sim.state.days} onChange={(e) => sim.setters.setDays(Number(e.target.value))} className="w-full !text-left pl-2 text-xs font-bold h-7" />
          </div>
        </div>
      </div>

      {/* Charges */}
      <div className="card-pro px-4 md:px-5 py-4 md:py-5 border-l-4 border-l-rose-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 p-3 rounded-2xl"><Receipt className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Charges / mois</p>
            <p className="font-900 text-slate-900 dark:text-white text-xl tracking-tight">{fmt(sim.resultats[0].fees / 12)}</p>
          </div>
        </div>
        <div className="expand-trigger shadow-sm" onClick={() => togglePanel('charges')}>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Optimisations */}
      <div className="card-pro px-4 md:px-5 py-4 md:py-5 border-l-4 border-l-emerald-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 p-3 rounded-2xl"><Sparkles className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Optimisations</p>
            <p className="font-900 text-slate-900 dark:text-white text-xl tracking-tight uppercase">IK & Loyer</p>
          </div>
        </div>
        <div className="expand-trigger shadow-sm" onClick={() => togglePanel('opti')}>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Situation */}
      <div className="card-pro px-4 md:px-5 py-4 md:py-5 border-l-4 border-l-amber-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 p-3 rounded-2xl"><Users className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Situation Fiscale</p>
            <p className="font-900 text-slate-900 dark:text-white text-xl tracking-tight">Impôts</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <select value={sim.state.taxParts} onChange={(e) => sim.setters.setTaxParts(Number(e.target.value))} className="w-20 text-xs font-bold h-7">
            <option value="1">1 part</option>
            <option value="2">2 pts</option>
            <option value="3">3 pts</option>
          </select>
        </div>
      </div>
    </div>
  );
}