-- StayFlow PMS schema
-- Run in Supabase SQL editor when connecting a live backend.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('owner', 'manager', 'receptionist', 'housekeeping');
create type public.property_type as enum ('hotel', 'hostel', 'airbnb', 'apartment', 'vacation_rental');
create type public.room_status as enum ('available', 'occupied', 'cleaning', 'maintenance', 'out_of_service');
create type public.reservation_status as enum ('confirmed', 'pending', 'checked_in', 'checked_out', 'cancelled');
create type public.hk_task_type as enum ('clean_room', 'inspect_room', 'laundry', 'maintenance_request');
create type public.task_status as enum ('pending', 'in_progress', 'completed');
create type public.notification_type as enum ('check_in', 'check_out', 'unpaid', 'new_reservation', 'maintenance');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role public.user_role not null default 'owner',
  created_at timestamptz not null default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  address text not null,
  city text not null,
  country text not null,
  description text not null default '',
  property_type public.property_type not null default 'hotel',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  room_number text not null,
  capacity int not null check (capacity > 0),
  price_per_night numeric(10,2) not null check (price_per_night >= 0),
  room_type text not null,
  description text not null default '',
  status public.room_status not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete restrict,
  guest_first_name text not null,
  guest_last_name text not null,
  guest_email text not null,
  guest_phone text not null default '',
  check_in date not null,
  check_out date not null,
  number_of_guests int not null check (number_of_guests > 0),
  total_amount numeric(12,2) not null default 0,
  deposit_paid numeric(12,2) not null default 0,
  remaining_balance numeric(12,2) not null default 0,
  internal_notes text not null default '',
  guest_requests text not null default '',
  status public.reservation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservations_dates_valid check (check_out > check_in)
);

create table public.housekeeping_tasks (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  task_type public.hk_task_type not null,
  status public.task_status not null default 'pending',
  notes text not null default '',
  assigned_to uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type public.notification_type not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index reservations_room_dates_idx on public.reservations (room_id, check_in, check_out);
create index reservations_property_idx on public.reservations (property_id);
create index rooms_property_idx on public.rooms (property_id);

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.rooms enable row level security;
alter table public.reservations enable row level security;
alter table public.housekeeping_tasks enable row level security;
alter table public.notifications enable row level security;

create policy "profiles_self" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "properties_owner" on public.properties
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "rooms_via_property" on public.rooms
  for all using (
    exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid())
  );

create policy "reservations_via_property" on public.reservations
  for all using (
    exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid())
  );

create policy "hk_via_property" on public.housekeeping_tasks
  for all using (
    exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid())
  );

create policy "notifications_self" on public.notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'owner')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
