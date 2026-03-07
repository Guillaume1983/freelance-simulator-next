'use client';
import React from 'react';
import Link from 'next/link';
import { LineChart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-8 md:py-10 px-4 md:px-6 mt-12">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-10 md:items-end">

          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 dark:bg-indigo-600 p-2 rounded-xl">
                <LineChart className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-slate-900 dark:text-white text-xl tracking-tighter">
                freelance-<span className="text-indigo-600">simulateur</span>
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-md font-medium">
              Simulez et comparez votre revenu net selon votre statut juridique.
              Calculs basés sur la Loi de Finances 2026.
            </p>
          </div>

          {/* Accès rapide — 2 colonnes, aligné en bas (md:items-end sur la grille) */}
          <div className="flex flex-col gap-4 pt-4 md:pt-0">
            <div>
              <h4 className="font-black text-slate-900 dark:text-white text-[10px] uppercase tracking-[0.2em] mb-2">Accès rapide</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                <Link href="/comparateur" className="footer-link">Comparateur</Link>
                <Link href="/simulateur/sasu" className="footer-link">Simulateur</Link>
                <Link href="/articles" className="footer-link">Articles</Link>
                <Link href="/contact" className="footer-link">Contact</Link>
                <Link href="/connexion" className="footer-link">Se connecter</Link>
                <Link href="/inscription" className="footer-link">Créer un compte</Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar : © + lien légal (Contact déjà dans Accès rapide) */}
        <div className="border-t border-slate-100 dark:border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em]">
            © 2026 freelance-simulateur.fr
          </p>
          <a href="#" className="text-slate-400 hover:text-indigo-600 text-[10px] font-black uppercase tracking-widest transition-colors">Confidentialité</a>
        </div>
      </div>
    </footer>
  );
}
