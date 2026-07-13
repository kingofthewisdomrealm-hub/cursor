-- ClaimPilot AI Database Schema

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text default 'adjuster',
  created_at timestamptz default now() not null
);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  homeowner_name text not null,
  homeowner_phone text,
  homeowner_email text,
  property_address text not null,
  city text,
  state text,
  zip text,
  lat double precision,
  lng double precision,
  carrier text,
  claim_number text,
  date_of_loss date,
  current_value numeric default 0,
  potential_supplement_value numeric default 0,
  status text default 'new_loss',
  assigned_to uuid,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.claim_files (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references public.claims(id) on delete cascade not null,
  name text not null,
  category text not null,
  size bigint default 0,
  storage_path text,
  uploaded_at timestamptz default now() not null
);

create table if not exists public.supplement_opportunities (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references public.claims(id) on delete cascade not null,
  line_item text not null,
  reason text,
  category text,
  estimated_value numeric default 0,
  confidence integer default 0,
  status text default 'pending',
  code_reference text,
  created_at timestamptz default now() not null
);

create table if not exists public.negotiation_entries (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references public.claims(id) on delete cascade not null,
  date date not null,
  type text not null,
  amount numeric default 0,
  description text,
  created_at timestamptz default now() not null
);

create index if not exists idx_claims_user_id on public.claims(user_id);
create index if not exists idx_claims_status on public.claims(status);
create index if not exists idx_claim_files_claim_id on public.claim_files(claim_id);
create index if not exists idx_supplements_claim_id on public.supplement_opportunities(claim_id);

alter table public.users enable row level security;
alter table public.claims enable row level security;
alter table public.claim_files enable row level security;
alter table public.supplement_opportunities enable row level security;
alter table public.negotiation_entries enable row level security;

create policy "Anyone can manage claims demo" on public.claims for all using (true);
create policy "Anyone can manage files demo" on public.claim_files for all using (true);
create policy "Anyone can manage supplements demo" on public.supplement_opportunities for all using (true);
create policy "Anyone can manage negotiations demo" on public.negotiation_entries for all using (true);
