'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BarChart3, TrendingUp, BookOpen, ArrowRight, Settings, Wrench, Sparkles, Save, FileDown, Lock, Gift, CheckCircle2, X, Trash2 } from 'lucide-react';
import Footer from '@/components/Footer';
import FaqSection from '@/components/FaqSection';
import { useSimulationContext } from '@/context/SimulationContext';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600';

export default function Home() {
  const { state, isLoading } = useSimulationContext();
  const userId = state.userId ?? null;
  /** Invité confirmé : auth résolue et pas de compte (évite flash invité → connecté) */
  const isGuest = !isLoading && !userId;
  const [showEmailConfirmedBanner, setShowEmailConfirmedBanner] = useState(false);
  const [showAccountDeletedBanner, setShowAccountDeletedBanner] = useState(false);
  const [authLinkErrorMessage, setAuthLinkErrorMessage] = useState<string | null>(null);
  const [authLinkErrorCode, setAuthLinkErrorCode] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const hadEmailValidated = params.get('email_validated') === '1';
    const hadAccountDeleted = params.get('account_deleted') === '1';

    // 1) Email validé (Supabase) ou 2) compte supprimé (redirection depuis Mon compte)
    if (hadEmailValidated) {
      queueMicrotask(() => setShowEmailConfirmedBanner(true));
    }
    if (hadAccountDeleted) {
      queueMicrotask(() => setShowAccountDeletedBanner(true));
    }
    if (hadEmailValidated || hadAccountDeleted) {
      params.delete('email_validated');
      params.delete('account_deleted');
      const q = params.toString();
      const path = window.location.pathname;
      window.history.replaceState({}, '', q ? `${path}?${q}` : path);
    } else {
      // Secours : page intermédiaire /connexion/confirmed qui pose sessionStorage
      const emailConfirmedFlag = sessionStorage.getItem('emailConfirmedBanner');
      if (emailConfirmedFlag === '1') {
        queueMicrotask(() => setShowEmailConfirmedBanner(true));
        sessionStorage.removeItem('emailConfirmedBanner');
      }
    }

    // Erreurs lien (ex. 2e clic) — pas si on vient de confirmer avec succès
    const errorCode = params.get('error_code');
    const error = params.get('error');
    if (!hadEmailValidated && !hadAccountDeleted && (errorCode || error)) {
      if (errorCode === 'otp_expired') {
        queueMicrotask(() =>
          setAuthLinkErrorMessage('Le lien de confirmation a expiré.')
        );
        queueMicrotask(() => setAuthLinkErrorCode('otp_expired'));
      } else {
        queueMicrotask(() =>
          setAuthLinkErrorMessage('Le lien de confirmation est invalide.')
        );
        queueMicrotask(() => setAuthLinkErrorCode('invalid'));
      }
    }
  }, []);

  // Bandeaux : disparaissent après quelques secondes ou au clic sur fermer
  useEffect(() => {
    if (!showEmailConfirmedBanner) return;
    const t = window.setTimeout(() => setShowEmailConfirmedBanner(false), 8000);
    return () => window.clearTimeout(t);
  }, [showEmailConfirmedBanner]);

  useEffect(() => {
    if (!showAccountDeletedBanner) return;
    const t = window.setTimeout(() => setShowAccountDeletedBanner(false), 8000);
    return () => window.clearTimeout(t);
  }, [showAccountDeletedBanner]);

  return (
    <>
      <div className="page-blob-1" aria-hidden />
      <div className="page-blob-2" aria-hidden />
      <div className="page-blob-3" aria-hidden />
      <div className="bg-page-grid" aria-hidden />

      <main className="relative z-10 min-h-screen overflow-x-hidden min-w-0">
        {authLinkErrorMessage && (
          <section className={`w-full py-4 ${userId ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-gradient-to-r from-rose-600 to-rose-700'}`}>
            <div className="max-w-[1000px] mx-auto px-4 md:px-6">
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black text-sm">{userId ? 'Info' : 'Action requise'}</p>
                  <p className="text-[13px] text-white/85 font-medium">
                    {userId && authLinkErrorCode === 'otp_expired'
                      ? 'Le lien semble déjà utilisé/expiré. Votre connexion est active.'
                      : authLinkErrorMessage}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
        {showEmailConfirmedBanner && (
          <section className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 py-4">
            <div className="max-w-[1000px] mx-auto px-4 md:px-6">
              <div className="flex items-start sm:items-center justify-between gap-3 text-white">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-sm">Adresse e-mail validée</p>
                    <p className="text-[13px] text-white/85 font-medium">Votre compte est activé. Bienvenue !</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailConfirmedBanner(false)}
                  className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-colors"
                  aria-label="Fermer le message"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>
        )}
        {showAccountDeletedBanner && (
          <section className="w-full bg-gradient-to-r from-slate-600 to-slate-800 py-4">
            <div className="max-w-[1000px] mx-auto px-4 md:px-6">
              <div className="flex items-start sm:items-center justify-between gap-3 text-white">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-sm">Compte supprimé</p>
                    <p className="text-[13px] text-white/85 font-medium">
                      Votre compte et vos données associées ont bien été effacés de nos serveurs.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAccountDeletedBanner(false)}
                  className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-colors"
                  aria-label="Fermer le message"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Bloc premier écran : hero pleine hauteur (nav déduite) + bandeau compte en bas du viewport si invité */}
        <div
          className={`relative w-full grid min-h-[calc(100dvh-var(--header-height,56px))] ${
            isLoading || userId ? 'grid-rows-[1fr]' : 'grid-rows-[1fr_auto]'
          }`}
        >
          {/* Hero en 1fr + bandeau compte en auto : le bleu reste visible en bas du 1er écran */}
          <section
            className="section-hero relative min-h-0 flex flex-col justify-center overflow-y-auto pt-16 pb-8 md:pt-20 md:pb-12"
            aria-label="Accueil"
          >
            <div className="absolute inset-0 z-0" aria-hidden>
              <Image
                src={HERO_IMAGE}
                alt=""
                fill
                className="object-cover object-top"
                priority
                sizes="100vw"
              />
            </div>
            <div className="section-hero-overlay" aria-hidden />

            <div className="relative z-10 max-w-[900px] mx-auto px-4 md:px-6 text-center">
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-xl leading-tight">
                Comparez et simulez votre revenu net en freelance
              </h1>
              <p className="mt-4 text-lg md:text-xl text-white/90 font-medium leading-snug drop-shadow-md max-w-2xl mx-auto">
                Portage, Micro, EURL IR, EURL IS, SASU — simulations indicatives basées sur les barèmes 2026. Pour une décision finale, faites valider par un expert-comptable.
              </p>

              <div className="mt-6 md:mt-8 w-full">
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-3 md:gap-4 w-full">
                  <Link
                    href="/comparateur"
                    className="group flex items-center gap-2.5 w-full sm:w-auto justify-center px-5 py-3.5 rounded-xl bg-white text-indigo-700 font-black text-sm shadow-lg hover:bg-indigo-50 transition-all hover:scale-[1.02]"
                  >
                    <BarChart3 className="w-5 h-5" />
                    Comparer les statuts
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/simulateur"
                    className="group flex items-center gap-2.5 w-full sm:w-auto justify-center px-5 py-3.5 rounded-xl bg-indigo-500 text-white font-black text-sm shadow-lg hover:bg-indigo-600 transition-all hover:scale-[1.02] border-2 border-white/20"
                  >
                    <TrendingUp className="w-5 h-5" />
                    Simulation 5 ans
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/reglages"
                    className="group flex items-center gap-2.5 w-full sm:w-auto justify-center px-5 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm text-white font-bold text-sm border border-white/30 hover:bg-white/20 transition-all"
                  >
                    <Settings className="w-5 h-5" />
                    Paramètres
                  </Link>
                  <Link
                    href="/articles"
                    className="group flex items-center gap-2.5 w-full sm:w-auto justify-center px-5 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm text-white font-bold text-sm border border-white/30 hover:bg-white/20 transition-all"
                  >
                    <BookOpen className="w-5 h-5" />
                    Guides
                  </Link>
                </div>
              </div>

              <p className="mt-5 md:mt-6 text-[11px] text-white/70 font-bold uppercase tracking-widest">
                Simulation basée sur la Loi de Finances 2026.
              </p>
            </div>
          </section>

          {/* Bannière compte : même premier écran que le hero (grille 1fr + auto) */}
          {isGuest && (
            <section className="relative z-10 bg-gradient-to-r from-indigo-600 to-indigo-700 py-4 md:py-5 shrink-0">
              <div className="max-w-[1000px] mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                  <div className="flex items-center gap-3 md:gap-4 text-white text-center md:text-left">
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 mx-auto md:mx-0">
                      <Gift className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <p className="font-black text-sm">Créez un compte gratuit pour aller plus loin</p>
                      <p className="text-[12px] md:text-[13px] text-white/80 mt-0.5">
                        Sauvegarde automatique, export PDF.
                        <span className="font-bold text-white"> Seule votre adresse email est demandée.</span>
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/inscription"
                    className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-black text-[12px] uppercase tracking-wide hover:bg-indigo-50 transition-all w-full md:w-auto justify-center"
                  >
                    <Sparkles className="w-4 h-4" />
                    Créer mon compte gratuit
                  </Link>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Entrées principales */}
        <section className="relative z-10 bg-page-settings py-12 md:py-16">
          <div className="max-w-[1000px] mx-auto px-4 md:px-6">
            {/* Ligne 1 : 3 cartes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-6">
              <Link
                href="/comparateur"
                className="rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-5 md:p-6 text-center shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all block"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wide">Comparateur</h3>
                <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-400">
                  Comparez les 5 statuts sur un même profil et voyez le net annuel ou mensuel.
                </p>
              </Link>
              <Link
                href="/simulateur"
                className="rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-5 md:p-6 text-center shadow-sm hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-md transition-all block"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wide">Simulation 5 ans</h3>
                <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-400">
                  Choisissez un statut (Portage, Micro, EURL, SASU) et simulez sur 5 ans avec ACRE et CFE.
                </p>
              </Link>
              <Link
                href="/outils"
                className="rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-5 md:p-6 text-center shadow-sm hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-md transition-all block sm:col-span-2 md:col-span-1"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-3">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wide">Outils</h3>
                <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-400">
                  Indemnités km, CFE, ACRE, plafonds Micro, TVA, TJM, IR, cotisations TNS.
                </p>
              </Link>
            </div>

            {/* Ligne 2 : 2 cartes centrées */}
            <div className="flex flex-col sm:flex-row items-stretch justify-center gap-6 md:gap-6 mt-6 md:mt-6 max-w-[700px] mx-auto">
              <Link
                href="/reglages"
                className="rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-5 md:p-6 text-center shadow-sm hover:border-sky-300 dark:hover:border-sky-600 hover:shadow-md transition-all block flex-1 min-w-0"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-3">
                  <Settings className="w-6 h-6" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wide">Paramètres</h3>
                <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-400">
                  TJM, jours, véhicule, charges… Configurez votre profil pour les comparaisons et simulations.
                </p>
              </Link>
              <Link
                href="/articles"
                className="rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-5 md:p-6 text-center shadow-sm hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-md transition-all block flex-1 min-w-0"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wide">Guides</h3>
                <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-400">
                  Articles pour comprendre les statuts et tirer parti du simulateur.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Section avantages du compte : uniquement si non connecté */}
        {isGuest && (
          <section className="relative z-10 bg-white dark:bg-slate-900 py-12 md:py-16 border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-[900px] mx-auto px-4 md:px-6">
              <div className="text-center mb-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-black uppercase tracking-wide mb-4">
                  <Gift className="w-3.5 h-3.5" />
                  100% Gratuit
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Créez votre compte et profitez de plus de fonctionnalités
                </h2>
                <p className="mt-3 text-[15px] text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                  Un compte gratuit vous permet de retrouver vos paramètres et d&apos;exporter vos simulations. 
                  <span className="font-bold text-slate-700 dark:text-slate-300"> Seule une adresse email est requise.</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 text-center border border-slate-100 dark:border-slate-700">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
                    <Save className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white text-sm">Sauvegarde automatique</h4>
                  <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
                    Vos paramètres sont sauvegardés automatiquement et synchronisés sur tous vos appareils.
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 text-center border border-slate-100 dark:border-slate-700">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3">
                    <FileDown className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white text-sm">Export PDF</h4>
                  <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
                    Exportez vos comparatifs et simulations en PDF pour les conserver ou les partager.
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 text-center border border-slate-100 dark:border-slate-700">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white text-sm">Données privées</h4>
                  <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
                    Aucune donnée personnelle collectée. Seule votre adresse email est requise.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 rounded-2xl p-6 md:p-8 border border-indigo-200 dark:border-indigo-800">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400">Compte recommandé</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      Sauvegardez vos réglages et exportez vos simulations
                    </h3>
                    <p className="mt-2 text-[13px] text-slate-600 dark:text-slate-400">
                      Créez un compte pour retrouver facilement vos paramètres et générer des PDF à partager.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                    <Link
                      href="/inscription"
                      className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-black text-sm shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all"
                    >
                      Créer mon compte gratuit
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/connexion"
                      className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Déjà inscrit ? Se connecter
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <FaqSection />

        <Footer />
      </main>
    </>
  );
}
