export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  updated_at: string
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
  due_date: string
  materials: { name: string; quantity?: string }[]
}

export interface AgendaParseResult {
  tasks: ParsedAgendaItem[]
  raw_text: string
}
