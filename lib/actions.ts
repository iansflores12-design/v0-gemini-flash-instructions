'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAdminConfig } from '@/lib/admin-config'
import { SUBSCRIPTION_LIMITS } from '@/lib/types'
import type { Task, Subject, Material } from './types'

export async function getSubjects(): Promise<Subject[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data || []
}

export async function createSubject(name: string, colorCode: string = '#6750A4'): Promise<Subject> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('subjects')
    .insert({ name, color_code: colorCode, user_id: user.id })
    .select()
    .single()
  
  if (error) throw error
  revalidatePath('/dashboard')
  return data
}

export async function getTasks(): Promise<Task[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      subject:subjects(*),
      materials(*)
    `)
    .order('due_date', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function createTask(
  title: string,
  dueDate: string,
  subjectId?: string,
  description?: string
): Promise<Task> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title,
      due_date: dueDate,
      subject_id: subjectId || null,
      description: description || null,
      user_id: user.id
    })
    .select(`
      *,
      subject:subjects(*)
    `)
    .single()
  
  if (error) throw error
  revalidatePath('/dashboard')
  return data
}

export async function toggleTaskDone(taskId: string, isDone: boolean): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tasks')
    .update({ is_done: isDone })
    .eq('id', taskId)
  
  if (error) throw error
  revalidatePath('/dashboard')
}

export async function deleteTask(taskId: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
  
  if (error) throw error
  revalidatePath('/dashboard')
}

export async function createMaterial(
  taskId: string,
  name: string,
  quantity?: string
): Promise<Material> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('materials')
    .insert({
      task_id: taskId,
      name,
      quantity: quantity || null,
      user_id: user.id
    })
    .select()
    .single()
  
  if (error) throw error
  revalidatePath('/dashboard')
  return data
}

export async function deleteMaterial(materialId: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('materials')
    .delete()
    .eq('id', materialId)
  
  if (error) throw error
  revalidatePath('/dashboard')
}

export async function deleteSubject(subjectId: string): Promise<void> {
  const supabase = await createClient()
  
  // Tasks and materials will be deleted automatically via ON DELETE CASCADE
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', subjectId)
  
  if (error) throw error
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/subjects')
  revalidatePath('/dashboard/tasks')
}

export async function createTaskWithMaterials(
  title: string,
  dueDate: string,
  subjectName: string | undefined,
  materials: { name: string; quantity?: string }[],
  description?: string,
  value?: string // TODO: Add to DB schema in migration 002_add_task_value.sql
): Promise<Task | { error: string; limitExceeded?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  // Check agenda limits if enabled
  const config = await getAdminConfig()
  if (config?.agendaLimitsEnabled) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('id', user.id)
      .single()

    const plan = profile?.subscription_plan || 'free'
    const limits = SUBSCRIPTION_LIMITS[plan]
    
    // Check monthly agenda limit
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString()

    const { data: agendas } = await supabase
      .from('subjects')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd)

    const agendasThisMonth = agendas?.length || 0
    
    if (agendasThisMonth >= limits.agendaPerMonth) {
      return {
        error: `Has alcanzado tu limite de ${limits.agendaPerMonth} agendas por mes. Actualiza a Pro o Ultra para mas.`,
        limitExceeded: true
      }
    }
  }
  
  let subjectId: string | null = null
  
  // Find or create subject if provided
  if (subjectName) {
    // Search for existing subject with exact match (case-insensitive) for the current user
    const { data: existingSubjects } = await supabase
      .from('subjects')
      .select('id, name')
      .eq('user_id', user.id)
      .ilike('name', subjectName)
    
    // Find exact match (case-insensitive) among results
    const exactMatch = existingSubjects?.find(s => s.name.toLowerCase() === subjectName.toLowerCase())
    
    if (exactMatch) {
      subjectId = exactMatch.id
    } else {
      // Create new subject with random color
      const colors = ['#6750A4', '#625B71', '#7D5260', '#006874', '#006D3B', '#924C25']
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      
      const { data: newSubject, error: subjectError } = await supabase
        .from('subjects')
        .insert({ name: subjectName, color_code: randomColor, user_id: user.id })
        .select()
        .single()
      
      if (subjectError) throw subjectError
      subjectId = newSubject.id
    }
  }
  
  // Create task with description (value field not yet in schema)
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      title,
      due_date: dueDate,
      subject_id: subjectId,
      user_id: user.id,
      description: description || null
    })
    .select()
    .single()
  
  if (taskError) throw taskError
  
  // Create materials
  if (materials.length > 0) {
    const materialsToInsert = materials.map(m => ({
      task_id: task.id,
      name: m.name,
      quantity: m.quantity || null,
      user_id: user.id
    }))
    
    const { error: materialsError } = await supabase
      .from('materials')
      .insert(materialsToInsert)
    
    if (materialsError) throw materialsError
  }
  
  revalidatePath('/dashboard')
  return task
}
