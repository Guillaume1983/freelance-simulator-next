'use client';

import { Suspense, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';

import { PageSettingsPageHeader } from '@/components/PageSettingsPageHeader';
import { cn } from '@/lib/utils';
import {
  DEFAULT_OUTIL_ID,
  OUTILS_TABS,
  OUTIL_TAB_COLORS,
  isOutilId,
  type OutilId,
} from '@/lib/outils/outilsConfig';
import { IndemnitesKmOutilPanel } from '@/components/outils/panels/IndemnitesKmOutilPanel';
import {
  AcreOutilPanel,
  CfeOutilPanel,
  CotisationsTnsOutilPanel,
  FranchiseTvaOutilPanel,
  PlafondsMicroOutilPanel,
  TauxEffectifIrOutilPanel,
  TjmRevenuNetOutilPanel,
} from '@/components/outils/panels/AutresOutilsPanels';

const IK_KEYS = ['ik_km', 'ik_type', 'ik_cv', 'ik_elec'] as const;

function buildOutilQuery(id: OutilId, current: URLSearchParams): string {
  const q = new URLSearchParams();
  q.set('outil', id);
  if (id === 'indemnites-km') {
    for (const k of IK_KEYS) {
      const v = current.get(k);
      if (v != null && v !== '') q.set(k, v);
    }
  }
  return q.toString();
}

function OutilsUnifiedInner({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeOutil: OutilId = useMemo(() => {
    const raw = searchParams.get('outil');
    return isOutilId(raw) ? raw : DEFAULT_OUTIL_ID;
  }, [searchParams]);

  const navigateToOutil = useCallback(
    (id: OutilId) => {
      const qs = buildOutilQuery(id, searchParams);
      router.replace(`/outils?${qs}`, { scroll: false });
    },
    [router, searchParams],
  );

  const activeTab = OUTILS_TABS.find((t) => t.id === activeOutil) ?? OUTILS_TABS[0]!;
  const Icon = activeTab.icon;

  const panel = useMemo(() => {
    switch (activeOutil) {
      case 'indemnites-km':
        return <IndemnitesKmOutilPanel />;
      case 'cfe':
        return <CfeOutilPanel />;
      case 'acre':
        return <AcreOutilPanel />;
      case 'plafonds-micro':
        return <PlafondsMicroOutilPanel />;
      case 'franchise-tva':
        return <FranchiseTvaOutilPanel />;
      case 'tjm-revenu-net':
        return <TjmRevenuNetOutilPanel />;
      case 'taux-effectif-ir':
        return <TauxEffectifIrOutilPanel />;
      case 'cotisations-tns':
        return <CotisationsTnsOutilPanel />;
      default:
        return <IndemnitesKmOutilPanel />;
    }
  }, [activeOutil]);

  return (
    <main className="min-h-screen bg-page-settings">
      <PageSettingsPageHeader
        backHref="/"
        backLabel="Retour à l'accueil"
        title="Outils"
        subtitle="Calculatrices et simulateurs pour freelances, auto-entrepreneurs et création d’entreprise. Choisissez un outil dans le menu."
        tertiary={
          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 italic">
            Indicatif uniquement : pas un avis fiscal, social ou juridique.
          </p>
        }
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <Link
          href="/"
          className="inline-flex lg:hidden items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-4"
        >
          <ArrowLeft size={16} />
          Accueil
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:hidden -mx-4 px-4">
            <div className="flex flex-wrap gap-2 pb-4">
              {OUTILS_TABS.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeOutil === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => navigateToOutil(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide transition-all duration-200',
                      isActive ? 'text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
                    )}
                    style={{ background: isActive ? OUTIL_TAB_COLORS[tab.id] : undefined }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <TabIcon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400')} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="hidden lg:block lg:w-72 shrink-0">
            <nav className="flex flex-col gap-2" aria-label="Outils">
              {OUTILS_TABS.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeOutil === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => navigateToOutil(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border-2',
                      isActive
                        ? `dark:bg-slate-800 shadow-sm ${tab.activeBg} ${tab.activeBorder} dark:border-slate-700`
                        : 'bg-white dark:bg-slate-800 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-200 dark:hover:border-slate-600',
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                        isActive ? `bg-gradient-to-br ${tab.activeIcon}` : 'bg-slate-100 dark:bg-slate-700',
                      )}
                    >
                      <TabIcon className={cn('w-5 h-5', isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'font-semibold text-sm leading-tight',
                          isActive ? `${tab.activeText} dark:text-white` : 'text-slate-700 dark:text-slate-300',
                        )}
                      >
                        {tab.label}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{tab.description}</p>
                    </div>
                    <ChevronRight
                      className={cn(
                        'w-4 h-4 shrink-0 transition-transform',
                        isActive ? `${tab.activeText} dark:text-white rotate-90` : 'text-slate-300 dark:text-slate-600',
                      )}
                    />
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="mb-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-4 py-3 md:hidden">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br text-white ${activeTab.headerGradient}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Outil actif</p>
                  <p className="font-bold text-slate-900 dark:text-white truncate">{activeTab.label}</p>
                </div>
              </div>
            </div>
            {panel}
          </div>
        </div>
      </div>
      {children}
    </main>
  );
}

export default function OutilsUnifiedClient({ children }: { children?: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-page-settings flex items-center justify-center px-4">
          <p className="text-slate-500 text-sm">Chargement des outils…</p>
        </main>
      }
    >
      <OutilsUnifiedInner>{children}</OutilsUnifiedInner>
    </Suspense>
  );
}
