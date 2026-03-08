'use client';

import Link from 'next/link';
import { BarChart3, TrendingUp, BookOpen, ArrowRight, Settings, Wrench } from 'lucide-react';
import Footer from '@/components/Footer';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600';

export default function Home() {
  return (
    <>
      <div className="page-blob-1" aria-hidden />
      <div className="page-blob-2" aria-hidden />
      <div className="page-blob-3" aria-hidden />
      <div className="bg-page-grid" aria-hidden />

      <main className="relative z-10 min-h-screen">

        {/* Hero épuré */}
        <section
          className="section-hero w-full min-h-[70vh] flex flex-col justify-center pt-20 pb-16 md:pt-28 md:pb-24"
          aria-label="Accueil"
        >
          <div
            className="section-hero-bg transition-[background-image] duration-500"
            style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
            aria-hidden
          />
          <div className="section-hero-overlay" aria-hidden />

          <div className="relative z-10 max-w-[900px] mx-auto px-4 md:px-6 text-center">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-xl leading-tight">
              Comparez et simulez votre revenu net en freelance
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/90 font-medium leading-snug drop-shadow-md max-w-2xl mx-auto">
              Portage, Micro, EURL IR, EURL IS, SASU — données certifiées Loi de Finances 2026.
            </p>

            <div className="mt-10 md:mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
              <Link
                href="/comparateur"
                className="group flex items-center gap-2.5 w-full sm:w-auto justify-center px-6 py-4 rounded-2xl bg-white text-indigo-700 font-black text-sm shadow-xl hover:bg-indigo-50 transition-all hover:scale-[1.02]"
              >
                <BarChart3 className="w-5 h-5" />
                Comparer les statuts
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/simulateur"
                className="group flex items-center gap-2.5 w-full sm:w-auto justify-center px-6 py-4 rounded-2xl bg-indigo-500 text-white font-black text-sm shadow-xl hover:bg-indigo-600 transition-all hover:scale-[1.02] border-2 border-white/20"
              >
                <TrendingUp className="w-5 h-5" />
                Simulation 5 ans
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/articles"
                className="group flex items-center gap-2.5 w-full sm:w-auto justify-center px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white font-bold text-sm border border-white/30 hover:bg-white/20 transition-all"
              >
                <BookOpen className="w-5 h-5" />
                Guides & articles
              </Link>
            </div>
            <p className="mt-8 text-[11px] text-white/70 font-bold uppercase tracking-widest">
              Réglages communs : modifiez vos paramètres depuis le menu Paramètres, puis comparez ou simulez.
            </p>
          </div>
        </section>

        {/* Entrées principales — même ordre que le header : Comparer, Simuler, Outils, Paramètres, Guides */}
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

        <Footer />
      </main>
    </>
  );
}
