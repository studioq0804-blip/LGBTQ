-- Create table for login OTPs
create table if not exists public.login_otps (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_login_otps_email on public.login_otps (email);
create index if not exists idx_login_otps_expires_at on public.login_otps (expires_at);
create index if not exists idx_login_otps_used on public.login_otps (used);

-- Row level security (optional; allow inserts/selects from anon for demo)
alter table public.login_otps enable row level security;

-- For demo/dev, allow inserting and verifying without auth. Tighten in production.
create policy if not exists "login_otps_insert_anon" on public.login_otps
  for insert to anon
  with check (true);

create policy if not exists "login_otps_select_anon" on public.login_otps
  for select to anon
  using (true);

create policy if not exists "login_otps_update_anon" on public.login_otps
  for update to anon
  using (true)
  with check (true);
