'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Moon, Sun, LineChart, Menu, X, LogOut, ChevronDown, UserCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function Header({ isDark, setIsDark }: { isDark: boolean, setIsDark: (d: boolean) => void }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Détecter l'utilisateur connecté et écouter les changements d'auth
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fermer le menu utilisateur en cliquant en dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleTheme = () => {
    const newDarkState = !isDark;
    setIsDark(newDarkState);
    if (newDarkState) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setUserMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  const getInitials = (u: User) => {
    const prenom = u.user_metadata?.prenom || '';
    const nom = u.user_metadata?.nom || '';
    if (prenom && nom) return `${prenom[0]}${nom[0]}`.toUpperCase();
    return (u.email?.[0] || '?').toUpperCase();
  };

  const getDisplayName = (u: User) => {
    const prenom = u.user_metadata?.prenom;
    if (prenom) return prenom;
    return u.email?.split('@')[0] || 'Mon compte';
  };

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-[100]">

      {/* Barre principale */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-2 flex justify-between items-center gap-4">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer shrink-0">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 transition-transform group-hover:rotate-12">
            <LineChart className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <h1 className="text-base md:text-xl font-800 text-slate-900 dark:text-white tracking-tighter">
            freelance-<span className="text-indigo-600">simulateur</span>
          </h1>
        </Link>

        {/* TITRE CENTRAL — desktop uniquement */}
        <div className="hidden md:block text-center">
          <h2 className="text-base font-800 text-slate-900 dark:text-white leading-tight">
            Moteur de simulation <span className="text-indigo-600">Expert</span>
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
            Données certifiées Loi de Finances 2026
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">

          {/* BOUTON DARK MODE */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500 dark:text-white hover:text-indigo-600"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            /* ── UTILISATEUR CONNECTÉ ── */
            <div className="hidden md:block relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[11px] font-black shrink-0">
                  {getInitials(user)}
                </div>
                <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                  {getDisplayName(user)}
                </span>
                <ChevronDown size={12} className={`text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-black text-slate-800 dark:text-white truncate">{getDisplayName(user)}</p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{user.email}</p>
                  </div>
                  <div className="p-1.5">
                    <Link
                      href="/mon-compte"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <UserCircle size={13} />
                      Mon compte
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                    >
                      <LogOut size={13} />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── NON CONNECTÉ ── */
            <>
              <div className="hidden lg:flex items-center gap-4">
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                <Link href="/connexion" className="text-xs text-slate-600 dark:text-slate-300 font-bold hover:text-indigo-600 transition-colors">
                  Se connecter
                </Link>
              </div>

              <Link href="/inscription" className="hidden md:block bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-800 text-[11px] shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all whitespace-nowrap">
                S&apos;inscrire
              </Link>
            </>
          )}

          {/* Hamburger — mobile uniquement */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500 dark:text-white"
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Drawer mobile */}
      {menuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          <div className="max-w-[1600px] mx-auto px-4 py-4 flex flex-col gap-1">

            {user && (
              <div className="flex items-center gap-3 px-3 py-3 mb-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[12px] font-black shrink-0">
                  {getInitials(user)}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-black text-slate-800 dark:text-white truncate">{getDisplayName(user)}</p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">{user.email}</p>
                </div>
              </div>
            )}

            {user ? (
              <>
                <Link
                  href="/mon-compte"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserCircle size={15} />
                  Mon compte
                </Link>
                <button
                  onClick={() => { handleSignOut(); setMenuOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors text-left"
                >
                  <LogOut size={14} />
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/connexion"
                  className="px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Se connecter
                </Link>
                <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/inscription"
                    className="block w-full bg-indigo-600 text-white py-2.5 rounded-xl font-800 text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all text-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    S&apos;inscrire
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </nav>
  );
}
