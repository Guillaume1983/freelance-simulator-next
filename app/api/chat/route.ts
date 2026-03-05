import { streamText, type UIMessage, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';

const SYSTEM_PROMPT = `Tu es l'assistant du site Freelance Simulateur (freelance-simulateur.fr). Tu aides les visiteurs à comprendre et comparer les statuts fiscaux des freelances en France (Loi de Finances 2026).

Tu peux expliquer et comparer : Portage salarial, Micro-entreprise (BNC ou BIC), EURL à l'IR, EURL à l'IS, SASU. Réponds de façon claire, concise et factuelle. Si tu ne connais pas un détail précis (seuils, taux), invite l'utilisateur à utiliser le simulateur sur le site pour des chiffres exacts. Réponds toujours en français.`;

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'OPENAI_API_KEY non configurée.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let messages: UIMessage[];
  try {
    const body = await req.json();
    messages = body.messages ?? [];
  } catch {
    return new Response(
      JSON.stringify({ error: 'Body JSON invalide.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
    });
    return result.toUIMessageStreamResponse();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur API OpenAI';
    console.error('[api/chat]', err);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
