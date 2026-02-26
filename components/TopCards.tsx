'use client';
import { Zap, Receipt, Sparkles, Users, ChevronDown } from 'lucide-react';

export default function TopCards({ sim, activePanel, togglePanel }: any) {
  const fmt = (v: number) => Math.round(v).toLocaleString() + " €";

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 mb-4 mt-8">

      {/* Grille 2×2 mobile */}
      <div className="md:hidden grid grid-cols-2 gap-3">

        {/* Production */}
        <div className="card-pro px-3 py-3 border-l-4 border-l-indigo-500 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 p-2 rounded-xl">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-tight">Production<br/>Annuelle</p>
          </div>
          <p className="font-900 text-slate-900 dark:text-white text-base tracking-tight">
            {fmt(sim.state.tjm * sim.state.days)}
          </p>
          <div className="flex gap-1.5">
            <div className="relative flex-1">
              <span className="absolute right-1 top-0.5 text-[7px] font-bold text-slate-300">TJM</span>
              <input type="number" value={sim.state.tjm} onChange={(e) => sim.setters.setTjm(Number(e.target.value))} className="w-full text-left! pl-1.5 text-xs font-bold h-6" />
            </div>
            <div className="relative w-10">
              <span className="absolute right-1 top-0.5 text-[7px] font-bold text-slate-300">J</span>
              <input type="number" value={sim.state.days} onChange={(e) => sim.setters.setDays(Number(e.target.value))} className="w-full text-left! pl-1.5 text-xs font-bold h-6" />
            </div>
          </div>
        </div>

        {/* Charges */}
        <div className="card-pro px-3 py-3 border-l-4 border-l-rose-500 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 p-2 rounded-xl">
                <Receipt className="w-3.5 h-3.5" />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-tight">Charges<br/>/ mois</p>
            </div>
            <button
              type="button"
              className="expand-trigger shadow-sm rounded-full p-1 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => togglePanel('charges')}
              aria-label="Ouvrir le détail des charges"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${activePanel === 'charges' ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <p className="font-900 text-slate-900 dark:text-white text-base tracking-tight">
            {fmt(sim.resultats[0].fees / 12)}
          </p>
        </div>

        {/* Optimisations */}
        <div className="card-pro px-3 py-3 border-l-4 border-l-emerald-500 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 p-2 rounded-xl">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-tight">Optimi-<br/>sations</p>
            </div>
            <button
              type="button"
              className="expand-trigger shadow-sm rounded-full p-1 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => togglePanel('opti')}
              aria-label="Ouvrir le détail des optimisations"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${activePanel === 'opti' ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <p className="font-900 text-slate-900 dark:text-white text-base tracking-tight uppercase">IK & Loyer</p>
        </div>

        {/* Situation Fiscale */}
        <div className="card-pro px-3 py-3 border-l-4 border-l-amber-500 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 p-2 rounded-xl">
              <Users className="w-3.5 h-3.5" />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-tight">Situation<br/>Fiscale</p>
          </div>
          <p className="font-900 text-slate-900 dark:text-white text-base tracking-tight">Impôts</p>
          <select
            value={sim.state.taxParts}
            onChange={(e) => sim.setters.setTaxParts(Number(e.target.value))}
            className="w-full text-xs font-bold h-6"
          >
            <option value="1">1 part</option>
            <option value="2">2 pts</option>
            <option value="3">3 pts</option>
          </select>
        </div>

      </div>

      {/* Grille desktop */}
      <div className="hidden md:grid grid-cols-4 gap-6">

        {/* Production */}
        <div className="card-pro px-5 py-5 border-l-4 border-l-indigo-500 flex items-center justify-between">
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
              <input type="number" value={sim.state.tjm} onChange={(e) => sim.setters.setTjm(Number(e.target.value))} className="w-full text-left! pl-2 text-xs font-bold h-7" />
            </div>
            <div className="relative">
              <span className="absolute right-2 top-1 text-[8px] font-bold text-slate-300">JOURS</span>
              <input type="number" value={sim.state.days} onChange={(e) => sim.setters.setDays(Number(e.target.value))} className="w-full text-left! pl-2 text-xs font-bold h-7" />
            </div>
          </div>
        </div>

        {/* Charges */}
        <div className="card-pro px-5 py-5 border-l-4 border-l-rose-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 p-3 rounded-2xl">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Charges / mois</p>
              <p className="font-900 text-slate-900 dark:text-white text-xl tracking-tight">{fmt(sim.resultats[0].fees / 12)}</p>
            </div>
          </div>
          <button
            type="button"
            className="expand-trigger shadow-sm rounded-full p-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => togglePanel('charges')}
            aria-label="Ouvrir le détail des charges"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activePanel === 'charges' ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Optimisations */}
        <div className="card-pro px-5 py-5 border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 p-3 rounded-2xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Optimisations</p>
              <p className="font-900 text-slate-900 dark:text-white text-xl tracking-tight uppercase">IK & Loyer</p>
            </div>
          </div>
          <button
            type="button"
            className="expand-trigger shadow-sm rounded-full p-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => togglePanel('opti')}
            aria-label="Ouvrir le détail des optimisations"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activePanel === 'opti' ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Situation */}
        <div className="card-pro px-5 py-5 border-l-4 border-l-amber-500 flex items-center justify-between">
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
    </div>
  );
}
