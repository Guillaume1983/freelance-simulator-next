'use client';
import React from 'react';
import { LineChart, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-slate-800 py-8 md:py-10 px-4 md:px-6 mt-12">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-10">
          
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 dark:bg-indigo-600 p-2 rounded-xl">
                <LineChart className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-slate-900 dark:text-white text-xl tracking-tighter">
                Free<span className="text-indigo-600">Calcul</span>
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-md font-medium">
              La plateforme d'ingénierie fiscale dédiée aux consultants indépendants. 
              Simulez votre trajectoire financière avec une précision chirurgicale.
            </p>
            <div className="flex">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 font-bold text-xs flex items-center gap-2">
                <span className="text-amber-500 text-lg">⭐</span> 4.9/5 satisfaction expert
              </div>
            </div>
          </div>

          {/* Outils Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-black text-slate-900 dark:text-white text-[10px] uppercase tracking-[0.2em] mb-2">Outils</h4>
            <a href="#" className="footer-link">Optimiseur de dividendes</a>
            <a href="#" className="footer-link">Calculateur ARE/ARCE</a>
            <a href="#" className="footer-link">Gestion des IK</a>
          </div>

          {/* Support Button */}
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 dark:text-white text-[10px] uppercase tracking-[0.2em] mb-2">Support</h4>
            <button className="flex items-center gap-3 bg-indigo-600 px-6 py-4 rounded-2xl text-[11px] font-black text-white shadow-xl shadow-indigo-100 dark:shadow-none hover:-translate-y-1 transition-all uppercase tracking-wider">
              <MessageSquare className="w-4 h-4" />
              Parler à un conseiller
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 dark:border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em]">
            © 2026 FreeCalcul Intelligence Fiscale.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-slate-400 hover:text-indigo-600 text-[10px] font-black uppercase tracking-widest transition-colors">Compliance</a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 text-[10px] font-black uppercase tracking-widest transition-colors">Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
}