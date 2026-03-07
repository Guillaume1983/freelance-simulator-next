'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Zap,
  Receipt,
  Package,
  Car,
  Sparkles,
  ShieldCheck,
  Users,
  ArrowLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { useSimulationContext } from '@/context/SimulationContext';
import ExpandPanels from '@/components/ExpandPanels';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';
import { CHARGES_CATALOG } from '@/lib/constants';
import { getIK } from '@/lib/financial/rates';

const TABS = [
  {
    id: 'activite',
    label: 'Activité',
    description: 'CA, TJM, jours travaillés',
    icon: Zap,
    gradient: 'from-emerald-500 to-teal-500',
    activeBg: 'bg-emerald-50',
    activeBorder: 'border-emerald-300',
    activeText: 'text-emerald-700',
    activeIcon: 'from-emerald-500 to-teal-500',
    headerGradient: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'charges',
    label: 'Charges',
    description: 'Frais professionnels',
    icon: Receipt,
    gradient: 'from-rose-500 to-pink-500',
    activeBg: 'bg-rose-50',
    activeBorder: 'border-rose-300',
    activeText: 'text-rose-700',
    activeIcon: 'from-rose-500 to-pink-500',
    headerGradient: 'from-rose-500 to-pink-500',
  },
  {
    id: 'amortissement',
    label: 'Amortissement',
    description: 'Achat matériel année 1',
    icon: Package,
    gradient: 'from-cyan-500 to-sky-500',
    activeBg: 'bg-cyan-50',
    activeBorder: 'border-cyan-300',
    activeText: 'text-cyan-700',
    activeIcon: 'from-cyan-500 to-sky-500',
    headerGradient: 'from-cyan-500 to-sky-500',
  },
  {
    id: 'vehicule',
    label: 'Véhicule',
    description: 'IK, frais réels',
    icon: Car,
    gradient: 'from-sky-500 to-blue-500',
    activeBg: 'bg-sky-50',
    activeBorder: 'border-sky-300',
    activeText: 'text-sky-700',
    activeIcon: 'from-sky-500 to-blue-500',
    headerGradient: 'from-sky-500 to-blue-500',
  },
  {
    id: 'opti',
    label: 'Optimisations',
    description: 'Loyer, avantages',
    icon: Sparkles,
    gradient: 'from-violet-500 to-purple-500',
    activeBg: 'bg-violet-50',
    activeBorder: 'border-violet-300',
    activeText: 'text-violet-700',
    activeIcon: 'from-violet-500 to-purple-500',
    headerGradient: 'from-violet-500 to-purple-500',
  },
  {
    id: 'cotisations',
    label: 'Cotisations',
    description: 'ACRE, CFE',
    icon: ShieldCheck,
    gradient: 'from-amber-500 to-orange-500',
    activeBg: 'bg-amber-50',
    activeBorder: 'border-amber-300',
    activeText: 'text-amber-700',
    activeIcon: 'from-amber-500 to-orange-500',
    headerGradient: 'from-amber-500 to-orange-500',
  },
  {
    id: 'foyer',
    label: 'Foyer',
    description: 'Situation familiale',
    icon: Users,
    gradient: 'from-indigo-500 to-blue-500',
    activeBg: 'bg-indigo-50',
    activeBorder: 'border-indigo-300',
    activeText: 'text-indigo-700',
    activeIcon: 'from-indigo-500 to-blue-500',
    headerGradient: 'from-indigo-500 to-blue-500',
  },
] as const;

