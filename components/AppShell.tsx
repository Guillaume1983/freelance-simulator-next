'use client';

import { useState } from 'react';
import { useSimulationContext } from '@/context/SimulationContext';
import Header from '@/components/Header';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const { saveStatus } = useSimulationContext();

  return (
    <>
      <Header
        isDark={isDark}
        setIsDark={setIsDark}
        saveStatus={saveStatus}
      />
      <div style={{ height: 'var(--header-height, 56px)' }} aria-hidden />
      {children}
    </>
  );
}
