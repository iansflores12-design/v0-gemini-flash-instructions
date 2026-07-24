import { createClient } from '@/lib/supabase/server'
import { SUBSCRIPTION_LIMITS } from './types'

/**
 * Get user's subscription plan
 */
export async function getUserPlan(userId: string): Promise<'free' | 'pro' | 'ultra'> {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan')
    .eq('id', userId)
    .single()

  return profile?.subscription_plan || 'free'
}

/**
 * Check if user has reached their daily chat limit
 */
export async function checkChatLimit(userId: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const supabase = await createClient()
  const plan = await getUserPlan(userId)
  const limits = SUBSCRIPTION_LIMITS[plan]
  
  // Get today's usage
  const today = new Date().toISOString().split('T')[0]
  
  const { data: usage } = await supabase
    .from('user_usage')
    .select('chat_messages_used_today, last_chat_reset')
    .eq('user_id', userId)
    .single()

  let messagesUsed = 0
  
  // Check if we need to reset (new day)
  if (usage && usage.last_chat_reset === today) {
    messagesUsed = usage.chat_messages_used_today
  }

  const allowed = messagesUsed < limits.chatMessagesPerDay
  const remaining = Math.max(0, limits.chatMessagesPerDay - messagesUsed)
  
  return {
    allowed,
    remaining,
    limit: limits.chatMessagesPerDay
  }
}

/**
 * Get file batch limits based on plan
 */
export async function getFileBatchLimits(userId: string) {
  const plan = await getUserPlan(userId)
  const limits = SUBSCRIPTION_LIMITS[plan]
  
  return {
    filesPerBatch: limits.filesPerBatch,
    delayBetweenBatches: limits.delayBetweenBatches,
    maxFileSize: limits.maxFileSize
  }
}

/**
 * Track chat message usage
 */
export async function trackChatUsage(userId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  
  const { data: existing } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (existing) {
    // Check if it's a new day
    if (existing.last_chat_reset === today) {
      // Same day, increment
      await supabase
        .from('user_usage')
        .update({ chat_messages_used_today: existing.chat_messages_used_today + 1 })
        .eq('user_id', userId)
    } else {
      // New day, reset and set to 1
      await supabase
        .from('user_usage')
        .update({ 
          chat_messages_used_today: 1,
          last_chat_reset: today
        })
        .eq('user_id', userId)
    }
  } else {
    // First usage
    await supabase
      .from('user_usage')
      .insert({
        user_id: userId,
        chat_messages_used_today: 1,
        last_chat_reset: today
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
      lastChatReset: today
    }
  }

  return usage
}

/**
 * Check if user subscription is active
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
