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
    materielAnnuel: 0,
    typeActiviteMicro: 'BNC',
    prelevementLiberatoire: false,
    remunerationDirigeantMensuelle: 1,
    repartitionRemuneration: 100,
  };
}

describe('Portage : IK, loyer, lignes', () => {
  it('inclut bien les IK dans Portage (et elles ont un effet sur le net)', () => {
    const pNoIK = baseParams();
    const noIK = calculateRegimes(pNoIK).find((r) => r.id === 'Portage');

    const pIK = baseParams();
    pIK.kmAnnuel = 10000;
    pIK.sectionsActive.vehicule = true;
    const withIK = calculateRegimes(pIK).find((r) => r.id === 'Portage');

    expect(withIK).toBeTruthy();
    expect(withIK!.fees).toBeGreaterThan(0);

    const ikLine = withIK!.lines?.find((l) => l.id === 'indemnites_km');
    expect(ikLine).toBeTruthy();
    expect((ikLine as any)?.amount ?? 0).toBeGreaterThan(0);

    // On veut un changement visible sur le net (sinon on a probablement un "double compte" qui annule).
    expect(Math.abs((withIK!.net ?? 0) - (noIK!.net ?? 0))).toBeGreaterThan(1);
  });

  it('applique l’electric sur les IK Portage (≈ x1.2)', () => {
    const pOff = baseParams();
    pOff.kmAnnuel = 10000;
    pOff.sectionsActive.vehicule = true;
    pOff.vehiculeElectrique = false;

    const pOn = baseParams();
    pOn.kmAnnuel = 10000;
    pOn.sectionsActive.vehicule = true;
    pOn.vehiculeElectrique = true;

    const off = calculateRegimes(pOff).find((r) => r.id === 'Portage');
    const on = calculateRegimes(pOn).find((r) => r.id === 'Portage');

    const ikOff = off!.lines?.find((l) => l.id === 'indemnites_km') as any;
    const ikOn = on!.lines?.find((l) => l.id === 'indemnites_km') as any;

    const a = ikOff?.amount ?? 0;
    const b = ikOn?.amount ?? 0;
    expect(b).toBeGreaterThan(a);
    expect(b / a).toBeCloseTo(1.2, 3);
  });

  it('ne tient pas compte du loyer pour Portage (et n’affiche pas la ligne loyer_percu)', () => {
    const pBase = baseParams();
    pBase.kmAnnuel = 10000;
    pBase.sectionsActive.vehicule = true;

    const pNoLoyer = { ...pBase, loyerPercu: 0, sectionsActive: { ...pBase.sectionsActive, loyer: false } };
    const pWithLoyer = {
      ...pBase,
      loyerPercu: 350,
      sectionsActive: { ...pBase.sectionsActive, loyer: true },
    };

    const no = calculateRegimes(pNoLoyer).find((r) => r.id === 'Portage')!;
    const yes = calculateRegimes(pWithLoyer).find((r) => r.id === 'Portage')!;

    expect(yes.fees).toBeCloseTo(no.fees, 5);
    expect(yes.net).toBeCloseTo(no.net, 5);
    expect(yes.lines?.some((l) => l.id === 'loyer_percu')).toBe(false);
  });
});

