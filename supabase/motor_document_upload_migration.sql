-- ============================================================================
-- MOTOR — Migration: real document upload for driver KYC (Aadhar + vehicle RC)
-- Run this on the MOTOR project's Supabase SQL Editor, after
-- motor_driver_vehicle_migration.sql.
-- Safe to re-run.
-- ============================================================================

-- Private bucket — documents are only readable by the driver themselves and
-- admins (via the policies below), never public.
insert into storage.buckets (id, name, public)
values ('driver-documents', 'driver-documents', false)
on conflict (id) do nothing;

-- Path convention: driver-documents/<driver_id>/aadhar.<ext> and
-- driver-documents/<driver_id>/vehicle_reg.<ext>
drop policy if exists "Drivers can upload own documents" on storage.objects;
create policy "Drivers can upload own documents" on storage.objects
  for insert with check (
    bucket_id = 'driver-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Drivers can replace own documents" on storage.objects;
create policy "Drivers can replace own documents" on storage.objects
  for update using (
    bucket_id = 'driver-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Drivers can read own documents" on storage.objects;
create policy "Drivers can read own documents" on storage.objects
  for select using (
    bucket_id = 'driver-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Admins can read all driver documents" on storage.objects;
create policy "Admins can read all driver documents" on storage.objects
  for select using (
    bucket_id = 'driver-documents' and is_admin()
  );

-- Store the uploaded object's path on the profile row so the app doesn't
-- need to list the bucket to find a driver's documents.
alter table profiles add column if not exists aadhar_doc_path text;
alter table profiles add column if not exists vehicle_reg_doc_path text;

-- Admin explicitly marks a driver verified after reviewing their documents
-- (separate from "documents submitted", which is just aadhar_doc_path +
-- vehicle_reg_doc_path both being set).
alter table profiles add column if not exists kyc_status text not null default 'pending'
  check (kyc_status in ('pending', 'verified'));
