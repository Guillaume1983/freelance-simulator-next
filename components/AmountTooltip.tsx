'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Info } from 'lucide-react';

interface AmountTooltipProps {
  /** Montant affiché */
  amount: number;
  /** CA de référence pour le calcul du % */
  ca: number;
  /** Texte de détail du calcul */
  detailText: string;
  /** Label court du montant (ex: "Cotisations", "Net") */
  label: string;
  /** Couleur de la part (hex) */
  color?: string;
  /** Contenu enfant (le montant formaté) */
  children: ReactNode;
  /** Position préférée */
  position?: 'top' | 'bottom';
}

/** Mini donut chart SVG montrant la part du montant par rapport au CA */
function MiniDonut({ percentage, color }: { percentage: number; color: string }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
        {/* Fond gris */}
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-slate-200 dark:text-slate-700"
        />
        {/* Arc coloré */}
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500"
        />
      </svg>
      {/* Pourcentage au centre */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-black text-slate-700 dark:text-slate-200">
          {percentage.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export default function AmountTooltip({
  amount,
  ca,
  detailText,
  label,
  color = '#6366f1',
  children,
  position = 'top',
}: AmountTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const percentage = ca > 0 ? (Math.abs(amount) / ca) * 100 : 0;

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 280;
    const tooltipHeight = 140;
    const padding = 12;

    let top = position === 'top' ? rect.top - tooltipHeight - padding : rect.bottom + padding;
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;

    // Ajustements pour rester dans la fenêtre
    if (left < padding) left = padding;
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding;
    }
    if (top < padding) {
      top = rect.bottom + padding;
    }
    if (top + tooltipHeight > window.innerHeight - padding) {
      top = rect.top - tooltipHeight - padding;
    }

    setCoords({ top, left });
  }, [isOpen, position]);

  // Fermer au scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = () => setIsOpen(false);
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen]);

  // Fermer au clic extérieur
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        tooltipRef.current?.contains(e.target as Node)
      ) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex items-center gap-1 cursor-help group"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen((v) => !v)}
      >
        {children}
        <Info
          size={12}
          className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors flex-shrink-0"
        />
      </span>

      {isOpen && coords && (
        <div
          ref={tooltipRef}
          className="fixed z-[9999] w-[280px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl shadow-slate-900/20 dark:shadow-black/40 border border-slate-200 dark:border-slate-700 p-4 animate-in fade-in-0 zoom-in-95 duration-150"
          style={{ top: coords.top, left: coords.left }}
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <MiniDonut percentage={percentage} color={color} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {label}
              </p>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {Math.round(Math.abs(amount)).toLocaleString('fr-FR')} €
              </p>
              <p className="text-[11px] font-bold mt-1" style={{ color }}>
                {percentage.toFixed(1)} % du CA
              </p>
            </div>
          </div>

          {/* Détail du calcul */}
          {detailText && detailText !== '—' && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                Détail du calcul
              </p>
              <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {detailText}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
