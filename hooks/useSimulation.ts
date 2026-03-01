import { useState, useMemo, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CHARGES_CATALOG } from '@/lib/constants';
import { calculateRegimes, computeTaxParts, type CitySize } from '@/lib/projections';

export { CHARGES_CATALOG };

export const useSimulation = () => {
  // --- Paramètres de production ---
  const [tjm, setTjm] = useState(600);
  const [days, setDays] = useState(210);

  // --- Paramètres foyer & fiscalité ---
  const [nbAdultes, setNbAdultes] = useState<1 | 2>(1);
  const [nbEnfants, setNbEnfants] = useState(0);
  const [spouseIncome, setSpouseIncome] = useState(0);

  // --- Paramètres optimisations ---
  const [kmAnnuel, setKmAnnuel] = useState(10000);
  const [cvFiscaux, setCvFiscaux] = useState('6');
  const [loyerPercu, setLoyerPercu] = useState(350);
  const [sectionsActive, setSectionsActive] = useState({ vehicule: true, loyer: true });

  // --- Charges ---
  const [activeCharges, setActiveCharges] = useState(['compta', 'mutuelle', 'assurance', 'repas', 'tel']);
  const [chargeAmounts, setChargeAmounts] = useState<Record<string, number>>(
    () => CHARGES_CATALOG.reduce((acc, c) => { acc[c.id] = c.amount; return acc; }, {} as Record<string, number>)
  );

  // --- Portage ---
  const [portageComm, setPortageComm] = useState(5);

  // --- Paramètres projection ---
  const [acreEnabled, setAcreEnabled] = useState(true);
  const [citySize, setCitySize] = useState<CitySize>('moyenne');
  const [growthRate, setGrowthRate] = useState(15); // en %

  // --- Auth + sync Supabase ---
  const [userId, setUserId] = useState<string | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const hasSavedOnce = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Parts calculées automatiquement
  const taxParts = useMemo(
    () => computeTaxParts(nbAdultes, nbEnfants),
    [nbAdultes, nbEnfants]
  );

  // Charger les settings depuis Supabase au montage
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) { setSettingsLoaded(true); return; }

      setUserId(user.id);

      const { data } = await supabase
        .from('simulation_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        if (data.tjm != null)           setTjm(data.tjm);
        if (data.days != null)          setDays(data.days);
        if (data.nb_adultes != null)    setNbAdultes(data.nb_adultes);
        if (data.nb_enfants != null)    setNbEnfants(data.nb_enfants);
        if (data.spouse_income != null) setSpouseIncome(data.spouse_income);
        if (data.km_annuel != null)     setKmAnnuel(data.km_annuel);
        if (data.cv_fiscaux != null)    setCvFiscaux(data.cv_fiscaux);
        if (data.loyer_percu != null)   setLoyerPercu(data.loyer_percu);
        if (data.portage_comm != null)  setPortageComm(parseFloat(data.portage_comm));
        if (data.active_charges)        setActiveCharges(data.active_charges);
        if (data.charge_amounts)        setChargeAmounts(data.charge_amounts);
        if (data.sections_active)       setSectionsActive(data.sections_active);
        if (data.acre_enabled != null)  setAcreEnabled(data.acre_enabled);
        if (data.city_size != null)     setCitySize(data.city_size as CitySize);
        if (data.growth_rate != null)   setGrowthRate(data.growth_rate);
        // Rétro-compat : si les nouvelles colonnes n'existent pas encore,
        // on mappe l'ancien tax_parts vers nbAdultes
        if (data.nb_adultes == null && data.tax_parts != null) {
          setNbAdultes(data.tax_parts >= 2 ? 2 : 1);
        }
      }

      setSettingsLoaded(true);
    };
    load();
  }, []);

  // Sauvegarder automatiquement (debounce 1.2s)
  useEffect(() => {
    if (!settingsLoaded || !userId) return;
    if (!hasSavedOnce.current) { hasSavedOnce.current = true; return; }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      const supabase = createClient();
      await supabase.from('simulation_settings').upsert({
        user_id: userId,
        tjm, days,
        nb_adultes: nbAdultes,
        nb_enfants: nbEnfants,
        spouse_income: spouseIncome,
        km_annuel: kmAnnuel,
        cv_fiscaux: cvFiscaux,
        loyer_percu: loyerPercu,
        portage_comm: portageComm,
        active_charges: activeCharges,
        charge_amounts: chargeAmounts,
        sections_active: sectionsActive,
        acre_enabled: acreEnabled,
        city_size: citySize,
        growth_rate: growthRate,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }, 1200);

    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tjm, days, nbAdultes, nbEnfants, spouseIncome, kmAnnuel, cvFiscaux, loyerPercu,
      portageComm, activeCharges, chargeAmounts, sectionsActive, acreEnabled, citySize,
      growthRate, settingsLoaded, userId]);

  // Calcul des résultats (Année 1, avec ACRE si activé)
  const resultats = useMemo(() => calculateRegimes({
    tjm, days, taxParts, spouseIncome,
    kmAnnuel, cvFiscaux, loyerPercu,
    activeCharges, sectionsActive, portageComm, chargeAmounts,
    acreEnabled, citySize,
    growthRate: growthRate / 100,
    annee: 1,
  }), [
    tjm, days, taxParts, spouseIncome,
    kmAnnuel, cvFiscaux, loyerPercu,
    activeCharges, sectionsActive, portageComm, chargeAmounts,
    acreEnabled, citySize, growthRate,
  ]);

  return {
    state: {
      tjm, days, taxParts, nbAdultes, nbEnfants, spouseIncome,
      kmAnnuel, cvFiscaux, loyerPercu, activeCharges, sectionsActive,
      portageComm, chargeAmounts, userId,
      acreEnabled, citySize, growthRate,
    },
    setters: {
      setTjm, setDays, setNbAdultes, setNbEnfants, setSpouseIncome,
      setKmAnnuel, setCvFiscaux, setLoyerPercu, setActiveCharges,
      setSectionsActive, setPortageComm, setChargeAmounts,
      setAcreEnabled, setCitySize, setGrowthRate,
    },
    resultats,
    isLoading: !settingsLoaded,
  };
};
