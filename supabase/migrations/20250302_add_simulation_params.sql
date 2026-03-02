-- Migration pour ajouter les nouveaux paramètres de simulation
-- Exécuter si la table simulation_settings existe déjà

ALTER TABLE public.simulation_settings
  ADD COLUMN IF NOT EXISTS materiel_annuel integer default 0,
  ADD COLUMN IF NOT EXISTS avantages_optimises integer default 1500,
  ADD COLUMN IF NOT EXISTS type_activite_micro text default 'BNC',
  ADD COLUMN IF NOT EXISTS prelevement_liberatoire boolean default false,
  ADD COLUMN IF NOT EXISTS remuneration_dirigeant decimal(5,2) default 1,
  ADD COLUMN IF NOT EXISTS repartition_remuneration integer default 70;
