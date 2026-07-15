-- Dosha Yoga schema
-- Optional: enable when Supabase credentials are configured.
-- Demo mode uses localStorage without requiring these tables.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Guest',
  email text unique,
  experience_level text not null default 'beginner',
  primary_dosha text,
  secondary_dosha text,
  vata_percentage integer not null default 0,
  pitta_percentage integer not null default 0,
  kapha_percentage integer not null default 0,
  physical_limitations text[] not null default '{}',
  preferred_routine_length integer not null default 20,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  question_id text not null,
  selected_answer text not null,
  dosha_type text not null,
  points integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  date date not null,
  sleep_score integer not null check (sleep_score between 1 and 10),
  energy_score integer not null check (energy_score between 1 and 10),
  stress_score integer not null check (stress_score between 1 and 10),
  mood text not null,
  body_condition text not null,
  desired_outcome text not null,
  available_minutes integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.yoga_routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  duration integer not null,
  difficulty text not null,
  target_dosha text not null,
  target_outcome text not null,
  focus text,
  poses jsonb not null default '[]',
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.practice_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  routine_id uuid references public.yoga_routines(id) on delete set null,
  routine_title text,
  mood_before text not null,
  mood_after text not null,
  energy_before integer not null,
  energy_after integer not null,
  stress_before integer not null,
  stress_after integer not null,
  difficulty_rating text not null,
  would_repeat boolean not null default true,
  duration_minutes integer not null,
  completed_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.daily_check_ins enable row level security;
alter table public.yoga_routines enable row level security;
alter table public.practice_results enable row level security;
