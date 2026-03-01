-- Migration V2 : Ajout des champs foyer, CFE, ACRE, projection
-- À exécuter dans l'éditeur SQL de votre projet Supabase

ALTER TABLE public.simulation_settings
  ADD COLUMN IF NOT EXISTS nb_adultes   integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS nb_enfants   integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS spouse_income integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS acre_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS city_size    text    NOT NULL DEFAULT 'moyenne',
  ADD COLUMN IF NOT EXISTS growth_rate  integer NOT NULL DEFAULT 15;

-- Commentaires descriptifs
COMMENT ON COLUMN public.simulation_settings.nb_adultes    IS '1 = célibataire, 2 = couple';
COMMENT ON COLUMN public.simulation_settings.nb_enfants    IS 'Nombre d''enfants à charge';
COMMENT ON COLUMN public.simulation_settings.spouse_income IS 'Revenus nets annuels du conjoint (€)';
COMMENT ON COLUMN public.simulation_settings.acre_enabled  IS 'ACRE activée (cotisations -50% an 1)';
COMMENT ON COLUMN public.simulation_settings.city_size     IS 'petite | moyenne | grande (estimation CFE)';
COMMENT ON COLUMN public.simulation_settings.growth_rate   IS 'Taux de croissance CA en % (ex: 15 = 15%)';

-- Mise à jour du trigger pour inclure les nouvelles colonnes avec valeurs par défaut
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, prenom, nom)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'nom', '')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.simulation_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'decouverte', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;
