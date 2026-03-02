-- ============================================================
-- FREELANCE SIMULATEUR — Schéma Supabase (installation from scratch)
-- Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 0. NETTOYAGE (supprime trigger, fonction et tables existantes)
-- ────────────────────────────────────────────────────────────

drop trigger  if exists on_auth_user_created    on auth.users;
drop function if exists public.handle_new_user  cascade;

drop table if exists public.contact_messages    cascade;
drop table if exists public.subscriptions       cascade;
drop table if exists public.simulation_settings cascade;
drop table if exists public.user_profiles       cascade;


-- ────────────────────────────────────────────────────────────
-- 1. TABLES
-- ────────────────────────────────────────────────────────────

-- Profils utilisateurs
create table public.user_profiles (
  id          uuid        references auth.users(id) on delete cascade primary key,
  prenom      text,
  nom         text,
  created_at  timestamptz default now()
);

-- Paramètres de simulation (1 ligne par utilisateur)
create table public.simulation_settings (
  id               uuid         default gen_random_uuid() primary key,
  user_id          uuid         references auth.users(id) on delete cascade unique not null,

  -- Production
  tjm              integer      default 600,
  days             integer      default 210,

  -- Foyer fiscal
  nb_adultes       integer      not null default 1,   -- 1 = célibataire, 2 = couple
  nb_enfants       integer      not null default 0,
  spouse_income    integer      not null default 0,   -- revenus nets annuels du conjoint (€)
  tax_parts        integer      default 1,            -- rétro-compat, calculé depuis nb_adultes/nb_enfants

  -- Optimisations
  km_annuel        integer      default 10000,
  cv_fiscaux       text         default '6',
  loyer_percu      integer      default 350,
  sections_active  jsonb        default '{"vehicule": true, "loyer": true}',

  -- Charges
  portage_comm     decimal(5,2) default 5,
  active_charges   text[]       default array['compta','mutuelle','assurance','repas','tel'],
  charge_amounts   jsonb        default '{"compta":160,"mutuelle":140,"assurance":45,"repas":190,"tel":90}',

  -- Projection
  acre_enabled     boolean      not null default true,
  city_size        text         not null default 'moyenne',  -- petite | moyenne | grande
  growth_rate      integer      not null default 2,           -- taux de croissance CA en %

  -- Méta
  updated_at       timestamptz  default now()
);

-- Abonnements
create table public.subscriptions (
  id                      uuid        default gen_random_uuid() primary key,
  user_id                 uuid        references auth.users(id) on delete cascade unique not null,
  plan                    text        not null default 'decouverte', -- 'decouverte' | 'pro' | 'expert'
  status                  text        not null default 'active',    -- 'active' | 'cancelled' | 'past_due'
  stripe_customer_id      text,
  stripe_subscription_id  text,
  current_period_end      timestamptz,
  created_at              timestamptz default now()
);

-- Messages de contact
create table public.contact_messages (
  id          uuid        default gen_random_uuid() primary key,
  name        text        not null,
  email       text        not null,
  subject     text,
  message     text        not null,
  user_id     uuid        references auth.users(id) on delete set null, -- null si visiteur anonyme
  created_at  timestamptz default now()
);


-- ────────────────────────────────────────────────────────────
-- 2. ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

alter table public.user_profiles       enable row level security;
alter table public.simulation_settings enable row level security;
alter table public.subscriptions       enable row level security;
alter table public.contact_messages    enable row level security;

-- user_profiles : chaque user ne voit et ne modifie que son propre profil
create policy "Voir son profil"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Modifier son profil"
  on public.user_profiles for update
  using (auth.uid() = id);

-- simulation_settings : lecture, création et modification par le propriétaire uniquement
create policy "Voir ses settings"
  on public.simulation_settings for select
  using (auth.uid() = user_id);

create policy "Créer ses settings"
  on public.simulation_settings for insert
  with check (auth.uid() = user_id);

create policy "Modifier ses settings"
  on public.simulation_settings for update
  using (auth.uid() = user_id);

-- subscriptions : lecture seule par le propriétaire (écriture via service role uniquement)
create policy "Voir son abonnement"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- contact_messages : tout le monde peut envoyer, personne ne peut lire via client
create policy "Envoyer un message"
  on public.contact_messages for insert
  with check (true);

create policy "Messages non lisibles via client"
  on public.contact_messages for select
  using (false);


-- ────────────────────────────────────────────────────────────
-- 3. TRIGGER : création automatique au signup
--    Crée profil + settings + abonnement dès qu'un user s'inscrit.
-- ────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id, prenom, nom)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'prenom', ''),
    coalesce(new.raw_user_meta_data->>'nom', '')
  )
  on conflict (id) do nothing;

  insert into public.simulation_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'decouverte', 'active')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
