-- Admin Configuration Table
CREATE TABLE IF NOT EXISTS admin_config (
  id VARCHAR PRIMARY KEY DEFAULT 'default',
  subscriptions_enabled BOOLEAN DEFAULT false,
  ads_enabled BOOLEAN DEFAULT false,
  chat_limits_enabled BOOLEAN DEFAULT false,
  agenda_limits_enabled BOOLEAN DEFAULT false,
  gemini_api_key VARCHAR,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(id)
);

-- User Usage Tracking Table
CREATE TABLE IF NOT EXISTS user_usage (
  user_id VARCHAR PRIMARY KEY,
  chat_requests_used_today INT DEFAULT 0,
  last_chat_reset TIMESTAMP DEFAULT NOW(),
  agendas_created_this_month INT DEFAULT 0,
  last_agenda_reset TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT user_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Insert default admin config
INSERT INTO admin_config (
  id,
  subscriptions_enabled,
  ads_enabled,
  chat_limits_enabled,
  agenda_limits_enabled,
  gemini_api_key
) VALUES (
  'default',
  false,
  false,
  false,
  false,
  ''
) ON CONFLICT (id) DO NOTHING;

-- Update profiles table to use new subscription tiers
ALTER TABLE profiles
  ALTER COLUMN subscription_plan TYPE VARCHAR(50);

-- Update existing subscriptions to new tiers
UPDATE profiles SET subscription_plan = 'free' WHERE subscription_plan NOT IN ('pro', 'ultra');

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON profiles(subscription_plan);

-- Enable RLS if available
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Admin only can read/write config
CREATE POLICY admin_config_access ON admin_config
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Users can only read their own usage
CREATE POLICY user_usage_access ON user_usage
  FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);
