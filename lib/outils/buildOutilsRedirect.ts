import type { OutilId } from '@/lib/outils/outilsConfig';

/** Anciennes URLs /outils/{slug} → /outils?outil=… (+ paramètres conservés). */
export function buildOutilsUnifiedUrl(
  outil: OutilId,
  incoming: Record<string, string | string[] | undefined>,
): string {
  const q = new URLSearchParams();
  q.set('outil', outil);
  for (const [key, val] of Object.entries(incoming)) {
    if (key === 'outil') continue;
    if (typeof val === 'string') q.set(key, val);
    else if (Array.isArray(val)) val.forEach((v) => q.append(key, v));
  }
  const s = q.toString();
  return s ? `/outils?${s}` : '/outils';
}
