'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSimulationContext } from '@/context/SimulationContext';
import {
  SHARE_QUERY_KEY,
  decodeSimulationShareParam,
  applySimulationSharePayload,
  payloadToGrowthByYear,
  SIMULATION_SHARE_APPLIED_EVENT,
  type SimulationShareAppliedDetail,
} from '@/lib/simulateur/simulationShareCodec';

export function SimulationShareHydrator() {
  const ctx = useSimulationContext();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const settersRef = useRef(ctx.setters);
  settersRef.current = ctx.setters;
  const processedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const raw = searchParams.get(SHARE_QUERY_KEY);
    if (!raw) {
      processedTokenRef.current = null;
      return;
    }
    if (ctx.isLoading) return;
    if (processedTokenRef.current === raw) return;
    processedTokenRef.current = raw;

    const payload = decodeSimulationShareParam(raw);
    if (payload) {
      applySimulationSharePayload(payload, settersRef.current);
      const growthByYear = payloadToGrowthByYear(payload);
      queueMicrotask(() => {
        window.dispatchEvent(
          new CustomEvent<SimulationShareAppliedDetail>(SIMULATION_SHARE_APPLIED_EVENT, {
            detail: { growthByYear },
          }),
        );
      });
    }

    const next = new URLSearchParams(searchParams.toString());
    next.delete(SHARE_QUERY_KEY);
    next.delete('ca');
    next.delete('statut');
    const qs = next.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    window.history.replaceState(null, '', url);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setters : objet recréé à chaque rendu
  }, [ctx.isLoading, searchParams, pathname]);

  return null;
}
