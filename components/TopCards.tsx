'use client';
import { useRef } from 'react';
import { Zap, Receipt, Sparkles, Users, ChevronDown } from 'lucide-react';
import { CHARGES_CATALOG } from '@/lib/constants';
import { getIK } from '@/lib/financial/rates';

export default function TopCards({ sim, activePanel, togglePanel }: any) {
  const fmt = (v: number) => Math.round(v).toLocaleString() + ' €';

  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startHold = (fn: () => void) => {
    // Un clic simple déclenche une seule incrémentation immédiate
    fn();
    // Puis on ne commence la répétition qu'après un petit délai,
    // pour laisser le temps de relâcher le bouton si on veut faire du 1 par 1.
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdDelayRef.current) {
      clearTimeout(holdDelayRef.current);
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

  const vehiculeActive = sim.state.sectionsActive?.vehicule ?? true;
  const loyerActive    = sim.state.sectionsActive?.loyer ?? true;

  const kmAnnuel       = sim.state.kmAnnuel ?? 0;
  const cvFiscaux      = sim.state.cvFiscaux ?? '6';
  const loyerPercu     = sim.state.loyerPercu ?? 0;
  const avantagesOptAn = sim.state.avantagesOptimises ?? 1500;

  const indemnitesAnn  = vehiculeActive ? getIK(kmAnnuel, cvFiscaux) : 0;
  const loyerAnn       = loyerActive ? loyerPercu * 12 : 0;
  const totalOptMens   = (indemnitesAnn + loyerAnn + avantagesOptAn) / 12;

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 mb-4 mt-8">

      {/* Grille mobile 2×2 (cartes légèrement réduites) */}
      <div className="md:hidden grid grid-cols-2 gap-2.5">

        {/* Production */}
        <div className="card-pro px-2.5 py-2 border-l-4 border-l-indigo-400/80 bg-white/10 dark:bg-slate-900/40 text-white border border-white/20 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 dark:bg-white/10 text-indigo-100 p-1.5 rounded-xl">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <p className="text-[9px] font-black text-white/80 uppercase tracking-wider leading-tight">Activité</p>
          </div>
          <p className="font-900 text-white text-[12px] tracking-tight">
            {fmt(sim.state.tjm * sim.state.days)}
          </p>
          <div className="flex gap-1.5">
            {/* TJM mobile */}
            <div className="flex flex-1 items-center gap-1">
              <div className="relative flex-1">
                <span className="absolute right-1 top-0.5 text-[7px] font-bold text-white/70">TJM</span>
                <input
                  type="number"
                  value={sim.state.tjm}
                  onChange={(e) => sim.setters.setTjm(Number(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  className="tjm-days-input w-full text-left! pl-1.5 text-xs font-bold h-6"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
                  onMouseDown={() => startHold(() => sim.setters.setTjm((prev: number) => (prev || 0) + 1))}
                  onMouseUp={stopHold}
                  onMouseLeave={stopHold}
                  onTouchStart={() => startHold(() => sim.setters.setTjm((prev: number) => (prev || 0) + 1))}
                  onTouchEnd={stopHold}
                  onTouchCancel={stopHold}
                  aria-label="Augmenter le TJM"
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
                  onMouseDown={() => startHold(() => sim.setters.setTjm((prev: number) => Math.max(0, (prev || 0) - 1)))}
                  onMouseUp={stopHold}
                  onMouseLeave={stopHold}
                  onTouchStart={() => startHold(() => sim.setters.setTjm((prev: number) => Math.max(0, (prev || 0) - 1)))}
                  onTouchEnd={stopHold}
                  onTouchCancel={stopHold}
                  aria-label="Diminuer le TJM"
                >
                  ▼
                </button>
              </div>
            </div>

            {/* Jours mobile */}
            <div className="flex w-16 items-center gap-1">
              <div className="relative flex-1">
                <span className="absolute right-1 top-0.5 text-[7px] font-bold text-white/70">J</span>
                <input
                  type="number"
                  value={sim.state.days}
                  onChange={(e) => sim.setters.setDays(Number(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  className="tjm-days-input w-full text-left! pl-1.5 text-xs font-bold h-6"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
                  onMouseDown={() => startHold(() => sim.setters.setDays((prev: number) => (prev || 0) + 1))}
                  onMouseUp={stopHold}
                  onMouseLeave={stopHold}
                  onTouchStart={() => startHold(() => sim.setters.setDays((prev: number) => (prev || 0) + 1))}
                  onTouchEnd={stopHold}
                  onTouchCancel={stopHold}
                  aria-label="Augmenter les jours"
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
                  onMouseDown={() => startHold(() => sim.setters.setDays((prev: number) => Math.max(0, (prev || 0) - 1)))}
                  onMouseUp={stopHold}
                  onMouseLeave={stopHold}
                  onTouchStart={() => startHold(() => sim.setters.setDays((prev: number) => Math.max(0, (prev || 0) - 1)))}
                  onTouchEnd={stopHold}
                  onTouchCancel={stopHold}
                  aria-label="Diminuer les jours"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Charges */}
        <div className="card-pro px-2.5 py-2 pb-4 border-l-4 border-l-rose-400/80 bg-white/10 dark:bg-slate-900/40 text-white border border-white/20 flex flex-col gap-1.5 relative">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 dark:bg-white/10 text-rose-100 p-1.5 rounded-xl">
              <Receipt className="w-3.5 h-3.5" />
            </div>
            <p className="text-[9px] font-black text-white/80 uppercase tracking-wider leading-tight">Dépenses professionnelles</p>
          </div>
          <p className="font-900 text-white text-[12px] tracking-tight">
            {fmt(totalDepensesMensuelles)}
          </p>
          <button
            type="button"
            className="expand-trigger shadow-sm rounded-full p-1 bg-white/10 hover:bg-white/20 text-white border border-white/25 absolute right-1.5 bottom-1.5"
            onClick={() => togglePanel('charges')}
            aria-label="Ouvrir le détail des charges"
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${activePanel === 'charges' ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Optimisations */}
        <div className="card-pro px-2.5 py-2 pb-4 border-l-4 border-l-emerald-400/80 bg-white/10 dark:bg-slate-900/40 text-white border border-white/20 flex flex-col gap-1.5 relative">
            <div className="flex items-center gap-2">
              <div className="bg-white/10 dark:bg-white/10 text-emerald-100 p-1.5 rounded-xl">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <p className="text-[9px] font-black text-white/80 uppercase tracking-wider leading-tight">
                Optimisations
              </p>
            </div>
          <p className="font-900 text-white text-[12px] tracking-tight">
            {fmt(totalOptMens)}
          </p>
          <button
            type="button"
            className="expand-trigger shadow-sm rounded-full p-1 bg-white/10 hover:bg-white/20 text-white border border-white/25 absolute right-1.5 bottom-1.5"
            onClick={() => togglePanel('opti')}
            aria-label="Ouvrir le détail des optimisations"
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${activePanel === 'opti' ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Situation Fiscale */}
        <div className="card-pro px-2.5 py-2 pb-4 border-l-4 border-l-amber-400/80 bg-white/10 dark:bg-slate-900/40 text-white border border-white/20 flex flex-col gap-1.5 relative">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 dark:bg-white/10 text-amber-100 p-1.5 rounded-xl">
              <Users className="w-3.5 h-3.5" />
            </div>
            <p className="text-[9px] font-black text-white/80 uppercase tracking-wider leading-tight">Situation<br/>fiscale</p>
          </div>
          <p className="font-900 text-white text-[12px] tracking-tight">
            {sim.state.taxParts} parts
          </p>
          <p className="text-[9px] text-slate-400 font-bold">
            {sim.state.nbAdultes === 2 ? 'Couple' : 'Célibataire'}{sim.state.nbEnfants > 0 ? ` · ${sim.state.nbEnfants} enf.` : ''}
          </p>
          <button
            type="button"
            className="expand-trigger shadow-sm rounded-full p-1 bg-white/10 hover:bg-white/20 text-white border border-white/25 absolute right-1.5 bottom-1.5"
            onClick={() => togglePanel('fiscal')}
            aria-label="Ouvrir les paramètres fiscaux"
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${activePanel === 'fiscal' ? 'rotate-180' : ''}`} />
          </button>
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
          <div className="flex flex-col gap-1.5 w-28">
            {/* TJM desktop */}
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <span className="absolute right-2 top-1 text-[8px] font-bold text-white/80">TJM</span>
                <input
                  type="number"
                  value={sim.state.tjm}
                  onChange={(e) => sim.setters.setTjm(Number(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  className="tjm-days-input w-full text-left! pl-2 text-xs font-bold h-7"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
                  onMouseDown={() => startHold(() => sim.setters.setTjm((prev: number) => (prev || 0) + 1))}
                  onMouseUp={stopHold}
                  onMouseLeave={stopHold}
                  onTouchStart={() => startHold(() => sim.setters.setTjm((prev: number) => (prev || 0) + 1))}
                  onTouchEnd={stopHold}
                  onTouchCancel={stopHold}
                  aria-label="Augmenter le TJM"
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
                  onMouseDown={() => startHold(() => sim.setters.setTjm((prev: number) => Math.max(0, (prev || 0) - 1)))}
                  onMouseUp={stopHold}
                  onMouseLeave={stopHold}
                  onTouchStart={() => startHold(() => sim.setters.setTjm((prev: number) => Math.max(0, (prev || 0) - 1)))}
                  onTouchEnd={stopHold}
                  onTouchCancel={stopHold}
                  aria-label="Diminuer le TJM"
                >
                  ▼
                </button>
              </div>
            </div>

            {/* Jours desktop */}
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <span className="absolute right-2 top-1 text-[8px] font-bold text-white/80">JOURS</span>
                <input
                  type="number"
                  value={sim.state.days}
                  onChange={(e) => sim.setters.setDays(Number(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  className="tjm-days-input w-full text-left! pl-2 text-xs font-bold h-7"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
                  onMouseDown={() => startHold(() => sim.setters.setDays((prev: number) => (prev || 0) + 1))}
                  onMouseUp={stopHold}
                  onMouseLeave={stopHold}
                  onTouchStart={() => startHold(() => sim.setters.setDays((prev: number) => (prev || 0) + 1))}
                  onTouchEnd={stopHold}
                  onTouchCancel={stopHold}
                  aria-label="Augmenter les jours"
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="w-5 h-3 rounded-sm bg-white/10 border border-white/25 flex items-center justify-center text-[7px] text-white"
                  onMouseDown={() => startHold(() => sim.setters.setDays((prev: number) => Math.max(0, (prev || 0) - 1)))}
                  onMouseUp={stopHold}
                  onMouseLeave={stopHold}
                  onTouchStart={() => startHold(() => sim.setters.setDays((prev: number) => Math.max(0, (prev || 0) - 1)))}
                  onTouchEnd={stopHold}
                  onTouchCancel={stopHold}
                  aria-label="Diminuer les jours"
                >
                  ▼
                </button>
              </div>
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
              <p className="text-[10px] font-black text-white/80 uppercase tracking-wider">Dépenses professionnelles</p>
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
              <p className="font-900 text-white text-lg tracking-tight">{fmt(totalOptMens)}</p>
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
