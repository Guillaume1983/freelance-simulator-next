'use client';

import React, { createContext, useContext } from 'react';
import { useSimulation } from '@/hooks/useSimulation';

type SimulationContextValue = ReturnType<typeof useSimulation> & {
  sim: ReturnType<typeof useSimulation>;
};

export type SimulationState = SimulationContextValue['state'];
export type SimulationSetters = SimulationContextValue['setters'];

const SimulationContext = createContext<SimulationContextValue | null>(null);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const sim = useSimulation();

  const value: SimulationContextValue = {
    ...sim,
    sim,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulationContext() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulationContext must be used within SimulationProvider');
  return ctx;
}
