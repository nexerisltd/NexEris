'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { getCurrentUser } from '@/lib/auth'
import { isStaff, isSuperAdmin, type ProfileRole } from '@/lib/roles'
import { revalidatePath } from 'next/cache'

const VALID_ROLES: ProfileRole[] = ['member', 'admin', 'super_admin']

// Authorization is enforced here, in code. Writes then go through the service
// client so they work regardless of which roles the database RLS policies know.
async function requireStaff() {
  const currentUser = await getCurrentUser()
  if (!isStaff(currentUser.role)) throw new Error('Not authorized.')
  return currentUser
}

async function requireSuperAdmin() {
  const currentUser = await getCurrentUser()
  if (!isSuperAdmin(currentUser.role)) throw new Error('Only a Super Admin can do this.')
  return currentUser
}

export async function addAllowedEmail(email: string, role: ProfileRole) {
  const currentUser = await requireStaff()
  if (!VALID_ROLES.includes(role)) return { success: false, error: 'Invalid role.' }
  // Admins can only add plain members.
  if (role !== 'member' && !isSuperAdmin(currentUser.role)) {
    return { success: false, error: 'Only a Super Admin can add admins or super admins.' }
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('allowed_members')
    .insert({ email: email.toLowerCase().trim(), role })

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/allowed-emails')
  return { success: true }
}

export async function removeAllowedEmail(id: string) {
  await requireSuperAdmin()
  const supabase = createServiceClient()
  const { error } = await supabase.from('allowed_members').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/allowed-emails')
  return { success: true }
}

export async function updateAllowedEmailRole(id: string, role: ProfileRole) {
  await requireSuperAdmin()
  if (!VALID_ROLES.includes(role)) return { success: false, error: 'Invalid role.' }
  const supabase = createServiceClient()
  const { error } = await supabase.from('allowed_members').update({ role }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/allowed-emails')
  return { success: true }
}

export async function changeProfileRole(profileId: string, role: ProfileRole) {
  const currentUser = await requireSuperAdmin()
  if (!VALID_ROLES.includes(role)) return { success: false, error: 'Invalid role.' }
  if (currentUser.profile?.id === profileId) {
    return { success: false, error: "You can't change your own role." }
  }
  const supabase = createServiceClient()
  const { error } = await supabase.from('profiles').update({ role }).eq('id', profileId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/members')
  return { success: true }
}

export async function adjustExpPoints(profileId: string, delta: number, username: string) {
  await requireStaff()

  if (!Number.isFinite(delta) || delta === 0) {
    return { success: false, error: 'Enter a non-zero amount.' }
  }

  const supabase = createServiceClient()

  const { data: existing, error: fetchError } = await supabase
    .from('profiles')
    .select('exp_points')
    .eq('id', profileId)
    .single()

  if (fetchError || !existing) {
    return { success: false, error: 'Profile not found.' }
  }

  const nextTotal = Math.max(0, Math.round((existing.exp_points ?? 0) + delta))

  const { error } = await supabase
    .from('profiles')
    .update({ exp_points: nextTotal })
    .eq('id', profileId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/${username}`)
  revalidatePath(`/${username}/edit`)
  revalidatePath('/admin/members')

  return { success: true, total: nextTotal }
}

export async function deleteProfile(profileId: string) {
  const currentUser = await requireSuperAdmin()
  if (currentUser.profile?.id === profileId) {
    return { success: false, error: "You can't delete your own profile." }
  }
  const supabase = createServiceClient()
  const { error } = await supabase.from('profiles').delete().eq('id', profileId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/members')
  revalidatePath('/')
  return { success: true }
}

export async function bulkAddAllowedEmails(
  entries: { email: string; role: ProfileRole }[]
) {
  const currentUser = await requireStaff()
  const canAssignRoles = isSuperAdmin(currentUser.role)
  const supabase = createServiceClient()

  let added = 0
  let skipped = 0
  const errors: string[] = []

  for (const entry of entries) {
    const email = entry.email.toLowerCase().trim()
    if (!email || !email.includes('@')) {
      skipped++
      continue
    }

    // Admins can only import plain members; any other role is coerced.
    const role: ProfileRole =
      canAssignRoles && VALID_ROLES.includes(entry.role) ? entry.role : 'member'

    const { error } = await supabase.from('allowed_members').insert({ email, role })

    if (error) {
      if (error.code === '23505') {
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
