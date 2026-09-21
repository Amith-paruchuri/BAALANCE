-- ==============================================================================
-- BAALANCE Clinical Biomarker & Lifestyle Intelligence Database Schema
-- Target Platform: Supabase PostgreSQL (nyxivqlpikoffdopfmei.supabase.co)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USER PROFILES & DEMOGRAPHIC BASELINES
create table if not exists public.baalance_profiles (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text not null,
  role text default 'Tech Founder & AI Lead',
  sector text default 'Software & AI',
  is_custom_role boolean default false,
  
  -- Demographics & Endocrine Baseline
  age integer default 32,
  biological_sex text check (biological_sex in ('male', 'female', 'other')),
  is_pregnant boolean default false,
  
  -- Clinical Comfounders
  health_conditions text[] default array['none']::text[],
  medications text[] default array['none']::text[],
  
  -- Occupational & Circadian Parameters
  weekly_hours integer default 65,
  chronotype text default 'morning_lark',
  nightly_sleep_hours numeric(3, 1) default 6.0,
  sleep_quality text default 'middle_night_awakenings',
  work_boundary_bleed text default 'always_on_bed',
  caffeine_habit text default 'immediate_waking',
  somatic_symptoms text[] default array['brain_fog']::text[],
  stress_drivers text[] default array['evening_meetings', 'sleep_debt']::text[],
  perceived_stress_rating integer default 7,
  
  -- Metadata
  is_demo boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. HAIR CORTISOL SEGMENTED LAB SPECIMENS (90-DAY QUARTERLY)
create table if not exists public.baalance_hair_cortisol (
  id uuid primary key default uuid_generate_v4(),
  user_email text not null references public.baalance_profiles(email) on delete cascade,
  specimen_barcode text default 'BL-8942-ELISA',
  sample_weight_mg numeric(4, 1) default 14.8,
  
  -- Month-by-month Cortisol Concentrations (pg/mg)
  month1_root_pg_mg numeric(4, 1) default 15.6,       -- 0-1 cm (Last 30 days)
  month2_mid_shaft_pg_mg numeric(4, 1) default 28.4,   -- 1-2 cm (30-60 days ago, acute crunch)
  month3_tip_pg_mg numeric(4, 1) default 11.2,         -- 2-3 cm (60-90 days ago, baseline)
  reference_baseline_pg_mg numeric(4, 1) default 11.0,
  
  -- Diagnostic Outcomes
  allostatic_load_score integer default 78,
  allostatic_category text default 'High Sympathetic Strain',
  confidence_score integer default 94,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. GOOGLE CALENDAR & WEARABLE TELEMETRY SYNCHRONIZATION
create table if not exists public.baalance_telemetry_sync (
  id uuid primary key default uuid_generate_v4(),
  user_email text not null references public.baalance_profiles(email) on delete cascade,
  calendar_email text not null,
  is_calendar_verified boolean default true,
  last_calendar_sync timestamp with time zone default timezone('utc'::text, now()),
  
  -- Aggregated Load
  total_meeting_hours numeric(5, 1) default 414.0,
  peak_week_meeting_hours numeric(4, 1) default 47.5,
  evening_calls_count integer default 53,
  cross_timezone_flights integer default 9,
  
  -- Biometric Recovery
  avg_deep_sleep_hours numeric(3, 2) default 0.85,
  avg_resting_heart_rate integer default 61,
  avg_hrv_rmssd integer default 45,
  
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row-level security policies (public insert/read for app demo & live onboarding)
alter table public.baalance_profiles enable row level security;
alter table public.baalance_hair_cortisol enable row level security;
alter table public.baalance_telemetry_sync enable row level security;

create policy "Allow anonymous and authenticated read profiles"
  on public.baalance_profiles for select using (true);

create policy "Allow anonymous and authenticated insert/update profiles"
  on public.baalance_profiles for all using (true);

create policy "Allow anonymous and authenticated read biomarkers"
  on public.baalance_hair_cortisol for select using (true);

create policy "Allow anonymous and authenticated insert biomarkers"
  on public.baalance_hair_cortisol for all using (true);

create policy "Allow anonymous and authenticated read telemetry"
  on public.baalance_telemetry_sync for select using (true);

create policy "Allow anonymous and authenticated insert telemetry"
  on public.baalance_telemetry_sync for all using (true);
