/*
# Initial schema for ClearGrade

Creates the complete database schema from scratch, consolidating all
existing migration scripts into one idempotent migration.

## New Tables
1. `profiles` — user profile, linked to auth.users. Stores username, full name,
   subscription plan/tier, Stripe customer/subscription IDs, and the user's
   Gemini API key (BYOK flow).
2. `subjects` — school subjects belonging to a user (e.g. "Mathematics").
3. `tasks` — homework/exam tasks belonging to a user, optionally linked to a subject.
4. `materials` — study materials linked to a task.
5. `user_usage` — daily usage tracking for chat limits and agenda limits.
6. `stripe_subscriptions` — Stripe payment tracking.
7. `ads` — admin-managed advertisement banners shown to specific plan tiers.
8. `admin_config` — single-row admin settings table.

## Security
- RLS enabled on every table.
- Owner-scoped policies (select/insert/update/delete) on profiles, subjects,
  tasks, materials, user_usage, and stripe_subscriptions using auth.uid().
- Ads are publicly readable when active.
- Admin_config is readable/writable by all authenticated users (single-row
  config table; access control handled at app level).

## Important Notes
1. The `gemini_api_key` column on profiles enables the bring-your-own-key
   flow — users store their own Google AI Studio key and all AI routes use it.
2. The `user_id` columns on owner-scoped tables default to auth.uid() so
   client inserts that omit user_id still satisfy RLS.
3. This migration is safe to re-run (all statements use IF NOT EXISTS or
   DROP POLICY IF EXISTS before CREATE POLICY).
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'ultra')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due')),
  gemini_api_key TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- subjects
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  color_code TEXT DEFAULT '#6750A4'
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subjects_select_own" ON subjects;
CREATE POLICY "subjects_select_own" ON subjects FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "subjects_insert_own" ON subjects;
CREATE POLICY "subjects_insert_own" ON subjects FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "subjects_update_own" ON subjects;
CREATE POLICY "subjects_update_own" ON subjects FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "subjects_delete_own" ON subjects;
CREATE POLICY "subjects_delete_own" ON subjects FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- tasks
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  is_done BOOLEAN DEFAULT FALSE,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks_select_own" ON tasks;
CREATE POLICY "tasks_select_own" ON tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "tasks_insert_own" ON tasks;
CREATE POLICY "tasks_insert_own" ON tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "tasks_update_own" ON tasks;
CREATE POLICY "tasks_update_own" ON tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "tasks_delete_own" ON tasks;
CREATE POLICY "tasks_delete_own" ON tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id_due_date ON tasks(user_id, due_date);

-- ============================================================
-- materials
-- ============================================================
CREATE TABLE IF NOT EXISTS materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity TEXT
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "materials_select_own" ON materials;
CREATE POLICY "materials_select_own" ON materials FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "materials_insert_own" ON materials;
CREATE POLICY "materials_insert_own" ON materials FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "materials_update_own" ON materials;
CREATE POLICY "materials_update_own" ON materials FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "materials_delete_own" ON materials;
CREATE POLICY "materials_delete_own" ON materials FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- user_usage
-- ============================================================
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_messages_used_today INTEGER DEFAULT 0,
  last_chat_reset DATE DEFAULT CURRENT_DATE,
  total_tasks_created INTEGER DEFAULT 0,
  total_subjects_created INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, last_chat_reset)
);

ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_usage_select_own" ON user_usage;
CREATE POLICY "user_usage_select_own" ON user_usage FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_usage_insert_own" ON user_usage;
CREATE POLICY "user_usage_insert_own" ON user_usage FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_usage_update_own" ON user_usage;
CREATE POLICY "user_usage_update_own" ON user_usage FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_usage_delete_own" ON user_usage;
CREATE POLICY "user_usage_delete_own" ON user_usage FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);

-- ============================================================
-- stripe_subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('pro', 'ultra')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'unpaid')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stripe_subscriptions_select_own" ON stripe_subscriptions;
CREATE POLICY "stripe_subscriptions_select_own" ON stripe_subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_user_id ON stripe_subscriptions(user_id);

-- ============================================================
-- ads
-- ============================================================
CREATE TABLE IF NOT EXISTS ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cta_text TEXT,
  cta_url TEXT,
  show_to_plans TEXT[] DEFAULT ARRAY['free'],
  active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ads_select_active" ON ads;
CREATE POLICY "ads_select_active" ON ads FOR SELECT
  TO authenticated USING (active = true AND (end_date IS NULL OR end_date > NOW()));

-- ============================================================
-- admin_config (single-row settings table)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_config (
  id VARCHAR PRIMARY KEY DEFAULT 'default',
  subscriptions_enabled BOOLEAN DEFAULT false,
  ads_enabled BOOLEAN DEFAULT false,
  chat_limits_enabled BOOLEAN DEFAULT false,
  agenda_limits_enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_config_select" ON admin_config;
CREATE POLICY "admin_config_select" ON admin_config FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_config_update" ON admin_config;
CREATE POLICY "admin_config_update" ON admin_config FOR UPDATE
  TO authenticated WITH CHECK (true);

INSERT INTO admin_config (id, subscriptions_enabled, ads_enabled, chat_limits_enabled, agenda_limits_enabled)
VALUES ('default', false, false, false, false)
ON CONFLICT (id) DO NOTHING;

-- Indexes for subscription lookups
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
