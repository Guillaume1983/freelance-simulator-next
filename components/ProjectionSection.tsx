'use client';
import { useRef, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import { projeterSurNAns } from '@/lib/projections';
import { TrendingUp, FileBarChart2, Info } from 'lucide-react';
import SidePanel from './SidePanel';

const REGIME_COLORS: Record<string, string> = {
  'Portage':  '#6366f1',
  'Micro':    '#f59e0b',
  'EURL IR':  '#10b981',
  'EURL IS':  '#3b82f6',
  'SASU':     '#8b5cf6',
};

/* ── Barre unique segmentée (Charges → Cotis → IR → Net) + labels à droite ── */
function StackedBar({ ca, fees, cotis, ir, net }: {
  ca: number; fees: number; cotis: number; ir: number; net: number;
}) {
  const total = Math.max(ca, 1);
  const segs = [
    { pct: (fees  / total) * 100, color: '#fb7185', label: 'Charges' },
    { pct: (cotis / total) * 100, color: '#fbbf24', label: 'Cotis'   },
    { pct: (ir    / total) * 100, color: '#f87171', label: 'Impôts'  },
    { pct: (net   / total) * 100, color: '#34d399', label: 'Net'     },
  ];
  return (
    <div className="flex items-center gap-3 py-1">
      {/* Barre */}
      <div
        className="rounded-xl overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700"
        style={{ width: 28, height: 88 }}
      >
        {segs.map((s, i) => (
          <div
            key={i}
            style={{ height: `${Math.max(0, s.pct)}%`, background: s.color }}
            className="transition-all duration-500 w-full"
            title={`${s.label} : ${Math.round(s.pct)}%`}
          />
        ))}
      </div>
      {/* Labels à droite */}
      <div className="flex flex-col gap-1.5">
        {segs.map(s => (
          <span key={s.label} className="flex items-center gap-1.5 text-[8px] font-black leading-none whitespace-nowrap" style={{ color: s.color }}>
            <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: s.color }} />
            {s.label} {Math.round(s.pct)}%
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ProjectionSection({
  sim,
  activeRegime,
  setActiveRegime,
}: {
  sim: any;
  activeRegime: string;
  setActiveRegime: (id: string) => void;
}) {
  const printBizRef = useRef<HTMLDivElement>(null);

  const handlePrintBiz = useReactToPrint({
    contentRef: printBizRef,
    documentTitle: 'BusinessPlan-Projection5ans-FreelanceSimulateur',
    pageStyle: '@page { size: A4 portrait; margin: 15mm; }',
  });

  const projections = useMemo(() => projeterSurNAns({
    tjm:           sim.state.tjm,
    days:          sim.state.days,
    taxParts:      sim.state.taxParts,
    spouseIncome:  sim.state.spouseIncome,
    kmAnnuel:      sim.state.kmAnnuel,
    cvFiscaux:     sim.state.cvFiscaux,
    loyerPercu:    sim.state.loyerPercu,
    activeCharges: sim.state.activeCharges,
    sectionsActive:sim.state.sectionsActive,
    portageComm:   sim.state.portageComm,
    chargeAmounts: sim.state.chargeAmounts,
    acreEnabled:   sim.state.acreEnabled,
    citySize:      sim.state.citySize,
    growthRate:    sim.state.growthRate / 100,
  }), [sim.state]);

  const fmt = (v: number) => Math.round(v).toLocaleString() + ' €';

  const rows = [
    { label: 'CA Annuel Brut',               key: 'ca',        prefix: '',  color: '',               highlight: false, isFinal: false, monthly: false },
    { label: 'Charges & IK déductibles',      key: 'fees',      prefix: '-', color: 'text-rose-500',  highlight: false, isFinal: false, monthly: false },
    { label: 'Cotisations Sociales',          key: 'cotis',     prefix: '-', color: 'text-amber-600', highlight: false, isFinal: false, monthly: false },
    { label: 'Rémunération Nette (Avant IR)', key: 'beforeTax', prefix: '',  color: '',               highlight: true,  isFinal: false, monthly: true  },
    { label: 'Prélèvement Fiscal (IR/IS)',    key: 'ir',        prefix: '-', color: 'text-rose-600',  highlight: false, isFinal: false, monthly: false },
    { label: 'DISPONIBLE FINAL (Cash-out)',   key: 'net',       prefix: '',  color: '',               highlight: false, isFinal: true,  monthly: true  },
  ];

  const regimeColor = REGIME_COLORS[activeRegime] ?? '#6366f1';
  const allRegimes  = sim.resultats.map((r: any) => r.id);

  return (
    <div className="card-pro overflow-visible border-none shadow-2xl bg-white dark:bg-[#0f172a]">

      {/* ── Barre de contrôle (commune desktop + mobile pour le titre) ── */}
      <div className="px-4 md:px-6 py-4 flex flex-wrap items-center gap-3 bg-slate-50/60 dark:bg-slate-900/40 border-b dark:border-slate-800 rounded-t-2xl">

        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600">
            <TrendingUp size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest dark:text-white leading-none">Projection 5 ans</h2>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              ACRE an 1{sim.state.acreEnabled ? ' ✅' : ' ✗'} · CFE dès an 2
            </p>
          </div>
        </div>

        {/* Sélecteur de régime — desktop uniquement (mobile a le sien plus bas) */}
        <div className="hidden md:flex gap-1 flex-wrap">
          {allRegimes.map((id: string) => (
            <button
              key={id}
              onClick={() => setActiveRegime(id)}
              className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border transition-colors ${
                activeRegime === id ? 'text-white' : 'text-slate-500 dark:text-slate-400'
              }`}
              style={{
                background:  activeRegime === id ? REGIME_COLORS[id] : 'transparent',
                borderColor: REGIME_COLORS[id],
              }}
            >
              {id}
            </button>
          ))}
        </div>

        {/* Croissance CA — desktop uniquement (mobile a le sien plus bas) */}
        <div className="hidden md:block space-y-0.5 min-w-[160px] ml-auto">
          <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
            Croissance CA / an
            <span className="text-indigo-500 font-black">{sim.state.growthRate}%</span>
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
      </div>

      {/* ── Panneau analyse statutaire (desktop uniquement, entre contrôle et tableau) ── */}
      <div className="hidden md:block px-4 md:px-6 pt-4">
        <SidePanel selectedId={activeRegime} />
      </div>

      {/* ── Tableau Projections (desktop) ── */}
      <div className="hidden md:block overflow-x-auto mt-4">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">

              {/* Cellule haut-gauche : PROJECTIONS + bouton Business Plan */}
              <th className="p-6 text-left border-b dark:border-slate-800 min-w-[200px]">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">Projections</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-6 rounded-full shrink-0" style={{ background: regimeColor }} />
                  <span className="text-[13px] font-black dark:text-white uppercase tracking-tighter leading-none">{activeRegime}</span>
                </div>
                <p className="text-[9px] text-slate-400 font-bold mt-1.5">+{sim.state.growthRate}%/an</p>
                <button
                  onClick={handlePrintBiz}
                  className="cursor-pointer mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black uppercase tracking-wide transition-colors"
                >
                  <FileBarChart2 size={11} /> Business Plan
                </button>
              </th>

              {/* Colonnes années (5 ans) */}
              {projections.map((yr, i) => {
                const r = yr.find((x: any) => x.id === activeRegime);
                return (
                  <th key={i} className="p-4 relative pt-12 border-b dark:border-slate-800 min-w-[130px]">
                    <div className="header-band" style={{ background: regimeColor, opacity: 0.35 + i * 0.13 }} />
                    <div className="text-[13px] font-black dark:text-white uppercase tracking-tighter">Année {i + 1}</div>
                    <div className="text-[9px] font-bold mt-0.5 text-slate-400">
                      {i === 0 && sim.state.acreEnabled ? 'ACRE −50% cotis' : i > 0 ? '+CFE' : '—'}
                    </div>
                    <div className="text-3xl font-black leading-none tracking-tighter mt-1" style={{ color: regimeColor }}>
                      {r ? fmt(r.net / 12) : '—'}
                      <span className="text-[11px] text-slate-400 font-bold ml-1">/m</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="text-slate-700 dark:text-slate-300">
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className={`transition-colors ${row.highlight ? 'bg-slate-50/50 dark:bg-slate-900/30 font-bold' : ''} ${row.isFinal ? 'bg-indigo-50/30 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-black' : ''}`}
              >
                <td className="p-4 border-r dark:border-slate-800">
                  <div className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-widest leading-tight">{row.label}</div>
                </td>
                {projections.map((yr, i) => {
                  const r   = yr.find((x: any) => x.id === activeRegime) as any;
                  const val = row.monthly ? r[row.key] / 12 : r[row.key];
                  return (
                    <td key={i} className={`p-4 text-center font-bold transition-all duration-300 ${row.isFinal ? 'text-lg' : 'text-sm'} ${row.color}`}>
                      {row.prefix && <span className="mr-0.5">{row.prefix}</span>}
                      {fmt(val)}
                      {row.monthly && <span className="text-[10px] font-bold text-slate-400 ml-0.5">/mois</span>}
                      {row.isFinal && (
                        <div className="text-[9px] text-slate-400 font-bold mt-0.5">{fmt(r[row.key])} /an</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* ── Ligne Répartitions ── */}
            <tr className="bg-slate-50/20 dark:bg-slate-900/10">
              <td className="p-4 border-r dark:border-slate-800">
                <div className="font-black text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-widest leading-tight">Répartitions</div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1.5">
                  {[
                    { color: '#fb7185', label: 'Charges' },
                    { color: '#fbbf24', label: 'Cotis' },
                    { color: '#f87171', label: 'IR' },
                    { color: '#34d399', label: 'Net' },
                  ].map(item => (
                    <span key={item.label} className="flex items-center gap-1 text-[7px] text-slate-400 font-bold">
                      <span className="w-2 h-2 rounded-sm inline-block" style={{ background: item.color }} />
                      {item.label}
                    </span>
                  ))}
                </div>
              </td>
              {projections.map((yr, i) => {
                const r = yr.find((x: any) => x.id === activeRegime) as any;
                return (
                  <td key={i} className="px-4 py-3">
                    <div className="flex justify-center">
                      <StackedBar ca={r.ca} fees={r.fees} cotis={r.cotis} ir={r.ir} net={r.net} />
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
        <p className="text-[9px] text-slate-400 italic px-4 py-2 flex items-center gap-1">
          <Info size={10} /> Simulation estimative. Consultez un expert-comptable pour votre situation personnelle.
        </p>
      </div>

      {/* ── Vue mobile : cartes par année ── */}
      <div className="block md:hidden">

        {/* Contrôle mobile : sélecteur régime + slider croissance en dessous */}
        <div className="px-4 pt-3 pb-4 border-b dark:border-slate-800 space-y-3">
          <div className="flex gap-1 flex-wrap">
            {allRegimes.map((id: string) => (
              <button
                key={id}
                onClick={() => setActiveRegime(id)}
                className={`px-2 py-1 rounded-full text-[9px] font-black uppercase border transition-colors ${
                  activeRegime === id ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
                style={{
                  background:  activeRegime === id ? REGIME_COLORS[id] : 'transparent',
                  borderColor: REGIME_COLORS[id],
                }}
              >
                {id}
              </button>
            ))}
          </div>
          {/* Slider croissance CA */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
              Croissance CA / an
              <span className="font-black" style={{ color: regimeColor }}>{sim.state.growthRate}%</span>
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
        </div>

        {/* Cartes années (scroll horizontal snap) */}
        <div className="px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 pt-4">
          {projections.map((yr, i) => {
            const r = yr.find((x: any) => x.id === activeRegime) as any;
            return (
              <div
                key={i}
                className="snap-center shrink-0 w-[calc(100vw-3rem)] max-w-sm overflow-hidden rounded-2xl bg-white dark:bg-[#020617] border shadow-lg"
              >
                {/* Bande couleur + header */}
                <div className="h-1 w-full" style={{ background: regimeColor }} />
                <div className="px-4 pt-4 pb-3 flex flex-col items-center text-center border-b dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Année {i + 1}</span>
                  {i === 0 && sim.state.acreEnabled
                    ? <span className="text-[8px] text-emerald-500 font-black mt-0.5">ACRE −50% cotis</span>
                    : <span className="text-[8px] text-slate-400 font-bold mt-0.5">+CFE</span>
                  }
                  <div className="text-3xl font-black mt-2 leading-none tracking-tighter" style={{ color: regimeColor }}>
                    {r ? fmt(r.net / 12) : '—'}
                    <span className="text-[11px] text-slate-400 font-bold ml-1">/mois</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold mt-0.5">{r ? fmt(r.net) : '—'} /an</div>
                  <div className="mt-3">
                    {r && <StackedBar ca={r.ca} fees={r.fees} cotis={r.cotis} ir={r.ir} net={r.net} />}
                  </div>
                </div>

                {/* Métriques */}
                <div className="px-4 py-3 space-y-2">
                  {rows.map((row) => {
                    const val = r ? (row.monthly ? r[row.key] / 12 : r[row.key]) : null;
                    return (
                      <div
                        key={row.key}
                        className={`flex items-baseline justify-between gap-3 rounded-xl px-3 py-2 ${
                          row.isFinal   ? 'bg-indigo-50/70 dark:bg-indigo-900/40'
                          : row.highlight ? 'bg-slate-50/70 dark:bg-slate-900/40'
                          : 'bg-slate-50/40 dark:bg-slate-900/20'
                        }`}
                      >
                        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 flex-1">{row.label}</p>
                        <span className={`text-[11px] font-black ${row.isFinal ? 'text-indigo-700 dark:text-indigo-300' : row.color || 'text-slate-800 dark:text-slate-100'}`}>
                          {row.prefix}{val !== null ? fmt(val) : '—'}
                          {row.monthly && <span className="text-[9px] text-slate-400 ml-1">/mois</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[9px] text-slate-400 italic px-4 pb-3 flex items-center gap-1">
          <Info size={10} /> Simulation estimative — barèmes 2026.
        </p>
      </div>

      {/* ══ PDF — Business Plan (masqué) ══ */}
      <div style={{ display: 'none' }}>
        <div ref={printBizRef} style={{ fontFamily: 'Arial, sans-serif', padding: '12mm', fontSize: 11 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 4px' }}>Business Plan Freelance — Projection 5 ans</h1>
          <p style={{ fontSize: 10, color: '#666', margin: '0 0 16px' }}>
            Régime : <strong>{activeRegime}</strong> · TJM {sim.state.tjm}€ · {sim.state.days} jours · +{sim.state.growthRate}%/an
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
            <thead>
              <tr style={{ background: '#eef2ff' }}>
                <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid #c7d2fe' }}>Indicateur</th>
                {projections.map((_, i) => (
                  <th key={i} style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '2px solid #c7d2fe', color: '#4f46e5' }}>
                    Année {i + 1}{i === 0 && sim.state.acreEnabled ? ' (ACRE)' : i > 0 ? ' (+CFE)' : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ background: row.isFinal ? '#eef2ff' : i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                  <td style={{ padding: '5px 8px', fontWeight: row.isFinal ? 900 : 600, borderBottom: '1px solid #e2e8f0' }}>{row.label}</td>
                  {projections.map((yr, j) => {
                    const r   = yr.find((x: any) => x.id === activeRegime) as any;
                    const val = row.monthly ? r[row.key] / 12 : r[row.key];
                    return (
                      <td key={j} style={{ padding: '5px 8px', textAlign: 'center', fontWeight: row.isFinal ? 900 : 'normal', borderBottom: '1px solid #e2e8f0', color: row.isFinal && j === 4 ? '#4f46e5' : 'inherit' }}>
                        {row.prefix}{fmt(val)}{row.monthly ? '/mois' : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 8, color: '#999', marginTop: 12 }}>Simulation estimative — barèmes 2026. Ces projections ne constituent pas un conseil fiscal.</p>
        </div>
      </div>
    </div>
  );
}
