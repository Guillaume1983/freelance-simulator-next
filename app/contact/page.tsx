'use client';
import { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SUBJECTS = [
  'Question générale',
  'Problème technique',
  'Suggestion d\'amélioration',
  'Demande de suppression de compte',
  'Autre',
];

export default function ContactPage() {
  const [isDark, setIsDark] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', _honeypot: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nom requis';
    if (!form.email.includes('@')) e.email = 'Email invalide';
    if (!form.message.trim() || form.message.trim().length < 10) e.message = 'Message trop court (10 caractères minimum)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGlobalError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setGlobalError(data.error || 'Une erreur est survenue. Réessayez.');
        return;
      }

      setSuccess(true);
    } catch {
      setGlobalError('Une erreur est survenue. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <main className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500">
        <Header isDark={isDark} setIsDark={setIsDark} />

        <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-12 md:py-20 flex flex-col md:flex-row gap-12 md:gap-16 items-start">

          {/* Panneau gauche */}
          <div className="flex-1 md:max-w-[300px] flex flex-col gap-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight mb-3">
                Nous<br /><span className="text-indigo-600">contacter</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Une question, un problème ou une suggestion ? Nous vous répondons dans les 48 heures.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl shrink-0">
                  <Mail size={15} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-1">Email</p>
                  <a
                    href="mailto:contact@freelance-simulateur.fr"
                    className="text-[12px] text-indigo-500 font-bold hover:underline"
                  >
                    contact@freelance-simulateur.fr
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl shrink-0">
                  <MessageSquare size={15} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-1">Délai de réponse</p>
                  <p className="text-[12px] text-slate-500 font-bold">Sous 48 h ouvrées</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="w-full md:flex-1">
            <div className="card-pro p-7 md:p-9">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={26} className="text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Message envoyé !</h2>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Merci pour votre message. Nous vous répondrons dans les 48 h ouvrées à l&apos;adresse <strong>{form.email}</strong>.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6">Envoyer un message</h2>

                  {globalError && (
                    <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-3 mb-5">
                      <p className="text-[12px] text-rose-600 font-bold">{globalError}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {/* Honeypot anti-spam (invisible) */}
                    <input
                      type="text"
                      name="_honeypot"
                      value={form._honeypot}
                      onChange={e => setForm(f => ({ ...f, _honeypot: e.target.value }))}
                      style={{ display: 'none' }}
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                          Nom complet <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Jean Dupont"
                          className={`w-full px-3 py-2.5 text-sm ${errors.name ? 'ring-rose-400' : ''}`}
                        />
                        {errors.name && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                          Email <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="jean@email.com"
                          className={`w-full px-3 py-2.5 text-sm ${errors.email ? 'ring-rose-400' : ''}`}
                        />
                        {errors.email && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Sujet</label>
                      <select
                        value={form.subject}
                        onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                        className="w-full px-3 py-2.5 text-sm"
                      >
                        <option value="">Sélectionner un sujet</option>
                        {SUBJECTS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                        Message <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="Décrivez votre demande…"
                        rows={5}
                        className={`w-full px-3 py-2.5 text-sm resize-none ${errors.message ? 'ring-rose-400' : ''}`}
                      />
                      <div className="flex justify-between items-center mt-1">
                        {errors.message
                          ? <p className="text-[10px] text-rose-500 font-bold">{errors.message}</p>
                          : <span />
                        }
                        <span className="text-[10px] text-slate-400 font-medium ml-auto">{form.message.length} car.</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Envoi en cours…' : (
                        <>
                          Envoyer le message
                          <Send size={13} />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
