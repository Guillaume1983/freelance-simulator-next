import { describe, it, expect } from 'vitest';
import { getIK } from '@/lib/financial/rates';

describe('getIK', () => {
  it('applique la majoration véhicule électrique +20%', () => {
    const km = 10000;
    const withoutElec = getIK(km, 'voiture', '6', false);
    const withElec = getIK(km, 'voiture', '6', true);

    // Tolérance numérique (arrondis internes possibles selon barème)
    expect(withElec).toBeGreaterThan(withoutElec);
    expect(withElec / withoutElec).toBeCloseTo(1.2, 3);
  });

  it('supporte bien le type cyclo50 (cvOrBande ignoré) ', () => {
    const km = 12000;
    const v1 = getIK(km, 'cyclo50', '6', false);
    const v2 = getIK(km, 'cyclo50', undefined, false);
    expect(v1).toBeCloseTo(v2, 6);
  });
});

