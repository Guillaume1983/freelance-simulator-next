'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSimulationContext } from '@/context/SimulationContext';
import SimulationSection from '@/components/SimulationSection';
import ControlsBar from '@/components/ControlsBar';
import Footer from '@/components/Footer';
import { ArrowLeft, Briefcase, Store, Building2, Building } from 'lucide-react';

const STATUT_SLUG_TO_ID: Record<string, string> = {
  portage: 'Portage',
  micro: 'Micro',
  'eurl-ir': 'EURL IR',
  'eurl-is': 'EURL IS',
  sasu: 'SASU',
};

const STATUT_HEADER_ICON: Record<string, { Icon: typeof Briefcase; iconClass: string }> = {
  'Portage': { Icon: Briefcase, iconClass: 'bg-indigo-500 text-white' },
  'Micro': { Icon: Store, iconClass: 'bg-amber-500 text-white' },
  'EURL IR': { Icon: Building2, iconClass: 'bg-emerald-500 text-white' },
  'EURL IS': { Icon: Building2, iconClass: 'bg-blue-500 text-white' },
  'SASU': { Icon: Building, iconClass: 'bg-violet-500 text-white' },
};

const VALID_SLUGS = Object.keys(STATUT_SLUG_TO_ID);

export default function SimulateurStatutPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ctx = useSimulationContext();
  const slug = (params?.statut as string)?.toLowerCase() ?? '';
  const statutId = STATUT_SLUG_TO_ID[slug];
  const [activeRegime, setActiveRegimeState] = useState(statutId ?? 'Portage');

  const backLink = useMemo(() => {
    if (searchParams.get('from') === 'comparateur') {
      return { href: '/comparateur', label: 'Retour au comparateur' };
    }
    return { href: '/simulateur', label: 'Retour à la simulation 5 ans' };
  }, [searchParams]);

  useEffect(() => {
    if (statutId) setActiveRegimeState(statutId);
  }, [statutId]);

  useEffect(() => {
    if (params?.statut && !VALID_SLUGS.includes(slug)) {
      router.replace('/simulateur');
    }
  }, [params?.statut, slug, router]);

  const setActiveRegime = (id: string) => {
    const newSlug = Object.entries(STATUT_SLUG_TO_ID).find(([, v]) => v === id)?.[0];
    if (newSlug) router.push(`/simulateur/${newSlug}`);
  };

  if (!statutId && params?.statut) return null;

  const sim = ctx.sim ?? ctx;
  const ca = (sim.state.tjm ?? 0) * (sim.state.days ?? 0);

  return (
    <main className="min-h-screen bg-page-settings">
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          <Link
            href={backLink.href}
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeft size={16} />
            {backLink.label}
          </Link>
          <div className="mt-6 flex items-start gap-4">
            {statutId && STATUT_HEADER_ICON[statutId] && (() => {
              const { Icon, iconClass } = STATUT_HEADER_ICON[statutId];
              return (
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${iconClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
              );
            })()}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Simulation sur 5 ans — {statutId}
              </h1>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                ACRE an 1{ctx.state?.acreEnabled ? ' activé' : ' désactivé'} · CFE dès an 2 · Icône % sur an 2-5 pour ajuster la croissance
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Barre de contrôle sticky — TJM, Jours, CA, Paramètres */}
      <div className="sticky top-0 z-40">
        <ControlsBar sim={sim} ca={ca} pageSlug={`simulateur/${slug}`} />
      </div>

      {/* Section simulation */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
        <SimulationSection
          sim={ctx}
          activeRegime={activeRegime}
          setActiveRegime={setActiveRegime}
          singleRegime
        />
      </div>

      <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <Footer />
      </div>
    </main>
  );
}
