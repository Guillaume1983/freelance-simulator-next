'use client';
import { Zap, Receipt, Sparkles, Users, ChevronDown } from 'lucide-react';
import { CHARGES_CATALOG } from '@/lib/constants';

export default function TopCards({ sim, activePanel, togglePanel }: any) {
  const fmt = (v: number) => Math.round(v).toLocaleString() + " €";

  const totalDepensesMensuelles = Math.round(
    CHARGES_CATALOG.reduce((sum, item) => {
      if (!sim.state.activeCharges.includes(item.id)) return sum;
      return sum + (sim.state.chargeAmounts?.[item.id] ?? item.amount);
    }, 0) + ((sim.state.materielAnnuel ?? 0) / 36)
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 mb-4 mt-8">

      {/* Grille 2×2 mobile */}
      <div className="md:hidden grid grid-cols-2 gap-3">

        {/* Production */}
        <div className="card-pro px-3 py-2 border-l-4 border-l-indigo-400/80 bg-white/10 dark:bg-slate-900/40 text-white border border-white/20 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 dark:bg-white/10 text-indigo-100 p-1.5 rounded-xl">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <p className="text-[9px] font-black text-white/80 uppercase tracking-wider leading-tight">Activité</p>
          </div>
          <p className="font-900 text-white text-[13px] tracking-tight">
            {fmt(sim.state.tjm * sim.state.days)}
          </p>
          <div className="flex gap-1.5">
            <div className="relative flex-1">
              <span className="absolute right-1 top-0.5 text-[7px] font-bold text-white/50">TJM</span>
              <input
                type="number"
                value={sim.state.tjm}
                onChange={(e) => sim.setters.setTjm(Number(e.target.value))}
                className="w-full text-left! pl-1.5 text-xs font-bold h-6 bg-white/10 border border-white/25 text-white placeholder:text-white/40"
              />
            </div>
            <div className="relative w-10">
              <span className="absolute right-1 top-0.5 text-[7px] font-bold text-white/50">J</span>
              <input
                type="number"
                value={sim.state.days}
                onChange={(e) => sim.setters.setDays(Number(e.target.value))}
                className="w-full text-left! pl-1.5 text-xs font-bold h-6 bg-white/10 border border-white/25 text-white placeholder:text-white/40"
              />
            </div>
          </div>
        </div>

        {/* Charges */}
        <div className="card-pro px-3 py-2 border-l-4 border-l-rose-400/80 bg-white/10 dark:bg-slate-900/40 text-white border border-white/20 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white/10 dark:bg-white/10 text-rose-100 p-1.5 rounded-xl">
                <Receipt className="w-3.5 h-3.5" />
              </div>
              <p className="text-[9px] font-black text-white/80 uppercase tracking-wider leading-tight">Dépenses<br/>pro</p>
            </div>
            <button
              type="button"
              className="expand-trigger shadow-sm rounded-full p-1 bg-white/10 hover:bg-white/20 text-white border border-white/25"
              onClick={() => togglePanel('charges')}
              aria-label="Ouvrir le détail des charges"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${activePanel === 'charges' ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <p className="font-900 text-white text-[13px] tracking-tight">
            {fmt(totalDepensesMensuelles)}
          </p>
        </div>

        {/* Optimisations */}
        <div className="card-pro px-3 py-2 border-l-4 border-l-emerald-400/80 bg-white/10 dark:bg-slate-900/40 text-white border border-white/20 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white/10 dark:bg-white/10 text-emerald-100 p-1.5 rounded-xl">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <p className="text-[9px] font-black text-white/80 uppercase tracking-wider leading-tight">Optimi-<br/>sations</p>
            </div>
            <button
              type="button"
              className="expand-trigger shadow-sm rounded-full p-1 bg-white/10 hover:bg-white/20 text-white border border-white/25"
              onClick={() => togglePanel('opti')}
              aria-label="Ouvrir le détail des optimisations"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${activePanel === 'opti' ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <p className="font-900 text-white text-[13px] tracking-tight uppercase">IK & Loyer</p>
        </div>

        {/* Situation Fiscale */}
        <div className="card-pro px-3 py-2 border-l-4 border-l-amber-400/80 bg-white/10 dark:bg-slate-900/40 text-white border border-white/20 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white/10 dark:bg-white/10 text-amber-100 p-1.5 rounded-xl">
                <Users className="w-3.5 h-3.5" />
              </div>
              <p className="text-[9px] font-black text-white/80 uppercase tracking-wider leading-tight">Situation<br/>fiscale</p>
            </div>
            <button
              type="button"
              className="expand-trigger shadow-sm rounded-full p-1 bg-white/10 hover:bg-white/20 text-white border border-white/25"
              onClick={() => togglePanel('fiscal')}
              aria-label="Ouvrir les paramètres fiscaux"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${activePanel === 'fiscal' ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <p className="font-900 text-white text-[13px] tracking-tight">
            {sim.state.taxParts} parts
          </p>
          <p className="text-[9px] text-slate-400 font-bold">
            {sim.state.nbAdultes === 2 ? 'Couple' : 'Célibataire'}{sim.state.nbEnfants > 0 ? ` · ${sim.state.nbEnfants} enf.` : ''}
          </p>
        </div>

      </div>

      {/* Grille desktop */}
      <div className="hidden md:grid grid-cols-4 gap-5">

        {/* Production */}
        <div className="card-pro px-4 py-4 border-l-4 border-l-indigo-400/80 bg-white/10 dark:bg-slate-900/40 text-white border border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 dark:bg-white/10 text-indigo-100 p-2.5 rounded-2xl"><Zap className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] font-black text-white/80 uppercase tracking-wider">Activité</p>
              <p className="font-900 text-white text-lg tracking-tight">{fmt(sim.state.tjm * sim.state.days)}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-24">
            <div className="relative">
              <span className="absolute right-2 top-1 text-[8px] font-bold text-white/60">TJM</span>
              <input
                type="number"
                value={sim.state.tjm}
                onChange={(e) => sim.setters.setTjm(Number(e.target.value))}
                className="w-full text-left! pl-2 text-xs font-bold h-7 bg-white/10 border border-white/25 text-white placeholder:text-white/40"
              />
            </div>
            <div className="relative">
              <span className="absolute right-2 top-1 text-[8px] font-bold text-white/60">JOURS</span>
              <input
                type="number"
                value={sim.state.days}
                onChange={(e) => sim.setters.setDays(Number(e.target.value))}
                className="w-full text-left! pl-2 text-xs font-bold h-7 bg-white/10 border border-white/25 text-white placeholder:text-white/40"
              />
            </div>
          </div>
        </div>

        {/* Charges */}
        <div className="card-pro px-4 py-4 border-l-4 border-l-rose-400/80 bg-white/10 dark:bg-slate-900/40 text-white border border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 dark:bg-white/10 text-rose-100 p-2.5 rounded-2xl">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/80 uppercase tracking-wider">Dépenses pro</p>
              <p className="font-900 text-white text-lg tracking-tight">{fmt(totalDepensesMensuelles)}</p>
            </div>
          </div>
          <button
            type="button"
            className="expand-trigger shadow-sm rounded-full p-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/25"
            onClick={() => togglePanel('charges')}
            aria-label="Ouvrir le détail des charges"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activePanel === 'charges' ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Optimisations */}
        <div className="card-pro px-4 py-4 border-l-4 border-l-emerald-400/80 bg-white/10 dark:bg-slate-900/40 text-white border border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 dark:bg-white/10 text-emerald-100 p-2.5 rounded-2xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/80 uppercase tracking-wider">Optimisations</p>
              <p className="font-900 text-white text-lg tracking-tight uppercase">IK & Loyer</p>
            </div>
          </div>
          <button
            type="button"
            className="expand-trigger shadow-sm rounded-full p-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/25"
            onClick={() => togglePanel('opti')}
            aria-label="Ouvrir le détail des optimisations"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activePanel === 'opti' ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Situation */}
        <div className="card-pro px-4 py-4 border-l-4 border-l-amber-400/80 bg-white/10 dark:bg-slate-900/40 text-white border border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 dark:bg-white/10 text-amber-100 p-2.5 rounded-2xl"><Users className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] font-black text-white/80 uppercase tracking-wider">Situation fiscale</p>
              <p className="font-900 text-white text-lg tracking-tight">{sim.state.taxParts} parts</p>
              <p className="text-[10px] text-white/75 font-bold mt-0.5">
                {sim.state.nbAdultes === 2 ? 'Couple' : 'Célibataire'}{sim.state.nbEnfants > 0 ? ` · ${sim.state.nbEnfants} enfant${sim.state.nbEnfants > 1 ? 's' : ''}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="expand-trigger shadow-sm rounded-full p-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/25"
            onClick={() => togglePanel('fiscal')}
            aria-label="Ouvrir les paramètres fiscaux"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activePanel === 'fiscal' ? 'rotate-180' : ''}`} />
          </button>
        </div>

      </div>
    </div>
  );
}
