import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const CONTACT_EMAIL = 'contact@freelance-simulateur.fr';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, subject, message, _honeypot } = body;

  // Anti-spam : champ honeypot rempli = bot
  if (_honeypot) {
    return NextResponse.json({ success: true });
  }

  // Validation
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email invalide.' }, { status: 400 });
  }
  if (message.trim().length < 10) {
    return NextResponse.json({ error: 'Message trop court.' }, { status: 400 });
  }

  // 1. Sauvegarder dans Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error: dbError } = await supabase.from('contact_messages').insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject?.trim() || null,
    message: message.trim(),
  });

  if (dbError) {
    console.error('Supabase contact insert error:', dbError);
  }

  // 2. Envoyer une notification email via Resend (optionnel)
  //    → Activer en ajoutant RESEND_API_KEY dans .env.local et sur Vercel
  //    → Vérifier le domaine freelance-simulateur.fr sur resend.com
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: `Freelance Simulateur <noreply@freelance-simulateur.fr>`,
        to: CONTACT_EMAIL,
        replyTo: email.trim(),
        subject: `[Contact] ${subject?.trim() || 'Nouveau message'}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4f46e5;">Nouveau message de contact</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; color: #64748b;">Nom</td><td>${name}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #64748b;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #64748b;">Sujet</td><td>${subject || '—'}</td></tr>
            </table>
            <hr style="margin: 16px 0; border-color: #e2e8f0;">
            <p style="white-space: pre-wrap; color: #1e293b;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            <hr style="margin: 16px 0; border-color: #e2e8f0;">
            <p style="font-size: 12px; color: #94a3b8;">Message reçu via freelance-simulateur.fr</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Resend error:', emailError);
      // Ne pas bloquer la réponse si l'email échoue — le message est déjà en base
    }
  }

  return NextResponse.json({ success: true });
}
