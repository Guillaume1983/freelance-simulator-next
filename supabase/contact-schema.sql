-- ============================================================
-- Table pour les messages de contact
-- Coller dans : Supabase Dashboard > SQL Editor > New query
-- ============================================================

create table public.contact_messages (
  id         uuid default gen_random_uuid() primary key,
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  user_id    uuid references auth.users(id) on delete set null, -- null si visiteur anonyme
  created_at timestamptz default now()
);

-- Sécurité
alter table public.contact_messages enable row level security;

-- Tout le monde peut envoyer un message (connecté ou non)
create policy "Anyone can send a contact message"
  on public.contact_messages for insert with check (true);

-- Les messages ne sont lisibles que via le service role (dashboard Supabase)
create policy "Messages not readable via client"
  on public.contact_messages for select using (false);
