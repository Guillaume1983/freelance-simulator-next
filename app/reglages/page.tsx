'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Zap, Receipt, Car, Sparkles, ShieldCheck, Users, ArrowLeft } from 'lucide-react';
import { useSimulationContext } from '@/context/SimulationContext';
import ExpandPanels from '@/components/ExpandPanels';
import Footer from '@/components/Footer';

const TABS = [
  { id: 'activite', label: 'Activité', icon: Zap },
  { id: 'charges', label: 'Charges', icon: Receipt },
  { id: 'vehicule', label: 'Véhicule', icon: Car },
  { id: 'opti', label: 'Optimisations', icon: Sparkles },
  { id: 'cotisations', label: 'Cotisations', icon: ShieldCheck },
  { id: 'foyer', label: 'Foyer', icon: Users },
] as const;

export default function ReglagesPage() {
  const searchParams = useSearchParams();
  const ctx = useSimulationContext();
  const sim = ctx.sim ?? ctx;
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('activite');

  // Ouvrir l’onglet demandé (ex. ?panel=vehicule)
  useEffect(() => {
    const panel = searchParams.get('panel');
    if (panel && TABS.some((t) => t.id === panel)) {
      setActiveTab(panel as (typeof TABS)[number]['id']);
    }
  }, [searchParams]);

  const ikAppliedRef = useRef(false);
  // Appliquer les paramètres IK venant du simulateur (ex. ?ik_km=12000&ik_type=voiture&ik_cv=6&ik_elec=0)
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

  return (
    <>
      <main className="relative z-10 min-h-screen bg-white dark:bg-slate-950">
        <div className="top-accent-bar" aria-hidden />

        {/* En-tête et onglets sur fond opaque */}
        <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8 md:py-10">
          <Link
            href="/comparateur"
            className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Retour au comparateur
          </Link>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Paramètres de simulation
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Modifiez votre profil (activité, charges, véhicule, optimisations, cotisations, foyer). Ces réglages s’appliquent au comparateur et aux projections.
          </p>

          <div className="flex border-b border-slate-200 dark:border-slate-700 mt-8 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-[12px] font-bold uppercase tracking-wide whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Zone des panneaux : fond sombre pour lisibilité (ExpandPanels en text-white / bg-white/10) */}
        <section className="relative section-projection-hero w-full mt-0">
          <div className="relative z-10 max-w-[900px] mx-auto px-4 md:px-6 py-6 pb-12">
            <ExpandPanels activePanel={activeTab} sim={sim} />
          </div>
        </section>

        <div className="bg-white dark:bg-slate-950">
          <Footer />
        </div>
      </main>
    </>
  );
}
