'use client';
import React, { useRef, useMemo, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { projeterSurNAns } from '@/lib/projections';
import { getDetailTextFromLines } from '@/lib/financial';
import { FileBarChart2, Info, Eye, EyeOff } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import ConnectorModal from '@/components/ConnectorModal';
import RegimeParamsInline from '@/components/RegimeParamsInline';

/* ── Pastilles de scroll mobile ── */
function ScrollDots({ total, active, color }: { total: number; active: number; color: string }) {
  return (
    <div className="flex justify-center items-center gap-1.5 py-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{ width: i === active ? 20 : 6, height: 6, background: i === active ? color : '#cbd5e1' }}
        />
      ))}
    </div>
  );
}

/* ── Style unifié pour tous les boutons export PDF ── */
const PDF_BTN = 'cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-[10px] font-black uppercase tracking-wide transition-all shadow-sm';

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
    <div className="stacked-bar flex items-center gap-3 py-1">
      {/* Barre */}
      <div
        className="stacked-bar-inner rounded-xl overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700"
        style={{ width: 56, height: 88 }}
      >
        {segs.map((s, i) => (
          <div
            key={i}
            style={{ height: `${Math.max(0, s.pct)}%`, background: s.color }}
            className="stacked-bar-segment transition-all duration-500 w-full"
            title={`${s.label} : ${Math.round(s.pct)}%`}
          />
        ))}
      </div>
      {/* Labels à droite */}
      <div className="stacked-bar-legend flex flex-col gap-1.5">
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
  const printBizRef    = useRef<HTMLDivElement>(null);
  const yearScrollRef  = useRef<HTMLDivElement>(null);
  const [activeYear, setActiveYear]     = useState(0);
  const [showDetails, setShowDetails]   = useState(false);
  const [showConnectorModal, setShowConnectorModal] = useState(false);
  const { isConnected } = useUser();

  const handlePrintBiz = useReactToPrint({
    contentRef: printBizRef,
    documentTitle: 'BusinessPlan-Projection5ans-FreelanceSimulateur',
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 8mm;
      }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    `,
  });

  const projections = useMemo(() => projeterSurNAns({
    tjm: sim.state.tjm,
    days: sim.state.days,
    taxParts: sim.state.taxParts,
    spouseIncome: sim.state.spouseIncome,
    kmAnnuel: sim.state.kmAnnuel,
    cvFiscaux: sim.state.cvFiscaux,
    loyerPercu: sim.state.loyerPercu,
    activeCharges: sim.state.activeCharges,
    sectionsActive: sim.state.sectionsActive,
    portageComm: sim.state.portageComm,
    chargeAmounts: sim.state.chargeAmounts,
    acreEnabled: sim.state.acreEnabled,
    citySize: sim.state.citySize,
    growthRate: sim.state.growthRate / 100,
    materielAnnuel: sim.state.materielAnnuel,
    avantagesOptimises: sim.state.avantagesOptimises,
    typeActiviteMicro: sim.state.typeActiviteMicro,
    prelevementLiberatoire: sim.state.prelevementLiberatoire,
    remunerationDirigeantMensuelle: sim.state.remunerationDirigeantMensuelle,
    repartitionRemuneration: sim.state.repartitionRemuneration,
  }), [sim.state]);

  const fmt = (v: number) => Math.round(v).toLocaleString() + ' €';

  const onYearScroll = () => {
    const el = yearScrollRef.current;
    if (!el) return;
    const count = projections.length;
    const idx = Math.round(el.scrollLeft / (el.scrollWidth / count));
    setActiveYear(Math.min(idx, count - 1));
  };

  const getBeforeTaxRowLabel = (regimeId: string) => {
    if (regimeId === 'EURL IR') return 'Revenu imposable (avant IR)';
    if (regimeId === 'SASU') return 'Dividendes bruts (avant PFU)';
    return 'Rémunération nette (avant IR)';
  };

  const baseRows = [
    { label: 'CA annuel brut',               key: 'ca',        prefix: '',  color: '',               highlight: false, isFinal: false, monthly: false },
    { label: 'Charges (dépenses + optimisations)', key: 'fees',      prefix: '-', color: 'text-rose-500',  highlight: false, isFinal: false, monthly: false },
    { label: 'Commission de portage',        key: 'portageCommission', prefix: '-', color: 'text-violet-600', highlight: false, isFinal: false, monthly: false },
    { label: 'Cotisations sociales',         key: 'cotis',     prefix: '-', color: 'text-amber-600', highlight: false, isFinal: false, monthly: false },
    { label: 'Base avant impôt',             key: 'beforeTax', prefix: '',  color: '',               highlight: true,  isFinal: false, monthly: false },
    { label: 'Prélèvement fiscal perso (IR / PFU)', key: 'ir',  prefix: '-', color: 'text-rose-600',  highlight: false, isFinal: false, monthly: false },
    { label: 'DISPONIBLE FINAL ANNUEL',      key: 'net',       prefix: '',  color: '',               highlight: false, isFinal: true,  monthly: false, bigAmount: false, separatorAbove: true },
    { label: 'Dont optimisations (IK, loyer, avantages)', key: 'optimisations', prefix: '+', color: 'text-emerald-600', highlight: false, isFinal: false, monthly: false },
    { label: 'Trésorerie société (après IS)', key: 'cashInCompany', prefix: '',  color: 'text-slate-500', highlight: false, isFinal: false, monthly: false },
    { label: 'DISPONIBLE FINAL MENSUEL',     key: 'net',       prefix: '',  color: '',               highlight: false, isFinal: true,  monthly: true,  bigAmount: true },
  ];

  // Masquer la ligne trésorerie si aucune trésorerie positive sur 5 ans pour le régime actif
  const hasAnyCashInCompany = projections.some(yr => {
    const r = yr.find((x: any) => x.id === activeRegime) as any;
    return r && r.cashInCompany != null && r.cashInCompany > 0;
  });
  const rows = baseRows.filter(row => {
    if (row.key === 'cashInCompany') return hasAnyCashInCompany;
    if (row.key === 'portageCommission') return activeRegime === 'Portage';
    // Micro : optimisations non déductibles → masquer totalement la ligne
    if (row.key === 'optimisations' && activeRegime === 'Micro') return false;
    // Micro : pas de ligne « Charges (dépenses + optimisations) » dans les projections
    if (row.key === 'fees' && activeRegime === 'Micro') return false;
    return true;
  });

  const regimeColor = REGIME_COLORS[activeRegime] ?? '#6366f1';
  const allRegimes  = sim.resultats.map((r: any) => r.id);

  const getDetailText = (r: any, key: string, monthly = false): string =>
    getDetailTextFromLines(r, key, sim, monthly);

  const getRowBgClass = (row: (typeof rows)[number]) => {
    if (row.isFinal) return 'bg-indigo-50/60 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-black';
    if (row.highlight) return 'bg-slate-50/60 dark:bg-slate-800/30 font-bold';
    if (row.key === 'optimisations') return 'bg-emerald-50/50 dark:bg-emerald-900/25';
    if (row.key === 'cashInCompany') return 'bg-slate-50/50 dark:bg-slate-800/25';
    return '';
  };

  const getRowBgClassCard = (row: (typeof rows)[number]) => {
    if (row.isFinal) return 'bg-indigo-50/70 dark:bg-indigo-900/35';
    if (row.highlight) return 'bg-slate-50/70 dark:bg-slate-800/35';
    if (row.key === 'optimisations') return 'bg-emerald-50/60 dark:bg-emerald-900/30';
    if (row.key === 'cashInCompany') return 'bg-slate-50/60 dark:bg-slate-800/30';
    return 'bg-slate-50/40 dark:bg-slate-900/20';
  };

  return (
    <div className="card-pro overflow-visible mt-6 md:mt-8 border-none shadow-2xl bg-white dark:bg-[#0f172a]">

      {/* ── Barre de contrôle (commune desktop + mobile pour le titre) ── */}
      <div className="px-4 md:px-6 py-4 flex flex-wrap items-center gap-3 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 rounded-t-2xl">

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

        {/* Croissance CA — desktop uniquement */}
        <div className="hidden md:block space-y-0.5 min-w-[180px] ml-4">
          <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
            Croissance CA / an
            <span className="text-indigo-500 font-black">{sim.state.growthRate}%</span>
          </label>
          <input
            type="range"
            min={0} max={50} step={1}
            value={sim.state.growthRate}
            onChange={e => sim.setters.setGrowthRate(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-[8px] text-slate-400 font-bold">
            <span>0%</span><span>25%</span><span>50%</span>
          </div>
        </div>
      </div>

      {/* ── Tableau Projections (desktop) ── */}
      <div className="hidden md:block overflow-x-auto mt-4">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">

              {/* Cellule haut-gauche : PROJECTIONS */}
              <th className="p-6 text-left border-b dark:border-slate-800 min-w-[200px]">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">Projections</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-6 rounded-full shrink-0" style={{ background: regimeColor }} />
                  <span className="text-[13px] font-black dark:text-white uppercase tracking-tighter leading-none">{activeRegime}</span>
                </div>
                <p className="text-[9px] text-slate-400 font-bold mt-1.5">+{sim.state.growthRate}%/an</p>
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <RegimeParamsInline sim={sim} regimeId={activeRegime} align="left" />
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => (isConnected ? handlePrintBiz() : setShowConnectorModal(true))}
                    className={PDF_BTN}
                  >
                    <FileBarChart2 size={12} /> PDF
                  </button>
                  <button
                    onClick={() => (isConnected ? setShowDetails(v => !v) : setShowConnectorModal(true))}
                    className={`${PDF_BTN} ${showDetails ? 'bg-indigo-50! dark:bg-indigo-900/30! border-indigo-300! text-indigo-600!' : ''}`}
                  >
                    {showDetails ? <EyeOff size={11} /> : <Eye size={11} />}
                    {showDetails ? 'Masquer' : 'Détails'}
                  </button>
                </div>
              </th>

              {/* Colonnes années (5 ans) */}
              {projections.map((yr, i) => {
                const r = yr.find((x: any) => x.id === activeRegime);
                return (
                  <th key={i} className="p-4 relative pt-12 border-b dark:border-slate-800 min-w-[130px]">
                    <div className="header-band" style={{ background: regimeColor, opacity: 0.35 + i * 0.13 }} />
                    <div className="text-[13px] font-black dark:text-white uppercase tracking-tighter">Année {i + 1}</div>
                    <div className="text-[9px] font-bold mt-0.5 text-slate-400">
                      {i === 0 && sim.state.acreEnabled && activeRegime !== 'Portage' ? 'ACRE −50% cotis' : i > 0 ? '+CFE' : '—'}
                    </div>
                    <div className="text-3xl font-black leading-none tracking-tighter mt-1" style={{ color: regimeColor }}>
                      {r ? fmt(r.net / 12) : '—'}
                      <span className="text-[11px] text-slate-400 font-bold ml-1">/m</span>
                    </div>
                    {r && r.cashInCompany != null && r.cashInCompany > 0 && (
                      <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                        Trésorerie société&nbsp;: {fmt(r.cashInCompany)} /an
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="text-slate-700 dark:text-slate-300">
            {rows.map((row, idx) => (
              <React.Fragment key={idx}>
                <tr className={`transition-colors ${getRowBgClass(row)}`}>
                  <td className="p-4 border-r dark:border-slate-800">
                    <div className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-widest leading-tight">{row.key === 'beforeTax' ? getBeforeTaxRowLabel(activeRegime) : row.label}</div>
                  </td>
                {projections.map((yr, i) => {
                  const r   = yr.find((x: any) => x.id === activeRegime) as any;
                  let val: number | null = null;
                  if (row.key === 'optimisations') {
                    const lines = (r.lines as any[] | undefined) ?? [];
                    const ids = ['indemnites_km', 'loyer_percu', 'avantages'];
                    const sum = lines
                      .filter((l: any) => ids.includes(l.id))
                      .reduce((acc: number, l: any) => acc + (typeof l.amount === 'number' ? l.amount : 0), 0);
                    val = sum > 0 ? sum : null;
                  } else {
                    val = row.monthly ? r[row.key] / 12 : r[row.key];
                  }
                  if (row.key === 'portageCommission') {
                    if (activeRegime !== 'Portage') val = null;
                    else val = r.lines?.find((l: any) => l.id === 'portage_commission')?.amount ?? 0;
                  }
                  if (row.key === 'fees' && r.id === 'Micro') val = null;
                  if (row.key === 'cotis' && r.id === 'SASU') val = null;
                  if (row.key === 'cashInCompany' && (r.cashInCompany == null || r.cashInCompany === 0)) val = null;
                  return (
                    <td key={i} className={`p-4 text-center font-bold transition-all duration-300 ${(row as any).bigAmount ? 'text-lg' : 'text-sm'} ${row.color}`}>
                      {val === null ? (
                        '—'
                      ) : (
                        <>
                          {row.prefix && <span className="mr-0.5">{row.prefix}</span>}
                          {fmt(val)}
                          {row.monthly && <span className="text-[10px] font-bold text-slate-400 ml-0.5">/mois</span>}
                        </>
                      )}
                      {row.isFinal && (
                        <div className="text-[9px] text-slate-400 font-bold mt-0.5">{fmt(r[row.key])} /an</div>
                      )}
                    </td>
                  );
                })}
                </tr>
                {showDetails && (
                  <tr className="bg-slate-50/40 dark:bg-slate-800/20">
                    <td className="px-4 py-1.5 border-r dark:border-slate-800 text-[8px] text-slate-400 font-bold uppercase italic tracking-widest">Calcul</td>
                    {projections.map((yr, i) => {
                      const r = yr.find((x: any) => x.id === activeRegime) as any;
                      return (
                        <td key={i} className="px-4 py-1.5 text-center">
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium whitespace-pre-line">{getDetailText(r, row.key, row.monthly)}</span>
                        </td>
                      );
                    })}
                  </tr>
                )}
              </React.Fragment>
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
      </div>

      {/* ── Vue mobile : cartes par année ── */}
      <div className="block md:hidden">

        {/* Contrôle mobile : sélecteur régime + slider croissance + export */}
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
          {/* Paramètres spécifiques du statut sélectionné */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <RegimeParamsInline sim={sim} regimeId={activeRegime} align="left" />
          </div>
          {/* Slider croissance CA */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
              Croissance CA / an
              <span className="font-black" style={{ color: regimeColor }}>{sim.state.growthRate}%</span>
            </label>
            <input
              type="range"
              min={0} max={50} step={1}
              value={sim.state.growthRate}
              onChange={e => sim.setters.setGrowthRate(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[8px] text-slate-400 font-bold">
              <span>0%</span><span>25%</span><span>50%</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => (isConnected ? setShowDetails(v => !v) : setShowConnectorModal(true))}
              className={`flex-1 ${PDF_BTN} ${showDetails ? 'bg-indigo-50! dark:bg-indigo-900/30! border-indigo-300! text-indigo-600!' : ''}`}
            >
              {showDetails ? <EyeOff size={11} /> : <Eye size={11} />}
              {showDetails ? 'Masquer détails' : 'Détails'}
            </button>
            <button
              onClick={() => (isConnected ? handlePrintBiz() : setShowConnectorModal(true))}
              className={PDF_BTN}
            >
              <FileBarChart2 size={12} /> PDF
            </button>
          </div>
        </div>

        {/* Cartes années (scroll horizontal snap) */}
        <div
          ref={yearScrollRef}
          onScroll={onYearScroll}
          className="px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 pt-4"
        >
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
                  {i === 0 && sim.state.acreEnabled && activeRegime !== 'Portage'
                    ? <span className="text-[8px] text-emerald-500 font-black mt-0.5">ACRE −50% cotis</span>
                    : <span className="text-[8px] text-slate-400 font-bold mt-0.5">+CFE</span>
                  }
                  <div className="text-3xl font-black mt-2 leading-none tracking-tighter" style={{ color: regimeColor }}>
                    {r ? fmt(r.net / 12) : '—'}
                    <span className="text-[11px] text-slate-400 font-bold ml-1">/mois</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold mt-0.5">{r ? fmt(r.net) : '—'} /an</div>
                  {r && r.cashInCompany != null && r.cashInCompany > 0 && (
                    <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                      Trésorerie société&nbsp;: {fmt(r.cashInCompany)} /an
                    </div>
                  )}
                  <div className="mt-3">
                    {r && <StackedBar ca={r.ca} fees={r.fees} cotis={r.cotis} ir={r.ir} net={r.net} />}
                  </div>
                </div>

                {/* Métriques */}
                <div className="px-4 py-3 space-y-1.5">
                  {rows.map((row) => {
                    let val = r ? (row.monthly ? r[row.key] / 12 : r[row.key]) : null;
                    if (r && row.key === 'portageCommission') {
                      if (activeRegime !== 'Portage') val = null;
                      else val = r.lines?.find((l: any) => l.id === 'portage_commission')?.amount ?? 0;
                    }
                    if (r && row.key === 'fees' && r.id === 'Micro') val = null;
                    if (r && row.key === 'cotis' && r.id === 'SASU') val = null;
                    if (r && row.key === 'cashInCompany' && (r.cashInCompany == null || r.cashInCompany === 0)) val = null;
                    return (
                      <div key={row.label}>
                        <div className={`flex items-baseline justify-between gap-3 rounded-xl px-3 py-2 ${getRowBgClassCard(row)}`}>
                          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 flex-1">{row.key === 'beforeTax' ? getBeforeTaxRowLabel(activeRegime) : row.label}</p>
                          <span className={`text-[11px] font-black ${row.isFinal ? 'text-indigo-700 dark:text-indigo-300' : row.color || 'text-slate-800 dark:text-slate-100'}`}>
                            {val !== null ? (
                              <>
                                {row.prefix}{fmt(val)}
                                {row.monthly && <span className="text-[9px] text-slate-400 ml-1">/mois</span>}
                              </>
                            ) : '—'}
                          </span>
                        </div>
                        {showDetails && r && (
                          <p className="text-[8px] text-slate-400 dark:text-slate-500 italic font-medium px-3 pt-0.5 pb-1 whitespace-pre-line">
                            {getDetailText(r, row.key, row.monthly)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <ScrollDots total={projections.length} active={activeYear} color={regimeColor} />
      </div>

      {/* Hypothèses principales (mêmes que le comparatif) */}
      <div className="px-4 md:px-6 pb-2">
        <div className="mt-6 max-w-3xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50 px-4 py-3">
          <span className="block text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 text-center md:text-left">
            Hypothèses principales
          </span>
          <ul className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-[9px] text-slate-600 dark:text-slate-300 list-disc pl-4">
            <li>ACRE : allègement d’environ 50 % des cotisations TNS/Micro la 1ʳᵉ année (hors CSG/CRDS), hors Portage et SASU.</li>
            <li>IK : barème fiscal annuel, remboursés en net et déductibles pour la société.</li>
            <li>Loyer perçu : charge pour la société, mais revenu imposable ajouté au foyer.</li>
            <li>EURL IS : IS 25 % sur le bénéfice non versé en salaire. SASU : IS 20 % puis PFU 30 % (17,2 % PS + 12,8 % IR) sur les dividendes.</li>
          </ul>
        </div>
      </div>

      {/* Disclaimer identique au tableau comparatif */}
      <p className="text-[9px] text-slate-400 italic px-4 md:px-6 pb-3 flex items-center gap-1">
        <Info size={10} /> Simulation estimative. Consultez un expert-comptable pour votre situation personnelle.
      </p>

      {/* ══ PDF — Business Plan (masqué) ══ */}
      <div style={{ display: 'none' }}>
        <div ref={printBizRef} style={{ fontFamily: 'Arial, sans-serif', padding: '12mm', fontSize: 10 }}>

          {/* En-tête */}
          <div style={{ textAlign: 'center', margin: '0 0 14px' }}>
            <h1 style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>Projections 5 ans — Freelance</h1>
            <p style={{ fontSize: 9, color: '#666', margin: '4px 0 0' }}>
              Régime : <strong>{activeRegime}</strong> · TJM {sim.state.tjm} € · {sim.state.days} jours · +{sim.state.growthRate} %/an · {sim.state.taxParts} parts fiscales
            </p>
          </div>

          {/* Tableau projections */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
            <thead>
              <tr style={{ background: '#eef2ff' }}>
                <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '2px solid #c7d2fe' }}>Indicateur</th>
                {projections.map((_, i) => (
                  <th key={i} style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '2px solid #c7d2fe', color: '#4f46e5' }}>
                    Année {i + 1}{i === 0 && sim.state.acreEnabled && activeRegime !== 'Portage' ? ' (ACRE)' : i > 0 ? ' (+CFE)' : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <React.Fragment key={i}>
                  <tr style={{ background: row.isFinal ? '#eef2ff' : i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                    <td style={{ padding: '4px 7px', fontWeight: row.isFinal ? 900 : 600, borderBottom: showDetails ? 'none' : '1px solid #e2e8f0', fontSize: (row as any).bigAmount ? 10 : 9 }}>{row.key === 'beforeTax' ? getBeforeTaxRowLabel(activeRegime) : row.label}</td>
                    {projections.map((yr, j) => {
                      const r = yr.find((x: any) => x.id === activeRegime) as any;
                      let val: number | null = null;
                      if (row.key === 'optimisations') {
                        const lines = (r.lines as any[] | undefined) ?? [];
                        const ids = ['indemnites_km', 'loyer_percu', 'avantages'];
                        const sum = lines
                          .filter((l: any) => ids.includes(l.id))
                          .reduce((acc: number, l: any) => acc + (typeof l.amount === 'number' ? l.amount : 0), 0);
                        val = sum > 0 ? sum : null;
                      } else {
                        val = row.monthly ? r[row.key] / 12 : r[row.key];
                      }
                      if (row.key === 'portageCommission') {
                        if (activeRegime !== 'Portage') val = null;
                        else val = r.lines?.find((l: any) => l.id === 'portage_commission')?.amount ?? 0;
                      }
                      if (row.key === 'fees' && r.id === 'Micro') val = null;
                      if (row.key === 'cotis' && r.id === 'SASU') val = null;
                      if (row.key === 'cashInCompany' && (r.cashInCompany == null || r.cashInCompany === 0)) val = null;
                      return (
                        <td key={j} style={{ padding: '4px 7px', textAlign: 'center', fontWeight: row.isFinal ? 900 : 'normal', borderBottom: showDetails ? 'none' : '1px solid #e2e8f0', fontSize: (row as any).bigAmount ? 10 : 9, color: row.isFinal ? '#4f46e5' : 'inherit' }}>
                          {val === null ? '—' : `${row.prefix}${fmt(val)}${row.monthly ? '/mois' : ''}`}
                        </td>
                      );
                    })}
                  </tr>
                  {showDetails && (
                    <tr style={{ background: '#fafafa' }}>
                      <td style={{ padding: '2px 7px 5px', fontSize: 7, color: '#94a3b8', borderBottom: '1px solid #e2e8f0', fontStyle: 'italic' }}>Calcul</td>
                      {projections.map((yr, j) => {
                        const r = yr.find((x: any) => x.id === activeRegime) as any;
                        return (
                          <td key={j} style={{ padding: '2px 7px 5px', fontSize: 7, color: '#94a3b8', borderBottom: '1px solid #e2e8f0', whiteSpace: 'pre-line', fontStyle: 'italic', textAlign: 'center' }}>
                            {getDetailText(r, row.key, row.monthly)}
                          </td>
                        );
                      })}
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* Histogrammes — évolution sur 5 ans */}
          {(() => {
            return (
              <div style={{ marginTop: 16 }}>
                <h2 style={{ fontSize: 11, fontWeight: 900, margin: '0 0 8px', borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>Évolution du net disponible — {activeRegime}</h2>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  {projections.map((yr, i) => {
                    const r = yr.find((x: any) => x.id === activeRegime) as any;
                    const total = Math.max(r.ca, 1);
                    const segs = [
                      { pct: (r.fees  / total) * 100, color: '#fb7185' },
                      { pct: (r.cotis / total) * 100, color: '#fbbf24' },
                      { pct: (r.ir    / total) * 100, color: '#f87171' },
                      { pct: (r.net   / total) * 100, color: '#34d399' },
                    ];
                    return (
                      <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ display: 'flex', width: '100%', height: 10, borderRadius: 3, overflow: 'hidden', background: '#e2e8f0' }}>
                          {segs.map((s, j) => (
                            <div
                              key={j}
                              style={{
                                width: `${Math.max(0, s.pct)}%`,
                                background: s.color,
                              }}
                            />
                          ))}
                        </div>
                        <p style={{ fontSize: 8, fontWeight: 900, color: '#34d399', margin: '3px 0 0' }}>{fmt(r.net / 12)}/m</p>
                        <p style={{ fontSize: 7, color: '#64748b', margin: 0 }}>An {i + 1}{i === 0 && sim.state.acreEnabled && activeRegime !== 'Portage' ? '*' : ''}</p>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  {[['#fb7185','Charges'],['#fbbf24','Cotis'],['#f87171','Impôts'],['#34d399','Net']].map(([c, l]) => (
                    <span key={l} style={{ fontSize: 7, color: c as string, fontWeight: 700 }}>■ {l}</span>
                  ))}
                  {sim.state.acreEnabled && activeRegime !== 'Portage' && <span style={{ fontSize: 7, color: '#94a3b8' }}>* ACRE an 1</span>}
                </div>
              </div>
            );
          })()}

          {/* Analyse */}
          {(() => {
            const analysis: Record<string, { forts: string[]; vigilance: string }> = {
              Portage:  { forts: ['Accès au chômage (ARE) en fin de mission','Protection sociale complète (régime salarié)','Zéro gestion administrative'], vigilance: "Les frais de gestion (5–15 % du CA, selon le contrat) réduisent directement votre net." },
              Micro:    { forts: ['Création instantanée, formalités nulles','Comptabilité ultra simplifiée','Charges proportionnelles au CA réel'], vigilance: "Plafond de CA à 77 700 € en BNC. Pas de déduction des charges réelles." },
              'EURL IR':{ forts: ['Déduction des charges professionnelles réelles','IR progressif : avantageux si revenus modérés','Structure souple'], vigilance: "Cotisations TNS calculées selon le barème réel (URSSAF/CIPAV). Comptabilité obligatoire." },
              'EURL IS':{ forts: ["Bénéfice non versé en salaire taxé à l'IS 25 %","Pilotage précis de la part en salaire TNS vs capitalisation en société","Création d’une trésorerie de société mobilisable plus tard"], vigilance: "IS 25 % sur le bénéfice restant + impôt sur le revenu sur le salaire TNS. Comptabilité exigeante." },
              SASU:     { forts: ['Protection assimilé-salarié (retraite, prévoyance)','Dividendes au PFU 30 %','Statut reconnu pour missions premium'], vigilance: "Bénéfice taxé à l'IS 20 % puis dividendes imposés au PFU 30 % (dont 17,2 % prélèvements sociaux). Pas d'accès à l'ARE en fin de mandat de président." },
            };
            const data = analysis[activeRegime];
            if (!data) return null;
            return (
              <div style={{ marginTop: 18 }}>
                <h2 style={{ fontSize: 11, fontWeight: 900, margin: '0 0 8px', borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>Analyse — {activeRegime}</h2>
                <div style={{ padding: '8px 10px', background: '#f8fafc', borderLeft: '3px solid #6366f1', borderRadius: 2 }}>
                  {data.forts.map((f, i) => (
                    <p key={i} style={{ fontSize: 9, margin: '2px 0', color: '#16a34a' }}>✓ {f}</p>
                  ))}
                  <p style={{ fontSize: 9, margin: '6px 0 0', color: '#dc2626' }}>⚠ {data.vigilance}</p>
                </div>
              </div>
            );
          })()}

          <p style={{ fontSize: 7, color: '#999', marginTop: 14 }}>Simulation estimative — barèmes 2026. Ces projections ne constituent pas un conseil fiscal.</p>
        </div>
      </div>

      <ConnectorModal
        open={showConnectorModal}
        onClose={() => setShowConnectorModal(false)}
        title="Connectez-vous pour débloquer"
        message="Connectez-vous ou créez un compte pour exporter la projection en PDF et accéder aux détails de calcul."
      />
    </div>
  );
}
