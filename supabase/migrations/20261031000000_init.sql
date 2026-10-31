-- Helibol website data (plan §2 Data). RLS is ON with no policies:
-- anon/authenticated clients can do nothing; the server writes with the service-role key.

create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  reference     text not null unique,
  source        text not null check (source in ('heli', 'contact')),
  conversation_id uuid,
  name          text not null,
  phone         text,
  email         text,
  company       text,
  service       text not null,
  date          text,
  route         text,
  pax_or_cargo  text,
  language      text not null check (language in ('es', 'en')),
  notes         text,
  status        text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost')),
  created_at    timestamptz not null default now()
);

create table if not exists public.quote_requests (
  id            uuid primary key default gen_random_uuid(),
  reference     text not null unique,
  mission_type  text not null,
  date_start    text not null,
  date_end      text,
  flexibility   text not null check (flexibility in ('exact', 'days', 'flexible')),
  origin        text not null,
  destination   text,
  pax           integer,
  cargo_kg      numeric,
  notes         text,
  name          text not null,
  company       text,
  email         text,
  phone         text,
  language      text not null check (language in ('es', 'en')),
  status        text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost')),
  created_at    timestamptz not null default now()
);

create table if not exists public.heli_conversations (
  id             uuid primary key,
  locale         text not null,
  topic          text,
  model          text,
  messages       jsonb not null default '[]'::jsonb,
  turns          integer not null default 0,
  lead_reference text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists quote_requests_created_at_idx on public.quote_requests (created_at desc);
create index if not exists heli_conversations_updated_at_idx on public.heli_conversations (updated_at);

alter table public.leads enable row level security;
alter table public.quote_requests enable row level security;
alter table public.heli_conversations enable row level security;

-- 90-day retention for Heli transcripts (stated in the privacy policy).
-- Schedule with pg_cron if available:  select cron.schedule('heli-retention', '0 4 * * *', $$select public.purge_old_heli_conversations()$$);
create or replace function public.purge_old_heli_conversations() returns void
language sql security definer set search_path = public as $$
  delete from public.heli_conversations where updated_at < now() - interval '90 days';
$$;
revoke all on function public.purge_old_heli_conversations() from public, anon, authenticated;
