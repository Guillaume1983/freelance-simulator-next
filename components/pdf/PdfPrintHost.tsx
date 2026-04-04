'use client';

import type { ReactNode, RefObject } from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * DOM réservé à react-to-print : portail sur `document.body`.
 * Masquage à l’écran : app/globals.css (.pdf-print-host) — pas via PDF_PAGE_STYLE seul,
 * car pageStyle n’est appliqué qu’au moment d’imprimer.
 */
export function PdfPrintHost({
  printRef,
  children,
}: {
  printRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={printRef}
      className="pdf-print-host"
      aria-hidden="true"
      data-pdf-print-host=""
      tabIndex={-1}
    >
      {children}
    </div>,
    document.body,
  );
}
