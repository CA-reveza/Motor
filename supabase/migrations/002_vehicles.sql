-- MOTOR: vehicles + driver assignment
-- Adds a real fleet model: physical vehicles that get assigned to drivers,
-- instead of `vehicle_type` on a booking being an unenforced free label.
-- Safe to re-run (create if not exists, drop-then-create for policies/trigger).

-- 1. Vehicles (the physical fleet)
create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  plate_number text not null unique,
  vehicle_type text not null, -- matches VEHICLE_TYPES ids in src/lib/pricing.js
  capacity_kg numeric,
  status text not null default 'active'
    check (status in ('active', 'maintenance', 'retired')),
  driver_id uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Only one active vehicle per driver at a time.
create unique index if not exists vehicles_one_per_driver
  on vehicles (driver_id)
  where driver_id is not null;

-- 2. Assignment history (audit trail of who drove which truck, and when)
create table if not exists vehicle_assignments (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  driver_id uuid not null references profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unassigned_at timestamptz
);

-- Whenever a vehicle's driver_id changes, close the previous assignment (if
-- any) and open a new one. Keeps the history table in sync automatically so
-- the admin UI never has to write to it directly.
create or replace function log_vehicle_assignment() returns trigger as $$
begin
  if (tg_op = 'UPDATE' and old.driver_id is distinct from new.driver_id)
     or (tg_op = 'INSERT' and new.driver_id is not null) then

    if tg_op = 'UPDATE' and old.driver_id is not null then
      update vehicle_assignments
      set unassigned_at = now()
      where vehicle_id = old.id and driver_id = old.driver_id and unassigned_at is null;
    end if;

    if new.driver_id is not null then
      insert into vehicle_assignments (vehicle_id, driver_id)
      values (new.id, new.driver_id);
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_vehicle_driver_change on vehicles;
create trigger on_vehicle_driver_change
  after insert or update of driver_id on vehicles
  for each row execute function log_vehicle_assignment();

-- 3. RLS
alter table vehicles enable row level security;
alter table vehicle_assignments enable row level security;

drop policy if exists "Admins manage vehicles" on vehicles;
create policy "Admins manage vehicles" on vehicles
  for all using (is_admin()) with check (is_admin());

drop policy if exists "Drivers can read own vehicle" on vehicles;
create policy "Drivers can read own vehicle" on vehicles
  for select using (driver_id = auth.uid() or is_admin());

drop policy if exists "Admins read assignment history" on vehicle_assignments;
create policy "Admins read assignment history" on vehicle_assignments
  for select using (is_admin() or driver_id = auth.uid());

-- Assignment rows are only ever written by the trigger (security definer),
-- so no insert/update policy is needed for regular clients.
