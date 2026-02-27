-- ============================================================
-- FREECALCUL — Schéma Supabase
-- Coller ce script dans : Supabase Dashboard > SQL Editor > New query
-- ============================================================


-- 1. TABLE : Profils utilisateurs
-- (lié automatiquement à auth.users via trigger)
create table public.user_profiles (
  id        uuid references auth.users(id) on delete cascade primary key,
  prenom    text,
  nom       text,
  created_at timestamptz default now()
);

-- 2. TABLE : Paramètres de simulation (un set par utilisateur)
create table public.simulation_settings (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users(id) on delete cascade unique not null,
  tjm             integer         default 600,
  days            integer         default 210,
  tax_parts       integer         default 1,
  km_annuel       integer         default 10000,
  cv_fiscaux      text            default '6',
  loyer_percu     integer         default 350,
  portage_comm    decimal(5,2)    default 5,
  active_charges  text[]          default array['compta','mutuelle','assurance','repas','tel'],
  charge_amounts  jsonb           default '{"compta":160,"mutuelle":140,"assurance":45,"repas":190,"tel":90}',
  sections_active jsonb           default '{"vehicule":true,"loyer":true}',
  updated_at      timestamptz     default now()
);

-- 3. TABLE : Abonnements
create table public.subscriptions (
  id                    uuid default gen_random_uuid() primary key,
  user_id               uuid references auth.users(id) on delete cascade unique not null,
  plan                  text        default 'decouverte', -- 'decouverte' | 'pro' | 'expert'
  status                text        default 'active',     -- 'active' | 'cancelled' | 'past_due'
  stripe_customer_id    text,
  stripe_subscription_id text,
  current_period_end    timestamptz,
  created_at            timestamptz default now()
);


-- ============================================================
-- SÉCURITÉ : Row Level Security (les users ne voient que leurs données)
-- ============================================================

alter table public.user_profiles     enable row level security;
alter table public.simulation_settings enable row level security;
alter table public.subscriptions      enable row level security;

-- user_profiles
create policy "Voir son profil"      on public.user_profiles for select using (auth.uid() = id);
create policy "Modifier son profil"  on public.user_profiles for update using (auth.uid() = id);

-- simulation_settings
create policy "Voir ses settings"    on public.simulation_settings for select using (auth.uid() = user_id);
create policy "Créer ses settings"   on public.simulation_settings for insert with check (auth.uid() = user_id);
create policy "Modifier ses settings" on public.simulation_settings for update using (auth.uid() = user_id);

-- subscriptions
create policy "Voir son abonnement"  on public.subscriptions for select using (auth.uid() = user_id);


-- ============================================================
-- TRIGGER : Créer automatiquement profil + settings + abonnement
--           dès qu'un utilisateur s'inscrit
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Profil
  insert into public.user_profiles (id, prenom, nom)
  values (
    new.id,
    new.raw_user_meta_data->>'prenom',
    new.raw_user_meta_data->>'nom'
  );

  -- Settings (valeurs par défaut)
  insert into public.simulation_settings (user_id)
  values (new.id);

  -- Abonnement (plan gratuit par défaut)
  insert into public.subscriptions (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
