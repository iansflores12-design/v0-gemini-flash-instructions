export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  theme: string | null
  updated_at: string
  // Subscription fields - 3 tiers: free, pro, ultra
  subscription_plan: 'free' | 'pro' | 'ultra'
  subscription_start_date: string | null
  subscription_end_date: string | null
  stripe_customer_id: string | null
}

export interface Subject {
  id: string
  user_id: string
  name: string
  color_code: string
}

export interface Task {
  id: string
  user_id: string
  subject_id: string | null
  title: string
  description: string | null
  due_date: string
  value: string | null
  is_done: boolean
  created_at: string
  subject?: Subject
  materials?: Material[]
}

export interface Material {
  id: string
  task_id: string
  user_id: string
  name: string
  quantity: string | null
}

export interface ParsedAgendaItem {
  title: string
  subject?: string
  subject_color?: string
  due_date: string
  description?: string
  value?: string
  materials: { name: string; quantity?: string }[]
}

export interface AgendaParseResult {
  tasks: ParsedAgendaItem[]
  raw_text: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Subscription limits configuration - 3 tiers: free, pro, ultra
export interface SubscriptionLimits {
  agendaPerMonth: number
  chatRequestsPerDay: number
  adsFree: boolean
}

// Usage tracking for limits
export interface UserUsage {
  userId: string
  chatRequestsUsedToday: number
  lastChatReset: string
  agendasCreatedThisMonth: number
  lastAgendaReset: string
}

// Admin configuration for feature toggles
export interface AdminConfig {
  id: string
  subscriptionsEnabled: boolean
  adsEnabled: boolean
  chatLimitsEnabled: boolean
  agendaLimitsEnabled: boolean
  geminiApiKey: string
  updatedAt: string
}

export const SUBSCRIPTION_LIMITS: Record<string, SubscriptionLimits> = {
  free: {
    agendaPerMonth: 15,
    chatRequestsPerDay: 10,
    adsFree: false
  },
  pro: {
    agendaPerMonth: 50,
    chatRequestsPerDay: 100,
    adsFree: true
  },
  ultra: {
    agendaPerMonth: 9999, // Unlimited
    chatRequestsPerDay: 500,
    adsFree: true
  }
}
