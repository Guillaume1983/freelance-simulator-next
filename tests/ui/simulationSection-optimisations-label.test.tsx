import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SimulationSection from '@/components/SimulationSection';
import type { ProjectionParams } from '@/lib/projections';
import { calculateRegimes } from '@/lib/projections';

vi.mock('@/hooks/useUser', () => ({
  useUser: () => ({ isConnected: false }),
}));

vi.mock('react-to-print', () => ({
  useReactToPrint: () => () => {},
}));

describe('UI : SimulationSection (libellé optimisations)', () => {
  const baseState = () => {
    const params: ProjectionParams = {
      tjm: 400,
      days: 200,
      taxParts: 1,
      spouseIncome: 0,
      kmAnnuel: 10000,
      cvFiscaux: '6',
      typeVehicule: 'voiture',
      vehiculeElectrique: false,
      loyerPercu: 0,
      activeCharges: [],
      sectionsActive: { vehicule: true, loyer: false },
      portageComm: 5,
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
    return { params, resultats };
  };

  it('affiche "Dont optimisations (IK remboursées)" sur Portage', () => {
    const { params, resultats } = baseState();
    const sim: any = {
      state: params,
      setters: {},
      resultats,
    };

    render(
      <SimulationSection
        sim={sim}
        activeRegime="Portage"
        setActiveRegime={() => {}}
        growthByYear={[0, 0, 0, 0, 0]}
        singleRegime
        palierMode={false}
        articleSplitLayout={false}
      />
    );

    expect(screen.queryAllByText(/Dont optimisations \(IK remboursées\)/).length).toBeGreaterThan(0);
  });

  it('affiche "Dont optimisations (IK, loyer, avantages)" sur EURL IS', () => {
    const { params, resultats } = baseState();
    const sim: any = {
      state: params,
      setters: {},
      resultats,
    };

    render(
      <SimulationSection
        sim={sim}
        activeRegime="EURL IS"
        setActiveRegime={() => {}}
        growthByYear={[0, 0, 0, 0, 0]}
        singleRegime
        palierMode={false}
        articleSplitLayout={false}
      />
    );

    expect(screen.queryAllByText(/Dont optimisations \(IK, loyer, avantages\)/).length).toBeGreaterThan(0);
  });
});