export default function ReglagesPage() {
  const searchParams = useSearchParams();
  const ctx = useSimulationContext();
  const sim = ctx.sim ?? ctx;
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('activite');

  useEffect(() => {
    const panel = searchParams.get('panel');
    if (panel && TABS.some((t) => t.id === panel)) {
      const id = panel as (typeof TABS)[number]['id'];
      queueMicrotask(() => setActiveTab(id));
    }
  }, [searchParams]);

  const ikAppliedRef = useRef(false);
  useEffect(() => {
    const ikKm = searchParams.get('ik_km');
    if (ikKm == null || !sim?.setters || ikAppliedRef.current) return;
    ikAppliedRef.current = true;
    const ikType = searchParams.get('ik_type');
    const ikCv = searchParams.get('ik_cv');
    const ikElec = searchParams.get('ik_elec');
    const km = Math.max(0, parseInt(ikKm, 10) || 0);
    sim.setters.setKmAnnuel(km);
    if (ikType === 'voiture' || ikType === 'moto' || ikType === 'cyclo50') {
      sim.setters.setTypeVehicule(ikType);
    }
    if (ikCv != null) sim.setters.setCvFiscaux(ikCv);
    if (ikElec === '1' || ikElec === 'true') sim.setters.setVehiculeElectrique(true);
    else if (ikElec === '0' || ikElec === 'false') sim.setters.setVehiculeElectrique(false);
    const next = new URLSearchParams(searchParams.toString());
    next.delete('ik_km');
    next.delete('ik_type');
    next.delete('ik_cv');
    next.delete('ik_elec');
    const qs = next.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [searchParams, sim?.setters]);

  const headerSummary = useMemo(() => {
    if (!sim?.state) return null;
    const s = sim.state;
    switch (activeTab) {
      case 'activite':
        return {
          label: "Chiffre d'affaires annuel estimé",
          value: `${((s.tjm ?? 0) * (s.days ?? 0)).toLocaleString('fr-FR')} €`,
        };
      case 'charges': {
        const total = Math.round(
          CHARGES_CATALOG.reduce((sum, item) => sum + (s.chargeAmounts?.[item.id] ?? item.amount ?? 0), 0)
        );
        const portage = Math.round(
          CHARGES_CATALOG.filter((c) => !c.portageWarning).reduce(
            (sum, item) => sum + (s.chargeAmounts?.[item.id] ?? item.amount ?? 0),
            0
          )
        );
        return {
          label: 'Total charges',
          value: `${total.toLocaleString('fr-FR')} €/mois`,
          sub: portage > 0 ? `Portage : ${portage} €/mois` : null,
        };
      }
      case 'amortissement': {
        const mat = s.materielAnnuel ?? 0;
        if (mat <= 0) return null;
        return {
          label: 'Déduction fiscale (3 ans)',
          value: `${Math.round(mat / 3).toLocaleString('fr-FR')} €/an`,
        };
      }
      case 'vehicule': {
        const ik = getIK(
          s.kmAnnuel ?? 0,
          s.typeVehicule ?? 'voiture',
          (s.typeVehicule ?? 'voiture') === 'cyclo50' ? undefined : (s.cvFiscaux ?? '6'),
          s.vehiculeElectrique ?? false
        );
        return {
          label: 'Indemnités kilométriques estimées',
          value: `${Math.round(ik).toLocaleString('fr-FR')} €/an`,
        };
      }
      case 'opti': {
        const total = (s.avantagesOptimises ?? 0) + (s.loyerPercu ?? 0) * 12;
        return {
          label: 'Total optimisations',
          value: `${Math.round(total).toLocaleString('fr-FR')} €/an`,
        };
      }
      case 'cotisations':
        return {
          label: s.acreEnabled ? 'ACRE activé · CFE selon ville' : 'ACRE désactivé · CFE selon ville',
          value: null,
        };
      case 'foyer':
        return {
          label: 'Quotient familial',
          value: `${s.taxParts ?? 1} part${(s.taxParts ?? 1) > 1 ? 's' : ''}`,
        };
      default:
        return null;
    }
  }, [activeTab, sim?.state]);

  return (
    <main className="min-h-screen bg-page-settings">

      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          <Link
            href="/comparateur"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Retour au comparateur
          </Link>
          <div className="mt-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Paramètres de simulation
              </h1>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Configurez votre profil pour comparer Portage, Micro, EURL et SASU.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-72 shrink-0">
            <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 lg:overflow-visible">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border-2 shrink-0 lg:shrink',
                      isActive
                        ? `dark:bg-slate-800 shadow-sm ${tab.activeBg} dark:bg-slate-800 ${tab.activeBorder} dark:border-slate-700`
                        : 'bg-white dark:bg-slate-800 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-200 dark:hover:border-slate-600'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                        isActive
                          ? `bg-gradient-to-br ${tab.activeIcon}`
                          : 'bg-slate-100 dark:bg-slate-700'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5',
                          isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'font-semibold text-sm leading-tight',
                          isActive
                            ? `${tab.activeText} dark:text-white`
                            : 'text-slate-700 dark:text-slate-300'
                        )}
                      >
                        {tab.label}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        {tab.description}
                      </p>
                    </div>
                    <ChevronRight
                      className={cn(
                        'w-4 h-4 shrink-0 transition-transform',
                        isActive ? `${tab.activeText} dark:text-white rotate-90` : 'text-slate-300 dark:text-slate-600'
                      )}
                    />
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
              {(() => {
                const activeTabData = TABS.find((t) => t.id === activeTab);
                const Icon = activeTabData?.icon ?? Zap;
                return (
                  <>
                    <div
                      className={cn(
                        'px-6 py-5 bg-gradient-to-r text-white',
                        activeTabData?.headerGradient ?? 'from-indigo-500 to-indigo-600'
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shrink-0">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold leading-tight">{activeTabData?.label}</h2>
                            <p className="text-sm text-white/75 mt-0.5">{activeTabData?.description}</p>
                          </div>
                        </div>
                        {headerSummary && (
                          <div className="text-right">
                            {headerSummary.value != null ? (
                              <>
                                <p className="text-2xl md:text-3xl font-bold tabular-nums">
                                  {headerSummary.value}
                                </p>
                                <p className="text-sm text-white/80 mt-0.5">
                                  {headerSummary.label}
                                  {headerSummary.sub != null && (
                                    <span className="block text-white/70">{headerSummary.sub}</span>
                                  )}
                                </p>
                              </>
                            ) : (
                              <p className="text-lg font-semibold text-white/90">{headerSummary.label}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-6">
                      <ExpandPanels activePanel={activeTab} sim={sim} />
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <Footer />
      </div>
    </main>
  );
}
