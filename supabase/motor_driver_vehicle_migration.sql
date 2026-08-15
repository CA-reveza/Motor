-- ============================================================================
-- MOTOR — Migration: driver vehicle assignment + onboarding KYC fields
-- Run this on the MOTOR project's Supabase SQL Editor.
-- Fixes: admin had no way to assign a vehicle to a driver (profiles had no
-- vehicle columns at all), which is why drivers could never accept jobs and
-- bridged OrderIt bookings sat stuck at "pending" forever.
-- Safe to re-run.
-- ============================================================================

alter table profiles add column if not exists vehicle_type text;
alter table profiles add column if not exists vehicle_number text;
alter table profiles add column if not exists address text;
alter table profiles add column if not exists aadhar_number text;
alter table profiles add column if not exists vehicle_reg_number text;

-- Capture the extra driver-onboarding fields at sign-up too (optional —
-- admin can still fill/edit these later from /admin/drivers either way).
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (
    id, full_name, phone, role,
    vehicle_type, vehicle_number, address, aadhar_number, vehicle_reg_number
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    new.raw_user_meta_data->>'vehicle_type',
    new.raw_user_meta_data->>'vehicle_number',
    new.raw_user_meta_data->>'address',
    new.raw_user_meta_data->>'aadhar_number',
    new.raw_user_meta_data->>'vehicle_reg_number'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- No RLS changes needed: "Users can update own profile" already allows
-- admins to update any profile row (`auth.uid() = id or is_admin()`), so
-- the new AdminDrivers.jsx assign-vehicle control just works once these
-- columns exist.
