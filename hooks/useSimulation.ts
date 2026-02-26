import { useState, useMemo } from 'react';

// Constantes brutes extraites de ton HTML
export const CHARGES_CATALOG = [
  { id: 'compta', name: 'Expert-Comptable', amount: 160 },
  { id: 'mutuelle', name: 'Protection Sociale', amount: 140 },
  { id: 'assurance', name: 'Responsabilité Civile', amount: 45 },
  { id: 'repas', name: 'Déjeuners Pro', amount: 190 },
  { id: 'tel', name: 'Tech & Mobilité', amount: 90 }
];

export const useSimulation = () => {
  // States calqués sur tes inputs
  const [tjm, setTjm] = useState(600);
  const [days, setDays] = useState(210);
  const [taxParts, setTaxParts] = useState(1);
  const [kmAnnuel, setKmAnnuel] = useState(10000);
  const [cvFiscaux, setCvFiscaux] = useState('6');
  const [loyerPercu, setLoyerPercu] = useState(350);
  const [activeCharges, setActiveCharges] = useState(['compta', 'mutuelle', 'assurance', 'repas', 'tel']);
  const [sectionsActive, setSectionsActive] = useState({ vehicule: true, loyer: true });
  const [portageComm, setPortageComm] = useState(5);
  const [chargeAmounts, setChargeAmounts] = useState<Record<string, number>>(
    () =>
      CHARGES_CATALOG.reduce((acc, c) => {
        acc[c.id] = c.amount;
        return acc;
      }, {} as Record<string, number>)
  );

  // Fonctions de calcul brutes (Recopiées de ton script)
  const getIK = (km: number, cv: string) => {
    const b = { '6': { a: 0.665, b: 0.386, c: 0.455 }, '7': { a: 0.697, b: 0.415, c: 0.486 } };
    const r = b[cv as keyof typeof b] || b['6'];
    return (km <= 5000) ? km * r.a : (km <= 20000) ? (km * r.b) + 1500 : km * r.c;
  };

  const calculateIR = (base: number, p: number) => {
    let b = (base * 0.9) / p; let r = 0;
    if (b > 177106) { r += (b - 177106) * 0.45; b = 177106; }
    else if (b > 82341) { r += (b - 82341) * 0.41; b = 82341; }
    else if (b > 28797) { r += (b - 28797) * 0.30; b = 28797; }
    else if (b > 11294) { r += (b - 11294) * 0.11; }
    return r * p;
  };

  const resultats = useMemo(() => {
    const ca = tjm * days;
    const ik = sectionsActive.vehicule ? getIK(kmAnnuel, cvFiscaux) : 0;
    const loyerA = sectionsActive.loyer ? loyerPercu * 12 : 0;
    let cf = 0; 
    CHARGES_CATALOG.forEach(c => {
      if (activeCharges.includes(c.id)) {
        const monthly = chargeAmounts[c.id] ?? c.amount;
        cf += monthly * 12;
      }
    });

    const regimes = [
      { id: 'Portage', class: 'portage', mental: 0, safety: 'Haut' },
      { id: 'Micro', class: 'micro', mental: 1, safety: 'Moyen' },
      { id: 'EURL IR', class: 'eurl-ir', mental: 4, safety: 'Pro' },
      { id: 'EURL IS', class: 'eurl-is', mental: 4, safety: 'Pro' },
      { id: 'SASU', class: 'sasu', mental: 5, safety: 'Dirigeant' }
    ].map(r => {
      let res: any = { ...r, ca, fees: 0, cotis: 0, ir: 0, beforeTax: 0, l: 0 };
      
      if(r.id === 'Micro') {
        res.cotis = ca * 0.211; 
        res.beforeTax = ca - res.cotis;
        res.ir = calculateIR(ca * 0.66, taxParts); // Simp. BNC
      } else if(r.id === 'Portage') {
        const comm = ca * (portageComm/100);
        res.fees = cf + ik;
        const b = ca - comm - res.fees;
        res.cotis = b * 0.45;
        res.beforeTax = b - res.cotis;
        res.l = loyerA;
        res.ir = calculateIR(res.beforeTax + loyerA, taxParts);
      } else if(r.id === 'EURL IR') {
        res.fees = cf + ik;
        const b = ca - res.fees;
        res.cotis = b * 0.40;
        res.beforeTax = b - res.cotis;
        res.l = loyerA;
        res.ir = calculateIR(res.beforeTax + loyerA, taxParts);
      } else if(r.id === 'EURL IS') {
        res.fees = cf + ik;
        res.beforeTax = (ca - res.fees) / 1.45;
        res.cotis = res.beforeTax * 0.45;
        res.l = loyerA;
        res.ir = calculateIR(res.beforeTax + loyerA, taxParts);
      } else { // SASU
        res.fees = cf + ik;
        const b = ca - res.fees;
        const is = b * 0.20;
        res.beforeTax = b - is;
        res.ir = res.beforeTax * 0.30;
        res.l = loyerA;
      }
      res.net = res.beforeTax + res.l - res.ir;
      return res;
    });

    return regimes;
  }, [tjm, days, taxParts, kmAnnuel, cvFiscaux, loyerPercu, activeCharges, sectionsActive, portageComm, chargeAmounts]);

  return {
    state: { tjm, days, taxParts, kmAnnuel, cvFiscaux, loyerPercu, activeCharges, sectionsActive, portageComm, chargeAmounts },
    setters: { setTjm, setDays, setTaxParts, setKmAnnuel, setCvFiscaux, setLoyerPercu, setActiveCharges, setSectionsActive, setPortageComm, setChargeAmounts },
    resultats
  };
};