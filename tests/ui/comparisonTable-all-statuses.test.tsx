import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ComparisonTable from '@/components/ComparisonTable';
import type { ProjectionParams } from '@/lib/projections';
import { calculateRegimes } from '@/lib/projections';

vi.mock('@/hooks/useUser', () => ({
  useUser: () => ({ isConnected: false }),
}));

vi.mock('react-to-print', () => ({
  useReactToPrint: () => () => {},
}));

describe('UI : Comparateur (ComparisonTable)', () => {
  it('affiche tous les statuts et le bon libellé "optimisations" (fixe)', () => {
    const params: ProjectionParams = {
      tjm: 400,
      days: 200,
      taxParts: 1,
      spouseIncome: 0,
      kmAnnuel: 12000,
      cvFiscaux: '6',
      typeVehicule: 'voiture',
      vehiculeElectrique: false,
      loyerPercu: 3000,
      activeCharges: [],
      sectionsActive: { vehicule: true },
      portageComm: 10,
      chargeAmounts: {},
      acreEnabled: true,
      citySize: 'moyenne',
      growthRate: 0,
      typeActiviteMicro: 'BNC',
      prelevementLiberatoire: false,
      remunerationDirigeantMensuelle: 1,
      repartitionRemuneration: 100,
      avantagesOptimises: 2000,
      materielAnnuel: 0,
    };

    const resultats = calculateRegimes(params);
    const sim: any = { state: params, resultats };

    render(<ComparisonTable sim={sim} />);

    for (const id of ['Portage', 'Micro', 'EURL IR', 'EURL IS', 'SASU']) {
      expect(screen.queryAllByText(id).length).toBeGreaterThan(0);
    }

    // Le comparateur garde le libellé "Dont optimisations (IK, loyer, avantages)"
    expect(
      screen.queryAllByText(/Dont optimisations \(IK, loyer, avantages\)/).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/Dont optimisations \(IK remboursées\)/)).toBeNull();

    // La ligne commission de portage ne s'affiche que s'il y a une commission > 0.
    expect(screen.queryAllByText('Commission de portage').length).toBeGreaterThan(0);
  });

  it('affiche la ligne optimisations si loyerPercu > 0', () => {
    const params: ProjectionParams = {
      tjm: 400,
      days: 200,
      taxParts: 1,
      spouseIncome: 0,
      kmAnnuel: 0,
      cvFiscaux: '6',
      typeVehicule: 'voiture',
      vehiculeElectrique: false,
      loyerPercu: 400,
      activeCharges: [],
      sectionsActive: { vehicule: false },
      portageComm: 0,
      chargeAmounts: {},
      acreEnabled: true,
      citySize: 'moyenne',
      growthRate: 0,
      typeActiviteMicro: 'BNC',
      prelevementLiberatoire: false,
      remunerationDirigeantMensuelle: 1,
      repartitionRemuneration: 100,
      avantagesOptimises: 0,
      materielAnnuel: 0,
    };

    const resultats = calculateRegimes(params);
    const sim: any = { state: params, resultats };

    render(<ComparisonTable sim={sim} />);

    expect(screen.queryAllByText(/Dont optimisations \(IK, loyer, avantages\)/).length).toBeGreaterThan(0);
  });
});

