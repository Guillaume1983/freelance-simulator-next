'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useSimulationContext } from '@/context/SimulationContext';
import TjmDaysBlock from '@/components/TjmDaysBlock';
import ComparisonTable from '@/components/ComparisonTable';
import Footer from '@/components/Footer';

export default function ComparateurPage() {
  const sim = useSimulationContext();
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="page-blob-1" aria-hidden />
      <div className="page-blob-2" aria-hidden />
      <div className="page-blob-3" aria-hidden />
      <div className="bg-page-grid" aria-hidden />

      <main className="relative z-10 min-h-screen">
        <div className="top-accent-bar" aria-hidden />

        <section
          ref={heroRef}
          id="parametres"
          className="section-hero section-comparatif-hero w-full pt-8 pb-10 md:pt-10 md:pb-10 animate-fade-up"
          aria-label="Comparatif des statuts freelance"
        >
          <div
            className="section-hero-bg"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1600')" }}
            aria-hidden
          />
          <div className="section-hero-overlay" aria-hidden />

          <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6">
            <p className="text-sm md:text-base text-white/90 font-medium leading-snug mb-4">
              Ajustez votre TJM et vos jours travaillés — le comparatif se met à jour en temps réel.
            </p>

            <TjmDaysBlock sim={sim} />

            <p className="mt-4 text-sm text-white/80">
              <Link href="/reglages" className="font-bold text-white underline hover:text-indigo-200">
                Tous les paramètres →
              </Link>
              {' '}(charges, optimisations, situation fiscale, CFE…)
            </p>

            <div className="mt-10 md:mt-12">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-xl leading-tight">
                Comparatif stratégique
              </h2>
              <p className="text-base md:text-lg text-white/90 font-medium mt-2 leading-snug drop-shadow-md">
                Comparez les 5 statuts freelance sur l&apos;ensemble des indicateurs clés — la colonne 🏆 correspond au plus avantageux pour votre profil.
              </p>
            </div>
          </div>
        </section>

        <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6">
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={() => heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              TJM & jours ↑
            </button>
          </div>
          <ComparisonTable sim={sim} />
        </div>

        <Footer />
      </main>
    </>
  );
}
