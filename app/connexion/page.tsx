'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LineChart, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/client';

export default function ConnexionPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.email.includes('@')) newErrors.email = 'Email invalide';
    if (!form.password) newErrors.password = 'Mot de passe requis';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    setErrors({});

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (error) {
      setErrors({ global: 'Email ou mot de passe incorrect.' });
      return;
    }

    router.push('/');
    router.refresh();
  };

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <main className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500">
        <Header isDark={isDark} setIsDark={setIsDark} />

        <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-12 md:py-20 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16">

          {/* Panneau gauche — branding */}
          <div className="flex-1 hidden md:flex flex-col gap-8 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                <LineChart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                Free<span className="text-indigo-600">Calcul</span>
              </span>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight mb-3">
                Bon retour<br />
                parmi nous 👋
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Retrouvez vos simulations, vos comparatifs et continuez d&apos;optimiser votre stratégie fiscale.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { emoji: '📊', label: 'Simulations sauvegardées', sub: 'Retrouvez l\'historique de vos simulations' },
                { emoji: '📄', label: 'Exports PDF', sub: 'Téléchargez vos rapports complets' },
                { emoji: '🔔', label: 'Alertes réglementaires', sub: 'Soyez notifié des changements fiscaux' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
                  <span className="text-lg shrink-0">{item.emoji}</span>
                  <div>
                    <p className="text-[12px] font-black text-slate-700 dark:text-slate-200">{item.label}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formulaire */}
          <div className="w-full md:max-w-md">
            <div className="card-pro p-7 md:p-9">
              <div className="mb-7">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Se connecter</h1>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Pas encore de compte ?{' '}
                  <Link href="/inscription" className="text-indigo-600 font-black hover:underline">
                    S&apos;inscrire gratuitement
                  </Link>
                </p>
              </div>

              {errors.global && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-3 mb-4">
                  <p className="text-[12px] text-rose-600 font-bold">{errors.global}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="jean.dupont@email.com"
                    className={`w-full px-3 py-2.5 text-sm ${errors.email ? 'ring-rose-400' : ''}`}
                  />
                  {errors.email && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.email}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Mot de passe</label>
                    <a href="#" className="text-[10px] text-indigo-500 font-black hover:underline">
                      Mot de passe oublié ?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                      className={`w-full px-3 py-2.5 text-sm pr-10 ${errors.password ? 'ring-rose-400' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.password}</p>}
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => setRemember(r => !r)}
                    className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-all ${
                      remember ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {remember && <span className="text-white text-[9px] font-black leading-none">✓</span>}
                  </div>
                  <span className="text-[12px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                    Se souvenir de moi
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Connexion…' : 'Se connecter'}
                  {!loading && <ArrowRight size={13} />}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-400 font-bold text-center uppercase tracking-widest mb-3">ou continuer avec</p>
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-[12px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continuer avec Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
