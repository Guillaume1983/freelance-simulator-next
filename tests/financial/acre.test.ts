import { describe, it, expect } from 'vitest';
import { calculateRegimes, type ProjectionParams } from '@/lib/projections';
import { ACRE_COTISATION_FACTOR, RATES_2026 } from '@/lib/financial/rates';
import { CHARGES_CATALOG } from '@/lib/constants';

function emptyCharges(): Record<string, number> {
  return CHARGES_CATALOG.reduce((acc, c) => {
    acc[c.id] = 0;
    return acc;
  }, {} as Record<string, number>);
}

function baseParams(overrides: Partial<ProjectionParams> = {}): ProjectionParams {
  return {
    tjm: 500,
    days: 200,
    taxParts: 1,
    spouseIncome: 0,
    kmAnnuel: 0,
    cvFiscaux: '6',
    loyerPercu: 0,
    activeCharges: [],
    sectionsActive: { vehicule: false },
    portageComm: 8,
    chargeAmounts: emptyCharges(),
    acreEnabled: false,
    citySize: 'moyenne',
    growthRate: 0,
    typeVehicule: 'voiture',
    vehiculeElectrique: false,
    materielAnnuel: 0,
    avantagesOptimises: 0,
    typeActiviteMicro: 'BNC',
    prelevementLiberatoire: false,
    remunerationDirigeantMensuelle: 1,
    repartitionRemuneration: 50,
    ...overrides,
  };
}

describe('ACRE — année 1 (acreActive)', () => {
  it('Micro : cotisations × ACRE_COTISATION_FACTOR sur le taux URSSAF lorsque acre activée', () => {
    const ca = 500 * 200;
    const baseCotis = ca * RATES_2026.micro.BNC.cotis;
    const pOff = baseParams({ acreEnabled: false, annee: 1, typeActiviteMicro: 'BNC' });
    const pOn = baseParams({ acreEnabled: true, annee: 1, typeActiviteMicro: 'BNC' });
    const microOff = calculateRegimes(pOff).find((r) => r.id === 'Micro')!;
    const microOn = calculateRegimes(pOn).find((r) => r.id === 'Micro')!;
    expect(microOff.cotis).toBeCloseTo(baseCotis, 0);
    expect(microOn.cotis).toBeCloseTo(baseCotis * ACRE_COTISATION_FACTOR, 0);
  });

  it('EURL IR : cotisations totales diminuent avec ACRE (TNS hors CSG/CRDS)', () => {
    const pOff = baseParams({ acreEnabled: false, annee: 1 });
    const pOn = baseParams({ acreEnabled: true, annee: 1 });
    const eurlOff = calculateRegimes(pOff).find((r) => r.id === 'EURL IR')!;
    const eurlOn = calculateRegimes(pOn).find((r) => r.id === 'EURL IR')!;
    expect(eurlOn.cotis).toBeLessThan(eurlOff.cotis);
    expect(eurlOn.cotis).toBeGreaterThan(0);
  });

  it('EURL IS : cotisations baissent avec ACRE (taux × facteur ; le net réagit donc le ratio ≠ facteur seul)', () => {
    const pOff = baseParams({ acreEnabled: false, annee: 1 });
    const pOn = baseParams({ acreEnabled: true, annee: 1 });
    const off = calculateRegimes(pOff).find((r) => r.id === 'EURL IS')!;
    const on = calculateRegimes(pOn).find((r) => r.id === 'EURL IS')!;
    expect(on.cotis).toBeLessThan(off.cotis);
    const r0 = RATES_2026.eurlIs.cotis;
    const r1 = r0 * RATES_2026.eurlIs.acre;
    const expectedRatio = (r1 / (1 + r1)) / (r0 / (1 + r0));
    expect(on.cotis / off.cotis).toBeCloseTo(expectedRatio, 4);
  });

  it('SASU : cotisations président suivent le même schéma (taux × facteur sur enveloppe)', () => {
    const pOff = baseParams({ acreEnabled: false, annee: 1, repartitionRemuneration: 100 });
    const pOn = baseParams({ acreEnabled: true, annee: 1, repartitionRemuneration: 100 });
    const off = calculateRegimes(pOff).find((r) => r.id === 'SASU')!;
    const on = calculateRegimes(pOn).find((r) => r.id === 'SASU')!;
    expect(on.cotis).toBeLessThan(off.cotis);
    const r0 = RATES_2026.sasu.cotis;
    const r1 = r0 * RATES_2026.sasu.acre;
    const expectedRatio = (r1 / (1 + r1)) / (r0 / (1 + r0));
    expect(on.cotis / off.cotis).toBeCloseTo(expectedRatio, 4);
  });

  it('Portage : ACRE ne change pas les cotisations (salarié)', () => {
    const pOff = baseParams({ acreEnabled: false, annee: 1 });
    const pOn = baseParams({ acreEnabled: true, annee: 1 });
    const off = calculateRegimes(pOff).find((r) => r.id === 'Portage')!;
    const on = calculateRegimes(pOn).find((r) => r.id === 'Portage')!;
    expect(on.cotis).toBeCloseTo(off.cotis, 0);
  });

  it('Année 2 : acreEnabled sans effet (régime établi)', () => {
    const pOff = baseParams({ acreEnabled: false, annee: 2 });
    const pOn = baseParams({ acreEnabled: true, annee: 2 });
    const microOff = calculateRegimes(pOff).find((r) => r.id === 'Micro')!;
    const microOn = calculateRegimes(pOn).find((r) => r.id === 'Micro')!;
    expect(microOn.cotis).toBeCloseTo(microOff.cotis, 0);
  });
});
