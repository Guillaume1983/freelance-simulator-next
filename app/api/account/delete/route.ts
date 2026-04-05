import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { EMAIL_FROM_TRANSACTIONAL, SITE_CONTACT_EMAIL } from '@/lib/email';

/** Nettoie les guillemets / espaces souvent présents dans .env */
function normalizeEnvKey(value: string | undefined): string | undefined {
  if (value == null || value === '') return undefined;
  let s = value.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s || undefined;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * E-mail de confirmation après suppression (meilleur effort si RESEND_API_KEY est défini).
 */
async function sendAccountDeletedConfirmation(userEmail: string | undefined): Promise<void> {
  if (!userEmail || !process.env.RESEND_API_KEY) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[account/delete] RESEND_API_KEY absent : pas d’e-mail de confirmation envoyé');
    }
    return;
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const safe = escapeHtml(userEmail);
    await resend.emails.send({
      from: EMAIL_FROM_TRANSACTIONAL,
      to: userEmail,
      subject: 'Votre compte a été supprimé · Freelance Simulateur',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
          <p style="font-size: 16px; margin: 0 0 16px;">Bonjour,</p>
          <p style="font-size: 15px; line-height: 1.5; margin: 0 0 16px;">
            La suppression de votre compte sur <strong>Freelance Simulateur</strong> (adresse <strong>${safe}</strong>) a bien été effectuée.
          </p>
          <p style="font-size: 15px; line-height: 1.5; margin: 0 0 16px;">
            Vos paramètres de simulation et les données associées à ce compte ont été effacés de nos serveurs.
          </p>
          <p style="font-size: 15px; line-height: 1.5; margin: 0 0 24px;">
            Si vous n’êtes pas à l’origine de cette demande, contactez-nous rapidement à
            <a href="mailto:${escapeHtml(SITE_CONTACT_EMAIL)}" style="color: #4f46e5;">${escapeHtml(SITE_CONTACT_EMAIL)}</a>.
          </p>
          <p style="font-size: 13px; color: #64748b; margin: 0;">
            L’équipe Freelance Simulateur
          </p>
        </div>
      `,
    });
  } catch (e) {
    console.error('[account/delete] envoi e-mail Resend:', e);
  }
}

/**
 * Suppression définitive du compte authentifié (RGPD).
 * Nécessite SUPABASE_SERVICE_ROLE_KEY côté serveur (Dashboard Supabase → Settings → API).
 */
export async function POST() {
  const url = normalizeEnvKey(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anon = normalizeEnvKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const serviceKey = normalizeEnvKey(process.env.SUPABASE_SERVICE_ROLE_KEY);

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

  // Erreur typique AuthApiError not_admin (403) : clé anon ou mauvaise clé à la place du service_role
  if (serviceKey === anon) {
    console.error(
      '[account/delete] SUPABASE_SERVICE_ROLE_KEY est identique à NEXT_PUBLIC_SUPABASE_ANON_KEY : utiliser la clé service_role (secrète) du dashboard Supabase.'
    );
    return NextResponse.json(
      {
        error:
          'Configuration serveur incorrecte : SUPABASE_SERVICE_ROLE_KEY ne doit pas être la clé publique (anon). Utilisez la clé secrète « service_role » (Settings → API dans Supabase).',
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
  /** À conserver avant deleteUser : l’utilisateur n’existe plus ensuite côté Auth */
  const userEmail = user.email ?? undefined;

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
    const code =
      typeof delUserErr === 'object' && delUserErr !== null && 'code' in delUserErr
        ? String((delUserErr as { code?: string }).code)
        : '';
    const isNotAdmin =
      code === 'not_admin' ||
      (typeof delUserErr === 'object' &&
        delUserErr !== null &&
        'status' in delUserErr &&
        (delUserErr as { status?: number }).status === 403);
    if (isNotAdmin) {
      console.error(
        '[account/delete] Droits admin refusés : vérifier que SUPABASE_SERVICE_ROLE_KEY est la clé « service_role » du bon projet Supabase (copier depuis Settings → API, jamais la clé anon).'
      );
      return NextResponse.json(
        {
          error:
            'La clé serveur Supabase n’a pas les droits nécessaires pour supprimer le compte. Vérifiez SUPABASE_SERVICE_ROLE_KEY : ce doit être la clé secrète service_role, distincte de NEXT_PUBLIC_SUPABASE_ANON_KEY.',
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Suppression du compte impossible.' }, { status: 500 });
  }

  await sendAccountDeletedConfirmation(userEmail);

  // Effacer les cookies de session (le compte n’existe plus côté Auth)
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn('[account/delete] signOut:', e);
  }

  return NextResponse.json({ ok: true });
}
