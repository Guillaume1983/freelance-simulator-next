import { describe, it, expect } from 'vitest';
import { calculateRegimes, type ProjectionParams } from '@/lib/projections';
import { CHARGES_CATALOG } from '@/lib/constants';

function makeChargeAmounts(overrides: Record<string, number> = {}) {
  return CHARGES_CATALOG.reduce((acc, c) => {
    acc[c.id] = overrides[c.id] ?? 0;
    return acc;
  }, {} as Record<string, number>);
}

function baseParams(): ProjectionParams {
  return {
    tjm: 400,
    days: 200,
    taxParts: 1,
    spouseIncome: 0,
    kmAnnuel: 0,
    cvFiscaux: '6',
    loyerPercu: 0,
    activeCharges: [],
    sectionsActive: { vehicule: false, loyer: false },
    portageComm: 5,
    chargeAmounts: makeChargeAmounts(),
    acreEnabled: true,
    citySize: 'moyenne',
    growthRate: 0,
    typeVehicule: 'voiture',
    vehiculeElectrique: false,
    avantagesOptimises: 0,
    typeActiviteMicro: 'BNC',
    prelevementLiberatoire: false,
    remunerationDirigeantMensuelle: 1,
    repartitionRemuneration: 100,
  };
}

describe('Portage : portageWarning sur les charges', () => {
  it('ignore les charges portageWarning=true pour le calcul "portage"', () => {
    const portageWarningCharge = CHARGES_CATALOG.find((c) => c.portageWarning)?.id;
    const normalCharge = CHARGES_CATALOG.find((c) => !c.portageWarning)?.id;
    expect(portageWarningCharge).toBeTruthy();
    expect(normalCharge).toBeTruthy();

    const pExcluded = baseParams();
    pExcluded.activeCharges = [portageWarningCharge!];
    pExcluded.chargeAmounts = makeChargeAmounts({ [portageWarningCharge!]: 100 });

    const regimesExcluded = calculateRegimes(pExcluded);
    const portageExcluded = regimesExcluded.find((r) => r.id === 'Portage')!;
    const eurlIrExcluded = regimesExcluded.find((r) => r.id === 'EURL IR')!;

    expect(portageExcluded.fees).toBeCloseTo(0, 5);
    expect(eurlIrExcluded.fees).toBeGreaterThan(0);

    const pIncluded = baseParams();
    pIncluded.activeCharges = [normalCharge!];
    pIncluded.chargeAmounts = makeChargeAmounts({ [normalCharge!]: 100 });

    const regimesIncluded = calculateRegimes(pIncluded);
    const portageIncluded = regimesIncluded.find((r) => r.id === 'Portage')!;

    expect(portageIncluded.fees).toBeGreaterThan(0);
  });
});

