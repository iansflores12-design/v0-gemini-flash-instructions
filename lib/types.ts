export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  theme: string | null
  updated_at: string
  // Subscription fields
  subscription_plan: 'free' | 'pro' | 'premium'
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

// Subscription limits configuration
export interface SubscriptionLimits {
  chatMessagesPerDay: number
  totalTasksAllowed: number
  totalSubjectsAllowed: number
  aiChatEnabled: boolean
  adsFree: boolean
}

// Usage tracking
export interface UserUsage {
  userId: string
  chatMessagesUsedToday: number
  lastChatReset: string
  totalTasksCreated: number
  totalSubjectsCreated: number
}

export const SUBSCRIPTION_LIMITS: Record<string, SubscriptionLimits> = {
  free: {
    chatMessagesPerDay: 5,
    totalTasksAllowed: 50,
    totalSubjectsAllowed: 10,
    aiChatEnabled: true,
    adsFree: false
  },
  pro: {
    chatMessagesPerDay: 50,
    totalTasksAllowed: 500,
    totalSubjectsAllowed: 100,
    aiChatEnabled: true,
    adsFree: true
  },
  premium: {
    chatMessagesPerDay: 500,
    totalTasksAllowed: 5000,
    totalSubjectsAllowed: 1000,
    aiChatEnabled: true,
    adsFree: true
  }
}
