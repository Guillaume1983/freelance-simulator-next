import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpandPanels from '@/components/ExpandPanels';

describe('UI : ExpandPanels (optimisations & charges)', () => {
  it('permet de modifier le loyer dans Optimisations', async () => {
    const user = userEvent.setup();

    const setLoyerPercu = vi.fn();

    const sim: any = {
      state: {
        tjm: 400,
        days: 200,
        taxParts: 1,
        kmAnnuel: 0,
        cvFiscaux: '6',
        typeVehicule: 'voiture',
        vehiculeElectrique: false,
        loyerPercu: 0,
        sectionsActive: { vehicule: false },
        activeCharges: [],
        chargeAmounts: {},
        materielAnnuel: 0,
        materielActive: false,
        avantagesOptimises: 0,
        spouseIncome: 0,
        portageComm: 5,
        acreEnabled: true,
        citySize: 'moyenne',
        growthRate: 0,
        typeActiviteMicro: 'BNC',
        prelevementLiberatoire: false,
        remunerationDirigeantMensuelle: 1,
        repartitionRemuneration: 100,
      },
      setters: {
        setLoyerPercu,
      },
    };

    render(<ExpandPanels activePanel="opti" sim={sim} />);

    const spinbuttons = screen.getAllByRole('spinbutton');
    // 1er spinbutton = loyer, 2e = avantages
    const loyerInput = spinbuttons[0];
    expect(loyerInput).not.toBeDisabled();

    await user.clear(loyerInput);
    await user.type(loyerInput, '500');

    expect(setLoyerPercu).toHaveBeenCalled();
  });

  it('permet de modifier les charges (aucun verrouillage des inputs)', async () => {
    const user = userEvent.setup();

    const setChargeAmounts = vi.fn((updater: any) => {
      // Pas besoin de simuler l’état complet pour ce test
      if (typeof updater === 'function') return;
    });
    const setActiveCharges = vi.fn();

    const sim: any = {
      state: {
        tjm: 400,
        days: 200,
        taxParts: 1,
        kmAnnuel: 0,
        cvFiscaux: '6',
        typeVehicule: 'voiture',
        vehiculeElectrique: false,
        loyerPercu: 0,
        sectionsActive: { vehicule: false },
        activeCharges: [],
        chargeAmounts: {},
        materielAnnuel: 0,
        materielActive: false,
        avantagesOptimises: 0,
        spouseIncome: 0,
        portageComm: 5,
        acreEnabled: true,
        citySize: 'moyenne',
        growthRate: 0,
        typeActiviteMicro: 'BNC',
        prelevementLiberatoire: false,
        remunerationDirigeantMensuelle: 1,
        repartitionRemuneration: 100,
      },
      setters: {
        setChargeAmounts,
        setActiveCharges,
      },
    };

    render(<ExpandPanels activePanel="charges" sim={sim} />);

    const spinbuttons = screen.getAllByRole('spinbutton');
    expect(spinbuttons.length).toBeGreaterThan(0);
    expect(spinbuttons[0]).not.toBeDisabled();

    await user.clear(spinbuttons[0]);
    await user.type(spinbuttons[0], '123');

    expect(setChargeAmounts).toHaveBeenCalled();
    expect(setActiveCharges).toHaveBeenCalled();
  });
});

