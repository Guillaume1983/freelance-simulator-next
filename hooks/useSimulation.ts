import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CHARGES_CATALOG } from '@/lib/constants';
import { calculateRegimes, computeTaxParts, type CitySize } from '@/lib/projections';

export { CHARGES_CATALOG };
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

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
  const [growthRate, setGrowthRate] = useState(2);

  // --- Auth + sync Supabase ---
  const [userId, setUserId] = useState<string | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Refs internes
  const saveTimeoutRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTimeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  // readyToSave passe à true uniquement après que les settings ont été chargés
  // depuis Supabase, pour éviter d'écraser les données pendant le chargement.
  const readyToSaveRef    = useRef(false);
  const trackedUserIdRef  = useRef<string | null>(null);

  const taxParts = useMemo(
    () => computeTaxParts(nbAdultes, nbEnfants),
    [nbAdultes, nbEnfants]
  );

  // Charge les settings depuis Supabase pour un userId donné
  const loadSettings = useCallback(async (uid: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('simulation_settings')
      .select('*')
      .eq('user_id', uid)
      .single();

    // PGRST116 = aucune ligne trouvée (premier usage) — pas une vraie erreur
    if (error && error.code !== 'PGRST116') {
      console.warn('[useSimulation] load error:', error.code, error.message);
    }

    if (data) {
      if (data.tjm           != null) setTjm(data.tjm);
      if (data.days          != null) setDays(data.days);
      if (data.nb_adultes    != null) setNbAdultes(data.nb_adultes);
      if (data.nb_enfants    != null) setNbEnfants(data.nb_enfants);
      if (data.spouse_income != null) setSpouseIncome(data.spouse_income);
      if (data.km_annuel     != null) setKmAnnuel(data.km_annuel);
      if (data.cv_fiscaux    != null) setCvFiscaux(data.cv_fiscaux);
      if (data.loyer_percu   != null) setLoyerPercu(data.loyer_percu);
      if (data.portage_comm  != null) setPortageComm(parseFloat(data.portage_comm));
      if (data.active_charges)        setActiveCharges(data.active_charges);
      if (data.charge_amounts)        setChargeAmounts(data.charge_amounts);
      if (data.sections_active)       setSectionsActive(data.sections_active);
      if (data.acre_enabled  != null) setAcreEnabled(data.acre_enabled);
      if (data.city_size     != null) setCitySize(data.city_size as CitySize);
      if (data.growth_rate   != null) setGrowthRate(data.growth_rate);
      // Rétro-compat
      if (data.nb_adultes == null && data.tax_parts != null) {
        setNbAdultes(data.tax_parts >= 2 ? 2 : 1);
      }
    }

    setSettingsLoaded(true);
    // Autoriser les saves 100 ms après le chargement pour laisser React finir
    // d'appliquer tous les setState ci-dessus avant d'ouvrir la fenêtre de save.
    setTimeout(() => { readyToSaveRef.current = true; }, 100);
  }, []);

  // ── Écouter les changements d'auth (plus fiable que getUser() unique) ──
  // onAuthStateChange gère le refresh automatique des tokens expirés,
  // ce qui règle le problème de déconnexion silencieuse sur mobile.
  useEffect(() => {
    const supabase = createClient();

    const handleAuth = async (uid: string | null) => {
      // Dédupliquer (onAuthStateChange peut émettre le même état plusieurs fois)
      if (uid === trackedUserIdRef.current) return;
      trackedUserIdRef.current = uid;

      readyToSaveRef.current = false; // Bloquer les saves pendant le chargement
      setUserId(uid);

      if (uid) {
        setSettingsLoaded(false);
        await loadSettings(uid);
      } else {
        // Non connecté — afficher les valeurs par défaut sans bloquer l'UI
        setSettingsLoaded(true);
      }
    };

    // Listener continu : catch les refreshes de token et les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => { handleAuth(session?.user?.id ?? null); }
    );

    // Check initial (en plus du listener pour le premier rendu)
    supabase.auth.getUser().then(({ data: { user } }) => {
      handleAuth(user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, [loadSettings]);

  // ── Sauvegarder automatiquement (debounce 1 s) ──
  useEffect(() => {
    // Ne pas sauvegarder si les settings ne sont pas encore chargés
    if (!readyToSaveRef.current || !userId) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      // Vérifier une dernière fois (l'userId peut avoir changé pendant le délai)
      if (!readyToSaveRef.current || !userId) return;

      setSaveStatus('saving');
      const supabase = createClient();
      const { error } = await supabase.from('simulation_settings').upsert({
        user_id: userId,
        tjm, days,
        nb_adultes:     nbAdultes,
        nb_enfants:     nbEnfants,
        spouse_income:  spouseIncome,
        km_annuel:      kmAnnuel,
        cv_fiscaux:     cvFiscaux,
        loyer_percu:    loyerPercu,
        portage_comm:   portageComm,
        active_charges: activeCharges,
        charge_amounts: chargeAmounts,
        sections_active:sectionsActive,
        acre_enabled:   acreEnabled,
        city_size:      citySize,
        growth_rate:    growthRate,
        updated_at:     new Date().toISOString(),
      }, { onConflict: 'user_id' });

      if (error) {
        console.error('[useSimulation] save error:', error.code, error.message, error.details);
        setSaveStatus('error');
        if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
        statusTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 4000);
      } else {
        setSaveStatus('saved');
        if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
        statusTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 2500);
      }
    }, 1000);

    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tjm, days, nbAdultes, nbEnfants, spouseIncome, kmAnnuel, cvFiscaux, loyerPercu,
      portageComm, activeCharges, chargeAmounts, sectionsActive, acreEnabled, citySize,
      growthRate, userId]);

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
    saveStatus,
  };
};
