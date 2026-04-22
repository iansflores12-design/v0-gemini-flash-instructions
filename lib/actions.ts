'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
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

export async function createTaskWithMaterials(
  title: string,
  dueDate: string,
  subjectName: string | undefined,
  materials: { name: string; quantity?: string }[]
): Promise<Task> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  let subjectId: string | null = null
  
  // Find or create subject if provided
  if (subjectName) {
    const { data: existingSubject } = await supabase
      .from('subjects')
      .select('id')
      .ilike('name', subjectName)
      .single()
    
    if (existingSubject) {
      subjectId = existingSubject.id
    } else {
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
  
  // Create task
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      title,
      due_date: dueDate,
      subject_id: subjectId,
      user_id: user.id
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
