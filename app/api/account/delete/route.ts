import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Suppression définitive du compte authentifié (RGPD).
 * Nécessite SUPABASE_SERVICE_ROLE_KEY côté serveur (Dashboard Supabase → Settings → API).
 */
export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anon) {
    return NextResponse.json({ error: 'Configuration Supabase manquante.' }, { status: 503 });
  }
  if (!serviceKey) {
    console.error('[account/delete] SUPABASE_SERVICE_ROLE_KEY non défini');
    return NextResponse.json(
      {
        error:
          'La suppression de compte n’est pas configurée sur le serveur. Ajoutez SUPABASE_SERVICE_ROLE_KEY dans les variables d’environnement.',
      },
      { status: 503 }
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ error: 'Vous devez être connecté pour supprimer votre compte.' }, { status: 401 });
  }

  const uid = user.id;

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Données applicatives (avant auth.users, au cas où les FK ne cascadent pas)
  const { error: errSettings } = await admin.from('simulation_settings').delete().eq('user_id', uid);
  if (errSettings) {
    console.error('[account/delete] simulation_settings:', errSettings);
    return NextResponse.json({ error: 'Suppression des données impossible.' }, { status: 500 });
  }

  const { error: errProfile } = await admin.from('user_profiles').delete().eq('id', uid);
  if (errProfile) {
    console.error('[account/delete] user_profiles:', errProfile);
    return NextResponse.json({ error: 'Suppression du profil impossible.' }, { status: 500 });
  }

  const { error: delUserErr } = await admin.auth.admin.deleteUser(uid);
  if (delUserErr) {
    console.error('[account/delete] auth.admin.deleteUser:', delUserErr);
    return NextResponse.json({ error: 'Suppression du compte impossible.' }, { status: 500 });
  }

  // Effacer les cookies de session (le compte n’existe plus côté Auth)
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn('[account/delete] signOut:', e);
  }

  return NextResponse.json({ ok: true });
}
