'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { Zap, Receipt, Sparkles, Users, ChevronDown } from 'lucide-react';

const CARD_H = 88;
const VISIBLE = 3;
const CONTAINER_H = CARD_H * VISIBLE;
const PAD = CARD_H;
const N_CARDS = 4;
const SET_H = N_CARDS * CARD_H; // hauteur d'un jeu complet de cartes

export default function TopCards({ sim, activePanel, togglePanel }: any) {
  const fmt = (v: number) => Math.round(v).toLocaleString() + " €";
  const scrollRef = useRef<HTMLDivElement>(null);
  // Démarrer centré sur le 1er item du jeu du milieu (set 1)
  const [scrollTop, setScrollTop] = useState(SET_H);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = SET_H;
    }
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const st = el.scrollTop;
    // Si on entre dans le 1er jeu → téléporter vers le jeu du milieu
    if (st < SET_H) {
      el.scrollTop = st + SET_H;
      setScrollTop(st + SET_H);
      return;
    }
    // Si on entre dans le 3ème jeu → téléporter vers le jeu du milieu
    if (st >= SET_H * 2) {
      el.scrollTop = st - SET_H;
      setScrollTop(st - SET_H);
      return;
    }
    setScrollTop(st);
  }, []);

  const wheelStyle = (loopedIndex: number): React.CSSProperties => {
    const cardMid = PAD + loopedIndex * CARD_H + CARD_H / 2;
    const viewMid = scrollTop + CONTAINER_H / 2;
    const dist = (cardMid - viewMid) / CARD_H;
    const abs = Math.abs(dist);
    return {
      transform: `perspective(500px) rotateX(${-dist * 44}deg)`,
      opacity: Math.max(0.2, 1 - abs * 0.58),
      transition: 'transform 60ms linear, opacity 60ms linear',
      transformOrigin: 'center center',
      height: '100%',
    };
  };

  const renderMobileCard = (realIndex: number, loopedIndex: number) => {
    switch (realIndex) {
      case 0:
        return (
          <div style={wheelStyle(loopedIndex)} className="card-pro px-4 border-l-4 border-l-indigo-500 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 p-2.5 rounded-xl">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Production Annuelle</p>
                <p className="font-900 text-slate-900 dark:text-white text-lg tracking-tight">
                  {fmt(sim.state.tjm * sim.state.days)}
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <div className="relative">
                <span className="absolute right-1 top-0.5 text-[7px] font-bold text-slate-300">TJM</span>
                <input type="number" value={sim.state.tjm} onChange={(e) => sim.setters.setTjm(Number(e.target.value))} className="w-16 !text-left pl-1.5 text-xs font-bold h-6" />
              </div>
              <div className="relative">
                <span className="absolute right-1 top-0.5 text-[7px] font-bold text-slate-300">J</span>
                <input type="number" value={sim.state.days} onChange={(e) => sim.setters.setDays(Number(e.target.value))} className="w-12 !text-left pl-1.5 text-xs font-bold h-6" />
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div style={wheelStyle(loopedIndex)} className="card-pro px-4 border-l-4 border-l-rose-500 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 p-2.5 rounded-xl">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Charges / mois</p>
                <p className="font-900 text-slate-900 dark:text-white text-lg tracking-tight">
                  {fmt(sim.resultats[0].fees / 12)}
                </p>
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
        );
      case 2:
        return (
          <div style={wheelStyle(loopedIndex)} className="card-pro px-4 border-l-4 border-l-emerald-500 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 p-2.5 rounded-xl">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Optimisations</p>
                <p className="font-900 text-slate-900 dark:text-white text-lg tracking-tight uppercase">IK & Loyer</p>
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
        );
      case 3:
        return (
          <div style={wheelStyle(loopedIndex)} className="card-pro px-4 border-l-4 border-l-amber-500 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 p-2.5 rounded-xl">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Situation Fiscale</p>
                <p className="font-900 text-slate-900 dark:text-white text-lg tracking-tight">Impôts</p>
              </div>
            </div>
            <select
              value={sim.state.taxParts}
              onChange={(e) => sim.setters.setTaxParts(Number(e.target.value))}
              className="w-20 text-xs font-bold h-7"
            >
              <option value="1">1 part</option>
              <option value="2">2 pts</option>
              <option value="3">3 pts</option>
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 mb-4 mt-8">
      {/* Wheel carousel mobile — 3 jeux de cartes pour scroll infini */}
      <div
        className="md:hidden relative overflow-hidden"
        style={{
          height: CONTAINER_H,
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 28%, black 72%, transparent)',
          maskImage: 'linear-gradient(to bottom, transparent, black 28%, black 72%, transparent)',
        }}
      >
        {/* Centre highlight */}
        <div
          className="absolute inset-x-0 pointer-events-none z-10 border-y border-indigo-400/30"
          style={{ top: PAD, height: CARD_H }}
        />
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="absolute inset-0 overflow-y-scroll"
          style={{ scrollSnapType: 'y mandatory', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        >
          <div style={{ height: PAD }} />

          {/* 3 répétitions des 4 cartes (set 0 / set 1 milieu / set 2) */}
          {[0, 1, 2].flatMap((set) =>
            [0, 1, 2, 3].map((card) => (
              <div key={`${set}-${card}`} style={{ height: CARD_H, scrollSnapAlign: 'center' }}>
                {renderMobileCard(card, set * N_CARDS + card)}
              </div>
            ))
          )}

          <div style={{ height: PAD }} />
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
            <input type="number" value={sim.state.tjm} onChange={(e) => sim.setters.setTjm(Number(e.target.value))} className="w-full !text-left pl-2 text-xs font-bold h-7" />
          </div>
          <div className="relative">
            <span className="absolute right-2 top-1 text-[8px] font-bold text-slate-300">JOURS</span>
            <input type="number" value={sim.state.days} onChange={(e) => sim.setters.setDays(Number(e.target.value))} className="w-full !text-left pl-2 text-xs font-bold h-7" />
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
