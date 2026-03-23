import { describe, it, expect } from 'vitest';
import { generateMetadata } from '@/app/simulateur/[statut]/[ca]/page';

describe('SEO : canonical pages palier', () => {
  it('canonical=/simulateur/{statut}/{ca} sur les pages palier', async () => {
    const res = await generateMetadata({
      params: Promise.resolve({ statut: 'portage', ca: '100000' }),
    });

    const canonical = (res as any)?.alternates?.canonical;
    const ogUrl = (res as any)?.openGraph?.url;

    expect(canonical).toBe('https://freelance-simulateur.fr/simulateur/portage/100000');
    expect(ogUrl).toBe('https://freelance-simulateur.fr/simulateur/portage/100000');
  });
});

