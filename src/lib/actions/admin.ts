'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const currentUser = await getCurrentUser()
  if (currentUser.role !== 'admin') {
    throw new Error('Not authorized.')
  }
  return currentUser
}

export async function addAllowedEmail(email: string, role: 'member' | 'admin') {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('allowed_members')
    .insert({ email: email.toLowerCase().trim(), role })

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/allowed-emails')
  return { success: true }
}

export async function removeAllowedEmail(id: string) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('allowed_members').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/allowed-emails')
  return { success: true }
}

export async function updateAllowedEmailRole(id: string, role: 'member' | 'admin') {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('allowed_members').update({ role }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/allowed-emails')
  return { success: true }
}

export async function changeProfileRole(profileId: string, role: 'member' | 'admin') {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ role }).eq('id', profileId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/members')
  return { success: true }
}

export async function deleteProfile(profileId: string) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').delete().eq('id', profileId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/members')
  revalidatePath('/')
  return { success: true }
}

export async function bulkAddAllowedEmails(
  entries: { email: string; role: 'member' | 'admin' }[]
) {
  await requireAdmin()
  const supabase = await createClient()

  let added = 0
  let skipped = 0
  const errors: string[] = []

  for (const entry of entries) {
    const email = entry.email.toLowerCase().trim()
    if (!email || !email.includes('@')) {
      skipped++
      continue
    }

    const { error } = await supabase
      .from('allowed_members')
      .insert({ email, role: entry.role })

    if (error) {
      if (error.code === '23505') {
        // unique constraint violation — email already exists
        skipped++
      } else {
        errors.push(`${email}: ${error.message}`)
      }
    } else {
      added++
    }
  }

  revalidatePath('/admin/allowed-emails')
  return { added, skipped, errors }
}