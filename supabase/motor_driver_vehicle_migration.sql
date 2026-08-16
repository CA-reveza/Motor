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
alter table profiles add column if not exists aadhar_doc_path text;
alter table profiles add column if not exists vehicle_reg_doc_path text;
alter table profiles add column if not exists kyc_status text not null default 'pending'
  check (kyc_status in ('pending', 'submitted', 'verified'));

-- ----------------------------------------------------------------------------
-- Storage bucket for driver KYC document photos (Aadhar card, vehicle RC).
-- Private bucket: only the owning driver and admins can read/write, via the
-- policies below. Files are stored under `{driver_id}/aadhar.<ext>` and
-- `{driver_id}/vehicle_reg.<ext>`.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('driver-documents', 'driver-documents', false)
on conflict (id) do nothing;

drop policy if exists "driver_documents_insert_own" on storage.objects;
create policy "driver_documents_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'driver-documents' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "driver_documents_select_own_or_admin" on storage.objects;
create policy "driver_documents_select_own_or_admin" on storage.objects
  for select using (
    bucket_id = 'driver-documents' and (
      (storage.foldername(name))[1] = auth.uid()::text or is_admin()
    )
  );

drop policy if exists "driver_documents_update_own" on storage.objects;
create policy "driver_documents_update_own" on storage.objects
  for update using (
    bucket_id = 'driver-documents' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "driver_documents_delete_own" on storage.objects;
create policy "driver_documents_delete_own" on storage.objects
  for delete using (
    bucket_id = 'driver-documents' and (storage.foldername(name))[1] = auth.uid()::text
  );

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
