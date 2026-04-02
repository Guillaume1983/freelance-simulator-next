import { describe, it, expect } from 'vitest';
import { projeterSurNAns, type ProjectionParams } from '@/lib/projections';
import { CHARGES_CATALOG } from '@/lib/constants';

function makeChargeAmounts(overrides: Record<string, number> = {}) {
  return CHARGES_CATALOG.reduce(
    (acc, c) => {
      acc[c.id] = overrides[c.id] ?? 0;
      return acc;
    },
    {} as Record<string, number>,
  );
}

function baseParams(): ProjectionParams {
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
    portageComm: 5,
    chargeAmounts: makeChargeAmounts(),
    acreEnabled: true,
    citySize: 'moyenne',
    growthRate: 0,
    materielAnnuel: 0,
    typeVehicule: 'voiture',
    vehiculeElectrique: false,
    avantagesOptimises: 0,
    typeActiviteMicro: 'BNC',
    prelevementLiberatoire: false,
    remunerationDirigeantMensuelle: 1,
    repartitionRemuneration: 100,
  };
}

describe('projeterSurNAns — croissance cumulée par année', () => {
  it('Année 1 = base ; Année 3 = base × (1+2%) × (1+2%) quand les taux vers An2 et An3 sont 2 %', () => {
    const base = 500 * 200;
    const rates = [0, 0.02, 0.02, 0, 0];
    const sims = projeterSurNAns(baseParams(), rates);
    const portage = (i: number) => sims[i].find((r) => r.id === 'Portage')!;
    expect(portage(0).ca).toBeCloseTo(base, 4);
    expect(portage(1).ca).toBeCloseTo(base * 1.02, 4);
    expect(portage(2).ca).toBeCloseTo(base * 1.02 * 1.02, 4);
  });

  it('combine des taux différents : (1+2%)×(1+3%)', () => {
    const base = 500 * 200;
    const rates = [0, 0.02, 0.03, 0, 0];
    const sims = projeterSurNAns(baseParams(), rates);
    const portage = sims[2].find((r) => r.id === 'Portage')!;
    expect(portage.ca).toBeCloseTo(base * 1.02 * 1.03, 4);
  });

  it('sans tableau growthRates : formule historique (1+r)^(année-1)', () => {
    const base = 500 * 200;
    const p = baseParams();
    p.growthRate = 0.02;
    const sims = projeterSurNAns(p);
    const portage = (i: number) => sims[i].find((r) => r.id === 'Portage')!;
    expect(portage(0).ca).toBeCloseTo(base, 4);
    expect(portage(2).ca).toBeCloseTo(base * Math.pow(1.02, 2), 4);
  });
});
