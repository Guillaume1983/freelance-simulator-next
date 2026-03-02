'use client';
import { useRef, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import { projeterSurNAns } from '@/lib/projections';
import { TrendingUp, FileText, FileBarChart2, Info } from 'lucide-react';

const REGIME_COLORS: Record<string, string> = {
  'Portage':  '#6366f1',
  'Micro':    '#f59e0b',
  'EURL IR':  '#10b981',
  'EURL IS':  '#3b82f6',
  'SASU':     '#8b5cf6',
};

/* ── Histogramme vertical ── */
function MiniVerticalBars({ ca, fees, cotis, ir, net }: {
  ca: number; fees: number; cotis: number; ir: number; net: number;
}) {
  const total = Math.max(ca, 1);
  const MAX_H = 52;
  const bars = [
    { value: fees,  color: '#fb7185', label: 'Chg' },
    { value: cotis, color: '#fbbf24', label: 'Cot' },
    { value: ir,    color: '#f87171', label: 'IR'  },
    { value: net,   color: '#34d399', label: 'Net' },
  ];
  return (
    <div className="flex items-end justify-center gap-2 py-1">
      {bars.map((bar, i) => {
        const pct = (bar.value / total) * 100;
        const h   = Math.max(2, (bar.value / total) * MAX_H);
        return (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <span className="text-[7px] font-black" style={{ color: bar.color }}>{Math.round(pct)}%</span>
            <div className="w-5 rounded-t-sm transition-all duration-500" style={{ height: `${h}px`, background: bar.color }} />
            <span className="text-[7px] text-slate-400 font-bold">{bar.label}</span>
          </div>
        );
      })}
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
  const printComparRef = useRef<HTMLDivElement>(null);
  const printBizRef   = useRef<HTMLDivElement>(null);

  const handlePrintCompar = useReactToPrint({
    contentRef: printComparRef,
    documentTitle: 'Comparatif-Statuts-FreelanceSimulateur',
    pageStyle: '@page { size: A4 landscape; margin: 12mm; }',
  });
  const handlePrintBiz = useReactToPrint({
    contentRef: printBizRef,
    documentTitle: 'BusinessPlan-Projection3ans-FreelanceSimulateur',
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

      {/* ── Barre de contrôle ── */}
      <div className="px-4 md:px-6 py-4 flex flex-wrap items-center gap-3 bg-slate-50/60 dark:bg-slate-900/40 border-b dark:border-slate-800 rounded-t-2xl">

        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600">
            <TrendingUp size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest dark:text-white leading-none">Projection 3 ans</h2>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              ACRE an 1{sim.state.acreEnabled ? ' ✅' : ' ✗'} · CFE dès an 2
            </p>
          </div>
        </div>

        {/* Sélecteur de régime */}
        <div className="flex gap-1 flex-wrap">
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

        {/* Croissance CA */}
        <div className="space-y-0.5 min-w-[160px] ml-auto">
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

        {/* Exports PDF */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrintCompar}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-wide transition-colors border border-slate-200 dark:border-slate-700"
          >
            <FileText size={12} /> Comparatif
          </button>
          <button
            onClick={handlePrintBiz}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wide transition-colors"
          >
            <FileBarChart2 size={12} /> Business Plan
          </button>
        </div>
      </div>

      {/* ── Tableau Projections (desktop) ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 table-fixed">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">

              {/* Cellule haut-gauche : PROJECTIONS */}
              <th className="p-6 text-left border-b dark:border-slate-800 w-[220px]">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">Projections</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-6 rounded-full shrink-0" style={{ background: regimeColor }} />
                  <span className="text-[13px] font-black dark:text-white uppercase tracking-tighter leading-none">{activeRegime}</span>
                </div>
                <p className="text-[9px] text-slate-400 font-bold mt-1.5">+{sim.state.growthRate}%/an</p>
              </th>

              {/* Colonnes années */}
              {[0, 1, 2].map(i => {
                const r = projections[i]?.find((x: any) => x.id === activeRegime);
                return (
                  <th key={i} className="p-4 relative pt-12 border-b dark:border-slate-800">
                    <div className="header-band" style={{ background: regimeColor, opacity: 0.55 + i * 0.15 }} />
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
                  <td key={i} className="px-4 py-2">
                    <MiniVerticalBars ca={r.ca} fees={r.fees} cotis={r.cotis} ir={r.ir} net={r.net} />
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

      {/* ── Tableau Projections (mobile) ── */}
      <div className="block md:hidden overflow-x-auto px-2 py-3">
        <table className="w-full border-separate border-spacing-0 text-xs min-w-[340px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/60">
              <th className="p-2 text-left text-[9px] font-black uppercase tracking-widest text-slate-400 border-b dark:border-slate-800 min-w-[120px]">Projections</th>
              {[1, 2, 3].map(y => (
                <th key={y} className="p-2 text-center border-b dark:border-slate-800">
                  <div className="text-[9px] font-black uppercase" style={{ color: regimeColor }}>An {y}</div>
                  <div className="text-[8px] text-slate-400 font-bold">
                    {y === 1 && sim.state.acreEnabled ? 'ACRE' : y > 1 ? '+CFE' : '—'}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className={row.isFinal ? 'bg-indigo-50/40 dark:bg-indigo-900/20 font-black' : row.highlight ? 'bg-slate-50/40 dark:bg-slate-900/20 font-bold' : ''}>
                <td className="p-2 text-[8px] font-bold uppercase tracking-wider text-slate-400 border-b dark:border-slate-800/60">{row.label}</td>
                {projections.map((yr, i) => {
                  const r   = yr.find((x: any) => x.id === activeRegime) as any;
                  const val = row.monthly ? r[row.key] / 12 : r[row.key];
                  return (
                    <td key={i} className={`p-2 text-center text-[10px] border-b dark:border-slate-800/60 ${row.isFinal ? 'text-indigo-600 dark:text-indigo-400 font-black' : row.color}`}>
                      {row.prefix}{fmt(val)}{row.monthly ? <span className="text-[8px] text-slate-400">/m</span> : null}
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Répartitions mobile */}
            <tr className="bg-slate-50/20 dark:bg-slate-900/10">
              <td className="p-2 text-[8px] font-black uppercase tracking-wider text-slate-400">Répartitions</td>
              {projections.map((yr, i) => {
                const r = yr.find((x: any) => x.id === activeRegime) as any;
                return (
                  <td key={i} className="px-2 py-1">
                    <MiniVerticalBars ca={r.ca} fees={r.fees} cotis={r.cotis} ir={r.ir} net={r.net} />
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* ══ PDF — Comparatif (masqué) ══ */}
      <div style={{ display: 'none' }}>
        <div ref={printComparRef} style={{ fontFamily: 'Arial, sans-serif', padding: '10mm', fontSize: 11 }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Comparatif statuts freelance 2026</h1>
            <p style={{ fontSize: 10, color: '#666', margin: '4px 0 0' }}>
              CA : {fmt(sim.state.tjm * sim.state.days)} · {sim.state.taxParts} parts fiscales · freelance-simulateur.fr
            </p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Métrique</th>
                {sim.resultats.map((r: any) => (
                  <th key={r.id} style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: REGIME_COLORS[r.id] }}>{r.id}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'CA Annuel',      key: 'ca' },
                { label: 'Charges & IK',   key: 'fees' },
                { label: 'Cotisations',    key: 'cotis' },
                { label: 'Net avant IR',   key: 'beforeTax', monthly: true },
                { label: 'Impôts (IR/IS)', key: 'ir' },
                { label: 'NET MENSUEL',    key: 'net', monthly: true },
              ].map((row, i) => (
                <tr key={i} style={{ background: row.monthly ? '#eef2ff' : i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                  <td style={{ padding: '5px 8px', fontWeight: row.monthly ? 900 : 600, borderBottom: '1px solid #e2e8f0' }}>{row.label}</td>
                  {sim.resultats.map((r: any) => (
                    <td key={r.id} style={{ padding: '5px 8px', textAlign: 'center', fontWeight: row.monthly ? 900 : 'normal', borderBottom: '1px solid #e2e8f0' }}>
                      {row.monthly ? fmt((r[row.key] as number) / 12) + '/mois' : fmt(r[row.key] as number)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ PDF — Business Plan (masqué) ══ */}
      <div style={{ display: 'none' }}>
        <div ref={printBizRef} style={{ fontFamily: 'Arial, sans-serif', padding: '12mm', fontSize: 11 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 4px' }}>Business Plan Freelance — Projection 3 ans</h1>
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
                      <td key={j} style={{ padding: '5px 8px', textAlign: 'center', fontWeight: row.isFinal ? 900 : 'normal', borderBottom: '1px solid #e2e8f0', color: row.isFinal && j === 2 ? '#4f46e5' : 'inherit' }}>
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
