'use client';

/** Icône fichier PDF (document avec sigle PDF) — reconnue pour l’export PDF */
export default function PdfIcon({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <text x="12" y="17.5" textAnchor="middle" fill="currentColor" style={{ fontFamily: 'system-ui, sans-serif', fontSize: 8, fontWeight: 800 }}>PDF</text>
    </svg>
  );
}
