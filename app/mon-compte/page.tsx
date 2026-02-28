'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Trash2, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function MonComptePage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Profil
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Mot de passe
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // Suppression
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteZone, setShowDeleteZone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/connexion'); return; }
      setUser(user);
      setPrenom(user.user_metadata?.prenom || '');
      setNom(user.user_metadata?.nom || '');
      setLoading(false);
    });
  }, [router]);

  const handleSaveProfile = async () => {
    if (!prenom.trim()) { setProfileMsg({ type: 'err', text: 'Le prénom est requis.' }); return; }
    setSavingProfile(true);
    setProfileMsg(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.updateUser({ data: { prenom, nom } });
    if (!authError) {
      await supabase.from('user_profiles').update({ prenom, nom }).eq('id', user!.id);
    }
    setSavingProfile(false);
    setProfileMsg(authError
      ? { type: 'err', text: 'Erreur lors de la mise à jour.' }
      : { type: 'ok', text: 'Profil mis à jour.' }
    );
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) { setPasswordMsg({ type: 'err', text: '8 caractères minimum.' }); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg({ type: 'err', text: 'Les mots de passe ne correspondent pas.' }); return; }
    setSavingPassword(true);
    setPasswordMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      setPasswordMsg({ type: 'err', text: 'Erreur lors du changement de mot de passe.' });
    } else {
      setPasswordMsg({ type: 'ok', text: 'Mot de passe mis à jour.' });
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleDeleteRequest = () => {
    const subject = encodeURIComponent('Demande de suppression de compte');
    const body = encodeURIComponent(
      `Bonjour,\n\nJe souhaite supprimer mon compte sur freelance-simulateur.fr.\n\nEmail du compte : ${user?.email}\n\nMerci de traiter ma demande dans les meilleurs délais.\n\nCordialement`
    );
    window.location.href = `mailto:contact@freelance-simulateur.fr?subject=${subject}&body=${body}`;
  };

  if (loading) {
    return (
      <div className={isDark ? 'dark' : ''}>
        <main className="min-h-screen bg-[#f8fafc] dark:bg-[#020617]">
          <Header isDark={isDark} setIsDark={setIsDark} />
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <main className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500">
        <Header isDark={isDark} setIsDark={setIsDark} />

        <div className="max-w-[700px] mx-auto px-4 md:px-6 py-12 md:py-16 space-y-6">

          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Mon compte</h1>
            <p className="text-[12px] text-slate-400 font-medium mt-1">{user?.email}</p>
          </div>

          {/* Section Profil */}
          <div className="card-pro p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                <User size={16} className="text-indigo-600" />
              </div>
              <h2 className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Informations personnelles</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Prénom</label>
                <input
                  type="text"
                  value={prenom}
                  onChange={e => setPrenom(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Nom</label>
                <input
                  type="text"
                  value={nom}
                  onChange={e => setNom(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Email</label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                <Mail size={13} className="text-slate-400 shrink-0" />
                <span className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</span>
              </div>
            </div>

            {profileMsg && (
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4 text-[12px] font-bold ${profileMsg.type === 'ok' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'}`}>
                <CheckCircle size={13} />
                {profileMsg.text}
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-60 shadow-lg shadow-indigo-100 dark:shadow-none"
            >
              {savingProfile ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>

          {/* Section Mot de passe */}
          <div className="card-pro p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <Lock size={16} className="text-slate-500" />
              </div>
              <h2 className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Changer le mot de passe</h2>
            </div>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showNewPwd ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="8 caractères minimum"
                    className="w-full px-3 py-2.5 text-sm pr-10"
                  />
                  <button type="button" onClick={() => setShowNewPwd(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showNewPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Confirmer</label>
                <div className="relative">
                  <input
                    type={showConfirmPwd ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Répétez le mot de passe"
                    className="w-full px-3 py-2.5 text-sm pr-10"
                  />
                  <button type="button" onClick={() => setShowConfirmPwd(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showConfirmPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {passwordMsg && (
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4 text-[12px] font-bold ${passwordMsg.type === 'ok' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'}`}>
                <CheckCircle size={13} />
                {passwordMsg.text}
              </div>
            )}

            <button
              onClick={handleChangePassword}
              disabled={savingPassword || !newPassword}
              className="border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-40"
            >
              {savingPassword ? 'Mise à jour…' : 'Changer le mot de passe'}
            </button>
          </div>

          {/* Zone de danger */}
          <div className="card-pro p-6 md:p-8 border border-rose-100 dark:border-rose-900/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                <Trash2 size={16} className="text-rose-500" />
              </div>
              <h2 className="text-[13px] font-black text-rose-600 uppercase tracking-widest">Zone de danger</h2>
            </div>

            {!showDeleteZone ? (
              <div>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-4">
                  La suppression de votre compte est définitive. Toutes vos données (paramètres, historique) seront effacées.
                  Conformément au RGPD, nous traitons votre demande dans un délai de 30 jours.
                </p>
                <button
                  onClick={() => setShowDeleteZone(true)}
                  className="border-2 border-rose-200 dark:border-rose-800 text-rose-500 px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                >
                  Demander la suppression du compte
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-amber-700 dark:text-amber-300 font-bold leading-relaxed">
                    Cette action est irréversible. Tapez <strong>SUPPRIMER</strong> pour confirmer votre demande.
                  </p>
                </div>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="Tapez SUPPRIMER"
                  className="w-full px-3 py-2.5 text-sm"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteRequest}
                    disabled={deleteConfirm !== 'SUPPRIMER'}
                    className="bg-rose-600 text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-rose-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Envoyer la demande
                  </button>
                  <button
                    onClick={() => { setShowDeleteZone(false); setDeleteConfirm(''); }}
                    className="border-2 border-slate-200 dark:border-slate-700 text-slate-500 px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Annuler
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  Votre client email va s&apos;ouvrir avec un message pré-rempli à envoyer à contact@freelance-simulateur.fr
                </p>
              </div>
            )}
          </div>

        </div>

        <Footer />
      </main>
    </div>
  );
}
