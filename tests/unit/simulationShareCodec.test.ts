import { describe, expect, it } from 'vitest';
import {
  buildSimulationSharePageUrl,
  decodeSimulationShareParam,
  encodeSimulationShareFromState,
  encodeSimulationSharePayload,
  payloadToGrowthByYear,
  toShareableSimulationState,
} from '@/lib/simulateur/simulationShareCodec';

describe('simulationShareCodec', () => {
  it('roundtrip encode/decode', () => {
    const payload = {
      tjm: 520,
      days: 210,
      na: 2 as const,
      ne: 1,
      si: 35_000,
      km: 8000,
      cv: '7',
      tv: 'voiture' as const,
      ve: true,
      loy: 0,
      secV: true,
      ac: ['repas', 'tel'],
      cam: { repas: 200, tel: 100 },
      mat: 1200,
      pc: 6.5,
      tam: 'BNC' as const,
      pl: false,
      rd: 0.4,
      rr: 30,
      avo: 500,
      acre: true,
      cs: 'grande' as const,
      gr: 3,
      g5: [3, 5, 5, 10, 2],
    };
    const token = encodeSimulationSharePayload(payload);
    const decoded = decodeSimulationShareParam(token);
    expect(decoded).not.toBeNull();
    expect(decoded!.tjm).toBe(520);
    expect(decoded!.days).toBe(210);
    expect(decoded!.na).toBe(2);
    expect(decoded!.ac).toEqual(['repas', 'tel']);
    expect(decoded!.pc).toBeCloseTo(6.5, 5);
    expect(decoded!.g5).toEqual([3, 5, 5, 10, 2]);
    expect(payloadToGrowthByYear(decoded!)).toEqual([3, 5, 5, 10, 2]);
  });

  it('encodeSimulationShareFromState omits g5 when uniform', () => {
    const token = encodeSimulationShareFromState(
      {
        tjm: 400,
        days: 200,
        nbAdultes: 1,
        nbEnfants: 0,
        spouseIncome: 0,
        kmAnnuel: 0,
        cvFiscaux: '6',
        typeVehicule: 'voiture',
        vehiculeElectrique: false,
        loyerPercu: 0,
        sectionsActive: { vehicule: false },
        activeCharges: [],
        chargeAmounts: {},
        materielAnnuel: 0,
        portageComm: 5,
        typeActiviteMicro: 'BNC',
        prelevementLiberatoire: false,
        remunerationDirigeantMensuelle: 1,
        repartitionRemuneration: 0,
        avantagesOptimises: 0,
        acreEnabled: false,
        citySize: 'moyenne',
        growthRate: 4,
      },
      [4, 4, 4, 4, 4],
    );
    const d = decodeSimulationShareParam(token);
    expect(d?.g5).toBeUndefined();
    expect(payloadToGrowthByYear(d!)).toEqual([4, 4, 4, 4, 4]);
  });

  it('rejects invalid base64', () => {
    expect(decodeSimulationShareParam('not-valid!!!')).toBeNull();
  });

  it('toShareableSimulationState tolère un objet partiel', () => {
    const s = toShareableSimulationState({});
    expect(s.nbAdultes).toBe(1);
    expect(s.activeCharges).toEqual([]);
    const token = encodeSimulationShareFromState(s);
    expect(token.length).toBeGreaterThan(20);
    expect(decodeSimulationShareParam(token)).not.toBeNull();
  });

  it('buildSimulationSharePageUrl assemble origin + path + sim', () => {
    const u = buildSimulationSharePageUrl('/comparateur', 'testToken_123');
    expect(u).toMatch(/https?:\/\//);
    expect(u).toContain('/comparateur');
    expect(u).toContain('sim=testToken_123');
  });
});
