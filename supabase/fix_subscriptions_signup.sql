-- À exécuter dans Supabase → SQL Editor si l’inscription renvoie
-- « Database error saving new user » alors que handle_new_user() insère dans subscriptions.
--
-- Crée la table manquante + RLS (sans toucher aux utilisateurs existants).

create table if not exists public.subscriptions (
  user_id    uuid        references auth.users(id) on delete cascade primary key,
  plan       text        not null default 'decouverte',
  status     text        not null default 'active',
  created_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "Voir son abonnement" on public.subscriptions;
create policy "Voir son abonnement"
  on public.subscriptions for select
  using (auth.uid() = user_id);
