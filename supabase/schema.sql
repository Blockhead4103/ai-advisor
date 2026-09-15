create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  company text,
  email text,
  landscape text not null,
  data_maturity text not null,
  ai_ambition text not null,
  answers jsonb not null,
  scorecard jsonb not null,
  readiness_score integer not null check (readiness_score between 0 and 100)
);

alter table public.leads enable row level security;

-- Server-side inserts use the service role key and bypass RLS.
-- Optional: allow authenticated inserts later without opening the table publicly.
create policy "service inserts only"
  on public.leads
  for insert
  to service_role
  with check (true);
