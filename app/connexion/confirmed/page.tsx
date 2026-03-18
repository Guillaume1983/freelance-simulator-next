'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function ConnexionConfirmedPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    setChecking(false);
  }, []);

  useEffect(() => {
    if (checking) return;
    if (user) {
      // On laisse un flag très court pour afficher le bandeau sur l'accueil
      // juste après la confirmation, puis on redirige.
      sessionStorage.setItem('emailConfirmedBanner', '1');
      router.replace('/');
      return;
    }
    // Si user non trouvé (rare), on redirige vers la connexion.
    router.replace('/connexion');
  }, [checking, user, router]);

  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-12 md:py-20 flex flex-col items-center justify-center">
        {checking ? (
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        ) : (
        <div className="w-full md:max-w-md card-pro p-7 md:p-9">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Check size={22} className="text-emerald-600 dark:text-emerald-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                Email confirmé
              </h1>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                Votre compte est activé. {user ? 'Vous êtes connecté.' : 'Vous pouvez vous connecter.'}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Link
              href={user ? '/mon-compte' : '/connexion'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-sm sm:text-base text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-colors min-h-[48px]"
            >
              {user ? "Aller à mon compte" : 'Aller à la connexion'}
            </Link>

            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-black text-sm sm:text-base text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm transition-colors min-h-[48px]"
            >
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
        )}
      </div>
    </main>
  );
}

