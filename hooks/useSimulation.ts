import { useState, useMemo, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

// Constantes brutes extraites de ton HTML
export const CHARGES_CATALOG = [
  { id: 'compta', name: 'Expert-Comptable', amount: 160 },
  { id: 'mutuelle', name: 'Protection Sociale', amount: 140 },
  { id: 'assurance', name: 'Responsabilité Civile', amount: 45 },
  { id: 'repas', name: 'Déjeuners Pro', amount: 190 },
  { id: 'tel', name: 'Tech & Mobilité', amount: 90 }
];

export const useSimulation = () => {
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

  // Auth + sync Supabase
  const [userId, setUserId] = useState<string | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const hasSavedOnce = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Charger les settings depuis Supabase au montage
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setSettingsLoaded(true);
        return;
      }

      setUserId(user.id);

      const { data } = await supabase
        .from('simulation_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        if (data.tjm != null)          setTjm(data.tjm);
        if (data.days != null)         setDays(data.days);
        if (data.tax_parts != null)    setTaxParts(data.tax_parts);
        if (data.km_annuel != null)    setKmAnnuel(data.km_annuel);
        if (data.cv_fiscaux != null)   setCvFiscaux(data.cv_fiscaux);
        if (data.loyer_percu != null)  setLoyerPercu(data.loyer_percu);
        if (data.portage_comm != null) setPortageComm(parseFloat(data.portage_comm));
        if (data.active_charges)       setActiveCharges(data.active_charges);
        if (data.charge_amounts)       setChargeAmounts(data.charge_amounts);
        if (data.sections_active)      setSectionsActive(data.sections_active);
      }

      setSettingsLoaded(true);
    };
    load();
  }, []);

  // Sauvegarder automatiquement (debounce 1.2s) dès qu'un paramètre change
  useEffect(() => {
    if (!settingsLoaded || !userId) return;

    // Ignorer la première exécution après le chargement initial
    if (!hasSavedOnce.current) {
      hasSavedOnce.current = true;
      return;
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      const supabase = createClient();
      await supabase.from('simulation_settings').upsert({
        user_id: userId,
        tjm, days,
        tax_parts: taxParts,
        km_annuel: kmAnnuel,
        cv_fiscaux: cvFiscaux,
        loyer_percu: loyerPercu,
        portage_comm: portageComm,
        active_charges: activeCharges,
        charge_amounts: chargeAmounts,
        sections_active: sectionsActive,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }, 1200);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tjm, days, taxParts, kmAnnuel, cvFiscaux, loyerPercu, portageComm, activeCharges, chargeAmounts, sectionsActive, settingsLoaded, userId]);

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
    state: { tjm, days, taxParts, kmAnnuel, cvFiscaux, loyerPercu, activeCharges, sectionsActive, portageComm, chargeAmounts, userId },
    setters: { setTjm, setDays, setTaxParts, setKmAnnuel, setCvFiscaux, setLoyerPercu, setActiveCharges, setSectionsActive, setPortageComm, setChargeAmounts },
    resultats,
    isLoading: !settingsLoaded,
  };
};