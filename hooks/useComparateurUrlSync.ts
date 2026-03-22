'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DAYS_FOR_PALIER, STATUT_SLUG_TO_ID } from '@/lib/simulateur/paliers';

type Setters = { setTjm: (n: number) => void; setDays: (n: number) => void };

/**
 * Pré-remplit TJM / jours depuis ?ca= et expose le régime à mettre en avant depuis ?statut= (slug URL).
 */
export function useComparateurUrlSync(setters: Setters) {
  const searchParams = useSearchParams();
  const [focus, setFocus] = useState<{ regimeId: string | null; key: string }>({
    regimeId: null,
    key: '',
  });
  const appliedRef = useRef<string>('');

  useEffect(() => {
    const caStr = searchParams.get('ca');
    const statutSlug = searchParams.get('statut');
    const key = `${caStr ?? ''}|${statutSlug ?? ''}`;

    if (!caStr && !statutSlug) {
      appliedRef.current = '';
      setFocus({ regimeId: null, key: '' });
      return;
    }

    if (appliedRef.current === key) return;

    if (caStr) {
      const caNum = Number.parseInt(caStr.replace(/\D/g, ''), 10);
      if (Number.isFinite(caNum) && caNum > 0) {
        const tjm = Math.round(caNum / DAYS_FOR_PALIER);
        setters.setTjm(tjm);
        setters.setDays(DAYS_FOR_PALIER);
      }
    }

    let regimeId: string | null = null;
    if (statutSlug) {
      regimeId = STATUT_SLUG_TO_ID[statutSlug.toLowerCase()] ?? null;
    }

    setFocus({ regimeId, key });
    appliedRef.current = key;
    // Dépendances : searchParams uniquement (setters stables)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return focus;
}
