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
  filesPerBatch: number           // FREE: 3, PRO: unlimited, ULTRA: unlimited
  delayBetweenBatches: number    // ms - FREE: 2000, PRO: 500, ULTRA: 0
  chatMessagesPerDay: number     // FREE: 10, PRO: 50, ULTRA: unlimited
  maxFileSize: number            // bytes
  adsFree: boolean
}

export const SUBSCRIPTION_LIMITS: Record<string, SubscriptionLimits> = {
  free: {
    filesPerBatch: 3,
    delayBetweenBatches: 2000,    // 2 segundos entre lotes
    chatMessagesPerDay: 10,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    adsFree: false
  },
  pro: {
    filesPerBatch: 999,            // Unlimited effectively
    delayBetweenBatches: 500,      // 0.5 segundos entre lotes
    chatMessagesPerDay: 50,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    adsFree: true
  },
  ultra: {
    filesPerBatch: 999,            // Unlimited effectively
    delayBetweenBatches: 0,        // Sin delay
    chatMessagesPerDay: 9999,      // Unlimited effectively
    maxFileSize: 100 * 1024 * 1024, // 100MB
    adsFree: true
  }
}

// Helper functions to parse value from description
export function parseTaskValue(task: Task): { value: string | null; description: string | null } {
  if (!task.description) return { value: null, description: null }
  
  try {
    const parsed = JSON.parse(task.description)
    if (parsed.value && parsed.description) {
      return { value: parsed.value, description: parsed.description }
    }
  } catch {
    // Not JSON, return as-is
  }
  
  return { value: null, description: task.description }
}

export function getTaskDescription(task: Task): string | null {
  const { description } = parseTaskValue(task)
  return description
}

export function getTaskValue(task: Task): string | null {
  const { value } = parseTaskValue(task)
  return value
}
