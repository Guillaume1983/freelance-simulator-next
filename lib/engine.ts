export const calculateIR = (base: number, parts: number = 1) => {
    let b = (base * 0.9) / parts; 
    let r = 0;
    if (b > 177106) { r += (b - 177106) * 0.45; b = 177106; }
    else if (b > 82341) { r += (b - 82341) * 0.41; b = 82341; }
    else if (b > 28797) { r += (b - 28797) * 0.30; b = 28797; }
    else if (b > 11294) { r += (b - 11294) * 0.11; }
    return r * parts;
};

export const getIK = (km: number, cv: string) => {
    const bareme = { '6': { a: 0.665, b: 0.386, c: 0.455 }, '7': { a: 0.697, b: 0.415, c: 0.486 } };
    const r = bareme[cv as keyof typeof bareme] || bareme['6'];
    return (km <= 5000) ? km * r.a : (km <= 20000) ? (km * r.b) + 1500 : km * r.c;
};

export const getRegimesData = (tjm: number, days: number, monthlyCharges: number, km: number) => {
    const ca = tjm * days;
    const cf = monthlyCharges * 12;
    const ik = getIK(km, '6');

    return [
        { id: 'Portage', name: 'Portage Salarial', class: 'portage', mental: 1, safety: 'Haut', 
          calc: () => { const b = ca * 0.95 - cf; const c = b * 0.45; const ir = calculateIR(b - c); return { net: b - c - ir, cotis: c, ir, fees: cf, ca }; } },
        { id: 'Micro', name: 'Auto-Entrepreneur', class: 'micro', mental: 1, safety: 'Moyen',
          calc: () => { const c = ca * 0.211; const ir = ca * 0.022; return { net: ca - c - ir, cotis: c, ir, fees: 0, ca }; } },
        { id: 'EURL IS', name: 'EURL IS', class: 'eurl-is', mental: 4, safety: 'Expert',
          calc: () => { const b = ca - cf - ik; const c = b * 0.42; const ir = calculateIR(b - c); return { net: b - c - ir, cotis: c, ir, fees: cf + ik, ca }; } },
        { id: 'SASU IS', name: 'SASU IS', class: 'sasu', mental: 5, safety: 'Dirigeant',
          calc: () => { const b = ca - cf - ik; const c = b * 0.80; const ir = calculateIR(b - c); return { net: b - c - ir, cotis: c, ir, fees: cf + ik, ca }; } }
    ].map(r => ({ ...r, ...r.calc() }));
};