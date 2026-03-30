'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Moon, Sun, LineChart, Menu, X, LogOut, ChevronDown, UserCircle, Check, AlertCircle, Loader, BarChart3, TrendingUp, BookOpen, Wrench } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { SaveStatus } from '@/hooks/useSimulation';

const SIMULATEUR_LINKS = [
  { href: '/simulateur/portage', label: 'Portage' },
  { href: '/simulateur/micro', label: 'Micro' },
  { href: '/simulateur/eurl-ir', label: 'EURL IR' },
  { href: '/simulateur/eurl-is', label: 'EURL IS' },
  { href: '/simulateur/sasu', label: 'SASU' },
] as const;

export default function Header({ isDark, setIsDark, saveStatus }: {
  isDark: boolean;
  setIsDark: (d: boolean) => void;
  saveStatus?: SaveStatus;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [simulateurOpen, setSimulateurOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const simulateurRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Hauteur de la nav pour coller le bandeau TJM/Jours sans espace (--header-height)
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const setHeight = () => {
      document.documentElement.style.setProperty('--header-height', `${el.offsetHeight}px`);
    };
    setHeight();
    const ro = new ResizeObserver(setHeight);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Détecter l'utilisateur connecté et écouter les changements d'auth
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fermer les dropdowns en cliquant en dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) setUserMenuOpen(false);
      if (simulateurRef.current && !simulateurRef.current.contains(target)) setSimulateurOpen(false);
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
    <nav ref={navRef} className="bg-white dark:bg-slate-900/90 backdrop-blur-md border-b-2 border-slate-200 dark:border-slate-800 sticky top-0 z-[100]">
      {/* Barre principale */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-2 flex justify-between items-center gap-4">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer min-w-0 shrink">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 transition-transform group-hover:rotate-12 shrink-0">
            <LineChart className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <h1 className="text-base md:text-xl font-800 text-slate-900 dark:text-white tracking-tighter truncate">
            freelance-<span className="text-indigo-600">simulateur</span>
          </h1>
        </Link>

        {/* NAV desktop */}
        <div className="hidden lg:flex items-center gap-1">
          <Link href="/" className="px-3 py-2 rounded-xl text-[12px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors">
            Accueil
          </Link>
          <Link href="/comparateur" className="px-3 py-2 rounded-xl text-[12px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
            <BarChart3 size={14} />
            Comparer
          </Link>
          <div className="relative" ref={simulateurRef}>
            <button
              type="button"
              onClick={() => setSimulateurOpen((o) => !o)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
              aria-haspopup="menu"
              aria-expanded={simulateurOpen}
              aria-controls="simulateur-menu"
            >
              <TrendingUp size={14} />
              Simuler
              <ChevronDown size={12} className={simulateurOpen ? 'rotate-180' : ''} />
            </button>
            {simulateurOpen && (
              <div
                id="simulateur-menu"
                role="menu"
                className="absolute left-0 top-full mt-1 w-44 py-1 bg-white dark:bg-slate-900 rounded-xl shadow-xl border-2 border-slate-200 dark:border-slate-700 z-50"
              >
                {SIMULATEUR_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    role="menuitem"
                    className="block px-4 py-2 text-[12px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600"
                    onClick={() => setSimulateurOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link
            href="/outils"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
          >
            <Wrench size={14} />
            Outils
          </Link>
          <Link href="/articles" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors">
            <BookOpen size={14} />
            Guides
          </Link>
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

          {/* Indicateur de sauvegarde — visible uniquement si connecté */}
          {user && saveStatus && saveStatus !== 'idle' && (
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all duration-300 ${
                saveStatus === 'saving'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  : saveStatus === 'saved'
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'
                  : 'bg-rose-50 dark:bg-rose-900/30 text-rose-500'
              }`}
            >
              {saveStatus === 'saving' && <Loader size={11} className="animate-spin" />}
              {saveStatus === 'saved' && <Check size={11} />}
              {saveStatus === 'error' && <AlertCircle size={11} />}
              {saveStatus === 'saving'
                ? 'Sauvegarde…'
                : saveStatus === 'saved'
                ? 'Sauvegardé'
                : 'Erreur save'}
            </div>
          )}

          {user ? (
            /* ── UTILISATEUR CONNECTÉ ── */
            <div className="hidden md:block relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[11px] font-black shrink-0">
                  {user && getInitials(user)}
                </div>
                <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                  {user && getDisplayName(user)}
                </span>
                <ChevronDown
                  size={12}
                  className={`text-slate-400 transition-transform ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-black text-slate-800 dark:text-white truncate">
                      {user && getDisplayName(user)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {user?.email}
                    </p>
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
            /* ── NON CONNECTÉ — avec mise en avant des avantages ── */
            <>
              <div className="hidden lg:flex items-center gap-4">
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                <Link
                  href="/connexion"
                  className="text-xs text-slate-600 dark:text-slate-300 font-bold hover:text-indigo-600 transition-colors"
                >
                  Se connecter
                </Link>
              </div>

              <Link
                href="/inscription"
                className="hidden md:inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-black text-[11px] shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all whitespace-nowrap"
              >
                Créer un compte
              </Link>
            </>
          )}

          {/* Hamburger — mobile / tablette */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500 dark:text-white"
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Drawer mobile / panneau gauche */}
      {menuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md max-h-[80vh] overflow-y-auto">
          <div className="max-w-[1600px] mx-auto px-4 py-4 flex flex-col gap-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 px-1">Navigation</p>
            <Link href="/" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors" onClick={() => setMenuOpen(false)}>
              Accueil
            </Link>
            <Link href="/comparateur" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors" onClick={() => setMenuOpen(false)}>
              <BarChart3 size={16} />
              Comparer les statuts
            </Link>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-2 mb-1 px-1">Simuler un statut</p>
            {SIMULATEUR_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors pl-5" onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link
              href="/outils"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors pl-5 mt-2"
              onClick={() => setMenuOpen(false)}
            >
              <Wrench size={16} />
              Outils
            </Link>
            <Link href="/articles" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors mt-1" onClick={() => setMenuOpen(false)}>
              <BookOpen size={16} />
              Guides & articles
            </Link>
            <div className="border-t border-slate-200 dark:border-slate-700 my-3 pt-3" />
            {user && (
              <div className="flex items-center gap-3 px-3 py-3 mb-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[12px] font-black shrink-0">
                  {getInitials(user)}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-black text-slate-800 dark:text-white truncate">
                    {getDisplayName(user)}
                  </p>
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
                  onClick={() => {
                    handleSignOut();
                    setMenuOpen(false);
                  }}
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
                <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
                  {/* Avantages du compte */}
                  <div className="mb-3 px-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
                      Créer un compte gratuit
                    </p>
                    <ul className="space-y-1.5">
                      <li className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <Check size={12} className="text-emerald-500 shrink-0" />
                        <span>Sauvegarde automatique des paramètres</span>
                      </li>
                      <li className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <Check size={12} className="text-emerald-500 shrink-0" />
                        <span>Export PDF de vos simulations</span>
                      </li>
                      <li className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <Check size={12} className="text-emerald-500 shrink-0" />
                        <span>Seul l&apos;email est demandé</span>
                      </li>
                    </ul>
                  </div>
                  <Link
                    href="/inscription"
                    className="block w-full bg-indigo-600 text-white py-3 rounded-xl font-800 text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all text-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    Créer mon compte gratuit
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

