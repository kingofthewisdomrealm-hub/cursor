-- Storm Opportunity Agent schema
-- Optional: enable when Supabase credentials are configured.
-- Demo mode uses browser localStorage so the app works without a backend.

create extension if not exists "pgcrypto";

create table if not exists public.storm_reports (
  id text primary key,
  type text not null check (type in ('hail', 'wind', 'tornado', 'severe_thunderstorm', 'hurricane')),
  report_date date not null,
  report_time text not null,
  city text not null,
  zip_code text not null,
  wind_speed_mph numeric,
  hail_size_inches numeric,
  lat double precision not null,
  lng double precision not null,
  source text not null,
  source_url text,
  confidence text not null,
  confidence_score integer not null,
  severity integer not null,
  report_count integer not null default 1,
  residential_density integer not null,
  estimated_property_age integer not null,
  description text,
  county text,
  opportunity_score integer,
  raw jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

create table if not exists public.saved_opportunities (
  id uuid primary key default gen_random_uuid(),
  storm_id text references public.storm_reports(id) on delete set null,
  status text not null default 'new'
    check (status in (
      'new',
      'researching',
      'ready_to_canvass',
      'currently_canvassing',
      'completed',
      'rejected'
    )),
  notes text default '',
  route_url text,
  territories jsonb default '[]'::jsonb,
  storm_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.agent_activity (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz default now() not null,
  entry_type text not null check (entry_type in (
    'scan_start',
    'website_checked',
    'report_found',
    'opportunity_created',
    'error',
    'scan_complete'
  )),
  message text not null,
  source text,
  details text
);

create table if not exists public.scan_runs (
  id uuid primary key default gen_random_uuid(),
  scanned_at timestamptz default now() not null,
  websites_checked integer default 0,
  reports_found integer default 0,
  opportunities_created integer default 0,
  errors integer default 0,
  payload jsonb default '{}'::jsonb
);

create index if not exists storm_reports_date_idx on public.storm_reports (report_date desc);
create index if not exists saved_opportunities_status_idx on public.saved_opportunities (status);
create index if not exists agent_activity_time_idx on public.agent_activity (occurred_at desc);
