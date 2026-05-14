import { createClient } from '@/lib/supabase/server'
import { SUBSCRIPTION_LIMITS, type UserUsage } from './types'

/**
 * Check if user has reached their daily chat limit
 */
export async function checkChatLimit(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  // Get user profile to determine plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan')
    .eq('id', userId)
    .single()

  const plan = profile?.subscription_plan || 'free'
  const limits = SUBSCRIPTION_LIMITS[plan]
  
  // Get today's usage from local tracking (in real implementation, use database)
  const today = new Date().toISOString().split('T')[0]
  const usageKey = `chat_usage_${userId}_${today}`
  
  // This would come from your usage tracking table in production
  // For now, we'll return false (not limited)
  return false
}

/**
 * Get user's current subscription limits
 */
export async function getUserLimits(userId: string) {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan')
    .eq('id', userId)
    .single()

  const plan = profile?.subscription_plan || 'free'
  return SUBSCRIPTION_LIMITS[plan]
}

/**
 * Track chat message usage
 */
export async function trackChatUsage(userId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  
  // Create or update usage record
  const { data: existing } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('last_chat_reset', today)
    .single()

  if (existing) {
    await supabase
      .from('user_usage')
      .update({ chat_messages_used_today: existing.chat_messages_used_today + 1 })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('user_usage')
      .insert({
        user_id: userId,
        chat_messages_used_today: 1,
        last_chat_reset: today,
        total_tasks_created: 0,
        total_subjects_created: 0
      })
  }
}

/**
 * Get user's current usage stats
 */
export async function getUserUsage(userId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  
  const { data: usage } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!usage) {
    return {
      userId,
      chatMessagesUsedToday: 0,
      lastChatReset: today,
      totalTasksCreated: 0,
      totalSubjectsCreated: 0
    }
  }

  return usage
}

/**
 * Check if user subscription is active (not expired)
 */
export async function isSubscriptionActive(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan, subscription_end_date')
    .eq('id', userId)
    .single()

  if (!profile) return false
  if (profile.subscription_plan === 'free') return true
  
  const endDate = profile.subscription_end_date
  if (!endDate) return false
  
  return new Date(endDate) > new Date()
}

/**
 * Upgrade user to pro subscription
 */
export async function upgradeToPro(userId: string, stripeCustomerId: string) {
  const supabase = await createClient()
  const startDate = new Date()
  const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_plan: 'pro',
      subscription_start_date: startDate.toISOString(),
      subscription_end_date: endDate.toISOString(),
      stripe_customer_id: stripeCustomerId
    })
    .eq('id', userId)

  if (error) throw error
}
