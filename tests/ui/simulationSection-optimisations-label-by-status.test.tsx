import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SimulationSection from '@/components/SimulationSection';
import type { ProjectionParams } from '@/lib/projections';

vi.mock('@/hooks/useUser', () => ({
  useUser: () => ({ isConnected: false }),
}));

vi.mock('react-to-print', () => ({
  useReactToPrint: () => () => {},
}));

describe('UI : SimulationSection (simulateurs) - libellé optimisations par statut', () => {
  const buildSimState = (): ProjectionParams => ({
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
  });

  const mkSim = (state: ProjectionParams) => ({
    state: state as any,
    setters: {},
    resultats: [],
  });

  it.each([
    ['Portage', true, true],
    ['Micro', false, false],
    ['EURL IR', false, false],
    ['EURL IS', false, false],
    ['SASU', false, false],
  ])('statut %s : libellé optimisations correct', (activeRegime, expectIkRemboursees, expectCommission) => {
    const state = buildSimState();
    const sim: any = mkSim(state);

    render(
      <SimulationSection
        sim={sim}
        activeRegime={activeRegime}
        setActiveRegime={() => {}}
        singleRegime
        palierMode={false}
        articleSplitLayout={false}
        growthByYear={[0, 0, 0, 0, 0]}
      />
    );

    const labelIkRemb = 'Dont optimisations (IK remboursées)';
    const labelDefault = 'Dont optimisations (IK, loyer, avantages)';
    const commissionLabel = 'Commission de portage';

    if (activeRegime === 'Portage') {
      expect(screen.queryAllByText(labelIkRemb).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(labelDefault).length).toBe(0);
      expect(screen.queryAllByText(commissionLabel).length).toBeGreaterThan(0);
    } else if (activeRegime === 'Micro') {
      // Sur Micro, la ligne "optimisations" est masquée.
      expect(screen.queryAllByText(labelIkRemb).length).toBe(0);
      expect(screen.queryAllByText(labelDefault).length).toBe(0);
      expect(screen.queryAllByText(commissionLabel).length).toBe(0);
    } else {
      expect(screen.queryAllByText(labelDefault).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(labelIkRemb).length).toBe(0);
      expect(screen.queryAllByText(commissionLabel).length).toBe(0);
    }

    if (activeRegime === 'SASU') {
      // SASU avec part salaire > 0 affiche les cotisations assimilé-salarié.
      // Par défaut (part salaire = 0 %), pas de cotisations, mais la ligne reste
      // potentiellement visible selon les régimes affichés en parallèle.
    }

    // garde-fou générique
    const commissionCount = screen.queryAllByText(commissionLabel).length;
    expect(commissionCount > 0).toBe(expectCommission);
    const ikRembCount = screen.queryAllByText(labelIkRemb).length;
    expect(ikRembCount > 0).toBe(expectIkRemboursees);
  });
});

