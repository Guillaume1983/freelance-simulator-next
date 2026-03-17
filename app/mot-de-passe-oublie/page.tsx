'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.includes('@')) {
      setError('Email invalide');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/mot-de-passe-reset`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
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
                Lien envoyé
              </h1>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Si un compte existe avec cet email, un lien de réinitialisation vient de vous être envoyé.
                Pensez à vérifier vos spams.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                  Mot de passe oublié
                </h1>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Entrez votre adresse email, nous vous enverrons un lien pour choisir un nouveau mot de passe.
                </p>
              </div>

              {error && (
                <p className="text-[12px] text-rose-600 font-bold">
                  {error}
                </p>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="w-full px-3 py-2.5 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Envoi…' : (
                  <>
                    Envoyer le lien
                    <Send size={13} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

