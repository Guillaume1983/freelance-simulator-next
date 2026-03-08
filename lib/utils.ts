type ClassValue = string | number | boolean | undefined | null;

export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(' ');
}

/** Formate un nombre en euros sans toLocaleString (évite les erreurs d'hydratation) */
export function fmtEur(v: number): string {
  const rounded = Math.round(v);
  const abs = Math.abs(rounded);
  let s = '';
  let n = abs;
  if (n === 0) return '0 €';
  while (n > 0) {
    const chunk = n % 1000;
    n = Math.floor(n / 1000);
    if (n > 0) {
      s = ' ' + String(chunk).padStart(3, '0') + s;
    } else {
      s = String(chunk) + s;
    }
  }
  return (rounded < 0 ? '-' : '') + s + ' €';
}
