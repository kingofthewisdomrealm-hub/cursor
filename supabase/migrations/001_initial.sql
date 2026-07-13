-- Outcome Agent Database Schema

-- Users table (extends Supabase auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Missions
create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  outcome_text text not null,
  mission_title text,
  mission_summary text,
  target integer,
  current_progress integer default 0,
  deadline date,
  strategy text,
  required_resources jsonb default '[]'::jsonb,
  assumptions jsonb default '[]'::jsonb,
  success_metrics jsonb default '[]'::jsonb,
  approval_required jsonb default '[]'::jsonb,
  status text default 'draft' check (status in ('draft', 'clarifying', 'planning', 'active', 'completed', 'paused')),
  current_stage_id uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Mission clarification questions
create table if not exists public.mission_questions (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references public.missions(id) on delete cascade not null,
  question text not null,
  answer text,
  sort_order integer default 0,
  required boolean default true,
  created_at timestamptz default now() not null
);

-- Mission stages
create table if not exists public.mission_stages (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references public.missions(id) on delete cascade not null,
  title text not null,
  description text,
  sort_order integer default 0,
  status text default 'pending' check (status in ('pending', 'active', 'completed')),
  created_at timestamptz default now() not null
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references public.missions(id) on delete cascade not null,
  stage_id uuid references public.mission_stages(id) on delete set null,
  title text not null,
  description text,
  reason text,
  instructions text,
  suggested_content text,
  expected_result text,
  estimated_impact text,
  status text default 'not_started' check (status in (
    'not_started', 'ready', 'in_progress', 'waiting_for_approval', 'completed', 'blocked', 'skipped'
  )),
  approval_required boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Task results (learning loop)
create table if not exists public.task_results (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade not null,
  mission_id uuid references public.missions(id) on delete cascade not null,
  responses_count integer default 0,
  yes_count integer default 0,
  registrations_count integer default 0,
  top_objection text,
  notes text,
  created_at timestamptz default now() not null
);

-- Agent recommendations
create table if not exists public.agent_recommendations (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references public.missions(id) on delete cascade not null,
  recommendation_type text default 'strategy' check (recommendation_type in (
    'strategy', 'next_action', 'daily_briefing', 'learning_update'
  )),
  title text not null,
  content text not null,
  priority integer default 0,
  is_active boolean default true,
  created_at timestamptz default now() not null
);

-- Indexes
create index if not exists idx_missions_user_id on public.missions(user_id);
create index if not exists idx_missions_status on public.missions(status);
create index if not exists idx_tasks_mission_id on public.tasks(mission_id);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_mission_stages_mission_id on public.mission_stages(mission_id);
create index if not exists idx_agent_recommendations_mission_id on public.agent_recommendations(mission_id);

-- RLS policies
alter table public.users enable row level security;
alter table public.missions enable row level security;
alter table public.mission_questions enable row level security;
alter table public.mission_stages enable row level security;
alter table public.tasks enable row level security;
alter table public.task_results enable row level security;
alter table public.agent_recommendations enable row level security;

-- Allow anonymous/demo access for MVP (missions without user_id)
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

create policy "Anyone can view missions" on public.missions for select using (true);
create policy "Anyone can insert missions" on public.missions for insert with check (true);
create policy "Anyone can update missions" on public.missions for update using (true);

create policy "Anyone can manage mission_questions" on public.mission_questions for all using (true);
create policy "Anyone can manage mission_stages" on public.mission_stages for all using (true);
create policy "Anyone can manage tasks" on public.tasks for all using (true);
create policy "Anyone can manage task_results" on public.task_results for all using (true);
create policy "Anyone can manage agent_recommendations" on public.agent_recommendations for all using (true);
