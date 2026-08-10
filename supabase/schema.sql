-- Demo backend schema for the Reports feature (sirp-mockup).
-- Run this once in the Supabase SQL editor for a fresh project.
--
-- This is a throwaway demo project for a UI mockup — fixture data only.
-- Never point it at, or load, real tenant/customer data.

create extension if not exists pgcrypto;

create table report_schedules (
  id uuid primary key default gen_random_uuid(),
  report_id text not null,
  report_name text not null,
  frequency text not null,
  hour_slot int,
  day_of_month int,
  weekday text,
  date_range text not null,
  interval_days int,
  timezone text,
  recipient_emails text[] not null default '{}',
  recipient_names text[] not null default '{}',
  email_subject text,
  email_content text,
  delivery_channel text not null,
  next_run timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table report_deliveries (
  id uuid primary key default gen_random_uuid(),
  report_id text not null,
  report_name text not null,
  schedule_id uuid references report_schedules(id) on delete set null,
  trigger_type text not null check (trigger_type in ('manual', 'schedule')),
  recipient_email text not null,
  recipient_name text,
  channel text not null,
  subject text,
  message text,
  status text not null default 'sent',
  created_at timestamptz not null default now()
);

create table report_export_log (
  id uuid primary key default gen_random_uuid(),
  report_id text not null,
  report_name text not null,
  format text not null,
  triggered_by text not null default 'manual',
  size_kb int,
  created_at timestamptz not null default now()
);

alter table report_schedules enable row level security;
alter table report_deliveries enable row level security;
alter table report_export_log enable row level security;

-- Wide-open demo policies — fine for a disposable project with only fixture
-- data behind a public anon key. Tighten before this ever touches real data.
create policy "demo anon full access" on report_schedules for all using (true) with check (true);
create policy "demo anon full access" on report_deliveries for all using (true) with check (true);
create policy "demo anon full access" on report_export_log for all using (true) with check (true);
