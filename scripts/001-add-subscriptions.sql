-- Add subscription fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'premium'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Create user_usage table for tracking limits
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_messages_used_today INTEGER DEFAULT 0,
  last_chat_reset DATE DEFAULT CURRENT_DATE,
  total_tasks_created INTEGER DEFAULT 0,
  total_subjects_created INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, last_chat_reset)
);

-- Create stripe_subscriptions table for payment tracking
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('pro', 'premium')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'unpaid')),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create ads table for ad management
CREATE TABLE IF NOT EXISTS ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cta_text TEXT,
  cta_url TEXT,
  show_to_plans TEXT[] DEFAULT ARRAY['free'],
  active BOOLEAN DEFAULT true,
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own usage" ON user_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" ON user_usage
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own subscriptions" ON stripe_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active ads" ON ads
  FOR SELECT USING (active = true AND (end_date IS NULL OR end_date > NOW()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_reset_date ON user_usage(last_chat_reset);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_user_id ON stripe_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_active ON ads(active, end_date);
