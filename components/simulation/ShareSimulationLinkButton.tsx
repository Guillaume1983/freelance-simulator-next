'use client';

import { useCallback, useRef, useState } from 'react';
import { Link2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSimulationContext } from '@/context/SimulationContext';
import { copyTextToClipboard } from '@/lib/copyToClipboard';
import {
  buildSimulationSharePageUrl,
  encodeSimulationShareFromState,
  toShareableSimulationState,
} from '@/lib/simulateur/simulationShareCodec';
import { cn } from '@/lib/utils';

type Variant = 'compact' | 'mobile';

export function ShareSimulationLinkButton({
  growthByYear,
  variant = 'compact',
  className,
}: {
  growthByYear?: number[];
  variant?: Variant;
  className?: string;
}) {
  const pathname = usePathname();
  const ctx = useSimulationContext();
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleCopy = useCallback(async () => {
    if (typeof window === 'undefined') return;
    setFailed(false);
    let urlString: string;
    try {
      const safe = toShareableSimulationState(ctxRef.current.state as Record<string, unknown>);
      const token = encodeSimulationShareFromState(safe, growthByYear);
      urlString = buildSimulationSharePageUrl(pathname, token);
    } catch {
      setFailed(true);
      setTimeout(() => setFailed(false), 3000);
      return;
    }

    const ok = await copyTextToClipboard(urlString);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setFailed(true);
      setTimeout(() => setFailed(false), 3000);
    }
  }, [pathname, growthByYear]);

  const label = failed ? 'Échec' : copied ? 'Lien copié' : 'Copier le lien';

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={() => void handleCopy()}
        className={cn(
          'inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-600 min-h-0 transition-colors',
          copied && 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400',
          failed && 'border-amber-300 text-amber-800 dark:border-amber-700 dark:text-amber-200',
          className,
        )}
        title="Copier un lien qui reproduit cette simulation (hypothèses incluses)"
        aria-label={label}
      >
        <Link2 size={18} className="shrink-0" aria-hidden />
        <span className="text-[10px] font-bold uppercase tracking-wide">
          {failed ? '!' : copied ? 'OK' : 'Lien'}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-600 min-h-[44px]',
        copied && 'border-emerald-300 text-emerald-700',
        failed && 'border-amber-300 text-amber-800',
        className,
      )}
      aria-label={label}
    >
      <Link2 size={22} className="shrink-0" aria-hidden />
      <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
    </button>
  );
}
