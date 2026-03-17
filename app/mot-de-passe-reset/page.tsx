'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password || password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push('/connexion'), 2500);
  };

  return (
    <main className="min-h-screen bg-page-settings min-w-0">
      <div className="max-w-[460px] mx-auto px-4 md:px-6 py-10 md:py-16">
        <Link
          href="/connexion"
          className="inline-flex items-center gap-1.5 text-[12px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-6"
        >
          <ArrowLeft size={14} />
          Retour à la connexion
        </Link>

        <div className="card-pro p-7 md:p-9">
          {done ? (
            <div className="space-y-3">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                Mot de passe mis à jour
              </h1>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Vous allez être redirigé vers la page de connexion.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                  Choisissez un nouveau mot de passe
                </h1>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Ce lien est valable une seule fois. Après validation, utilisez ce nouveau mot de passe pour vous connecter.
                </p>
              </div>

              {error && (
                <p className="text-[12px] text-rose-600 font-bold">
                  {error}
                </p>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                  Confirmation
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Mise à jour…' : 'Enregistrer le nouveau mot de passe'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

