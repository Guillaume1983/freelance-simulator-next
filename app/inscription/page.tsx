'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LineChart, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/client';

export default function InscriptionPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.prenom.trim()) e.prenom = 'Prénom requis';
    if (!form.nom.trim()) e.nom = 'Nom requis';
    if (!form.email.includes('@')) e.email = 'Email invalide';
    if (form.password.length < 8) e.password = '8 caractères minimum';
    if (form.password !== form.confirm) e.confirm = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { prenom: form.prenom, nom: form.nom },
        // URL de redirection après confirmation par email
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        setErrors({ global: 'Cet email est déjà utilisé. Connectez-vous.' });
      } else {
        setErrors({ global: error.message });
      }
      return;
    }

    // Si Supabase a la confirmation email activée → afficher le message
    // Si désactivée → rediriger directement
    setSuccess(true);
    setTimeout(() => router.push('/'), 3000);
  };

  const perks = [
    'Simulation complète des 5 régimes fiscaux 2026',
    'Sauvegarde automatique de vos paramètres',
    'Accès gratuit, sans engagement',
  ];

  return (
    <div className={isDark ? 'dark' : ''}>
      <main className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500">
        <Header isDark={isDark} setIsDark={setIsDark} />

        <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-12 md:py-20 flex flex-col md:flex-row items-center gap-12 md:gap-16">

          {/* Panneau gauche — bénéfices */}
          <div className="flex-1 hidden md:flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                <LineChart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                freelance-<span className="text-indigo-600">simulateur</span>
              </span>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight mb-3">
                Optimisez votre<br />
                <span className="text-indigo-600">stratégie fiscale</span><br />
                dès aujourd&apos;hui
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Rejoignez des milliers de freelances qui pilotent leur activité avec précision.
              </p>
            </div>

            <ul className="space-y-4">
              {perks.map(p => (
                <li key={p} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-indigo-600" />
                  </div>
                  <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">{p}</span>
                </li>
              ))}
            </ul>

            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 flex items-center gap-4">
              <span className="text-2xl">📊</span>
              <div>
                <p className="text-[11px] font-black text-slate-700 dark:text-slate-200">Données certifiées</p>
                <p className="text-[11px] text-slate-400 font-medium">Loi de Finances 2026</p>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="w-full md:max-w-md">
            <div className="card-pro p-7 md:p-9">

              {success ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mx-auto mb-4">
                    <Check size={26} className="text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Compte créé !</h2>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Vérifiez vos emails et cliquez sur le lien de confirmation.<br />
                    Redirection en cours…
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-7">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Créer un compte</h1>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                      Déjà inscrit ?{' '}
                      <Link href="/connexion" className="text-indigo-600 font-black hover:underline">
                        Se connecter
                      </Link>
                    </p>
                  </div>

                  {errors.global && (
                    <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-3 mb-4">
                      <p className="text-[12px] text-rose-600 font-bold">{errors.global}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Prénom</label>
                        <input
                          type="text"
                          value={form.prenom}
                          onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                          placeholder="Jean"
                          className={`w-full px-3 py-2.5 text-sm ${errors.prenom ? 'ring-rose-400' : ''}`}
                        />
                        {errors.prenom && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.prenom}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Nom</label>
                        <input
                          type="text"
                          value={form.nom}
                          onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                          placeholder="Dupont"
                          className={`w-full px-3 py-2.5 text-sm ${errors.nom ? 'ring-rose-400' : ''}`}
                        />
                        {errors.nom && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.nom}</p>}
                      </div>
                    </div>

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
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Mot de passe</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={form.password}
                          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                          placeholder="8 caractères minimum"
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

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Confirmer le mot de passe</label>
                      <div className="relative">
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          value={form.confirm}
                          onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                          placeholder="Répétez votre mot de passe"
                          className={`w-full px-3 py-2.5 text-sm pr-10 ${errors.confirm ? 'ring-rose-400' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(s => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      {errors.confirm && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.confirm}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Création en cours…' : 'Créer mon compte'}
                      {!loading && <ArrowRight size={13} />}
                    </button>
                  </form>

                  <p className="text-[10px] text-slate-400 font-medium text-center mt-5 leading-relaxed">
                    En créant un compte vous acceptez nos{' '}
                    <a href="#" className="text-indigo-500 hover:underline">CGU</a>{' '}
                    et notre{' '}
                    <a href="#" className="text-indigo-500 hover:underline">politique de confidentialité</a>.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
