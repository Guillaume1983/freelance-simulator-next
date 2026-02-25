'use client';
import { Moon, Sun, LineChart } from 'lucide-react';

export default function Header({ isDark, setIsDark }: { isDark: boolean, setIsDark: (d: boolean) => void }) {
  
  const toggleTheme = () => {
    const newDarkState = !isDark;
    setIsDark(newDarkState);
    
    // Application de la classe sur la racine pour activer le mode dark de Tailwind
    if (newDarkState) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-2 sticky top-0 z-[100]">
      <div className="max-w-[1600px] mx-auto flex justify-between items-center">
        
        {/* LOGO */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 transition-transform group-hover:rotate-12">
            <LineChart className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-800 text-slate-900 dark:text-white tracking-tighter hidden sm:block">
            Free<span className="text-indigo-600">Calcul</span>
          </h1>
        </div>

        {/* TITRE CENTRAL */}
        <div className="text-center">
          <h2 className="text-sm md:text-base font-800 text-slate-900 dark:text-white leading-tight">
            Moteur de simulation toto <span className="text-indigo-600">Expert</span>
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-white font-bold uppercase tracking-widest hidden md:block">
            Données certifiées Loi de Finances 2026
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-5">
          {/* BOUTON DARK MODE */}
          <button 
            onClick={toggleTheme} 
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500 dark:text-white hover:text-indigo-600"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 hidden lg:block"></div>

          <a href="#" className="text-xs hidden lg:block text-slate-600 dark:text-white font-bold hover:text-indigo-600 transition-colors">
            Tarifs
          </a>
          <a href="#" className="text-xs text-slate-600 dark:text-white font-bold hover:text-indigo-600 transition-colors">
            Se connecter
          </a>

          <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-800 text-[11px] shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
            S'INSCRIRE
          </button>
        </div>

      </div>
    </nav>
  );
}
