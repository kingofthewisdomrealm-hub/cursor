-- AI App Integrations

create table if not exists public.connected_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  app_id text not null,
  name text not null,
  enabled boolean default true,
  connector_type text not null check (connector_type in ('builtin', 'openai', 'webhook', 'mcp')),
  capabilities jsonb default '[]'::jsonb,
  config jsonb default '{}'::jsonb,
  connected_at timestamptz default now() not null
);

create table if not exists public.task_delegations (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references public.missions(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete cascade not null,
  integration_id uuid references public.connected_integrations(id) on delete set null,
  app_id text not null,
  app_name text not null,
  capability text not null,
  status text default 'queued' check (status in (
    'idle', 'queued', 'running', 'awaiting_approval', 'completed', 'failed'
  )),
  request jsonb not null,
  result jsonb,
  created_at timestamptz default now() not null,
  completed_at timestamptz
);

alter table public.tasks add column if not exists suggested_capability text;
alter table public.tasks add column if not exists assigned_integration_id uuid;
alter table public.tasks add column if not exists work_output text;
alter table public.tasks add column if not exists delegation_status text;

create index if not exists idx_connected_integrations_user on public.connected_integrations(user_id);
create index if not exists idx_task_delegations_mission on public.task_delegations(mission_id);
create index if not exists idx_task_delegations_task on public.task_delegations(task_id);

alter table public.connected_integrations enable row level security;
alter table public.task_delegations enable row level security;

create policy "Anyone can manage connected_integrations" on public.connected_integrations for all using (true);
create policy "Anyone can manage task_delegations" on public.task_delegations for all using (true);
