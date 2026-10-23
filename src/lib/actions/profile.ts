'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getCurrentUser } from '@/lib/auth'
import { isSuperAdmin, RESERVED_USERNAMES } from '@/lib/roles'
import { revalidatePath } from 'next/cache'

export interface ProfileUpdateInput {
  full_name: string
  username: string
  position: string
  department: string
  pronouns: string
  bio: string
  portfolio_url: string
  github_username: string
  avatar_url: string
  cover_url: string
  cover_position: number
  whatsapp: string
  facebook: string
  instagram: string
}

export async function checkUsernameAvailable(username: string, excludeProfileId: string) {
  if (RESERVED_USERNAMES.includes(username.toLowerCase())) return false
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', excludeProfileId)
    .maybeSingle()

  return !data
}

export async function updateProfile(profileId: string, input: ProfileUpdateInput) {
  const currentUser = await getCurrentUser()

  if (!currentUser.profile) {
    return { success: false, error: 'Not authorized.' }
  }

  const isOwner = currentUser.profile.id === profileId
  const isSA = isSuperAdmin(currentUser.role)

  // Members and Admins can only edit their own profile; only a Super Admin can edit anyone's.
  if (!isOwner && !isSA) {
    return { success: false, error: 'You can only edit your own profile.' }
  }

  if (RESERVED_USERNAMES.includes(input.username.toLowerCase())) {
    return { success: false, error: 'That username is reserved.' }
  }

  // Authorization is checked above; the write uses the service client so it
  // also works when a Super Admin edits someone else's profile.
  const supabase = createServiceClient()

  const { data: existing } = await supabase
    .from('profiles')
    .select('position, department')
    .eq('id', profileId)
    .single()

  if (!existing) {
    return { success: false, error: 'Profile not found.' }
  }

  const { data: usernameTaken } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', input.username)
    .neq('id', profileId)
    .maybeSingle()

  if (usernameTaken) {
    return { success: false, error: 'Username already taken.' }
  }

  if (!input.whatsapp.trim()) {
    return { success: false, error: 'WhatsApp number is required.' }
  }

  // Position & Department: only a Super Admin is allowed to change these.
  const position = isSA ? input.position || null : existing.position
  const department = isSA ? input.department || null : existing.department

  // Nex ID is intentionally NOT touched here — it's set once at account
  // creation (see app/auth/callback/route.ts) and stays fixed for the
  // profile's lifetime unless changed directly in the database.

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: input.full_name,
      username: input.username,
      position,
      department,
      pronouns: input.pronouns || null,
      bio: input.bio || null,
      portfolio_url: input.portfolio_url || null,
      github_username: input.github_username || null,
      avatar_url: input.avatar_url || null,
      cover_url: input.cover_url || null,
      cover_position: input.cover_position,
      whatsapp: input.whatsapp || null,
      facebook: input.facebook || null,
      instagram: input.instagram || null,
    })
    .eq('id', profileId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/${input.username}`)
  revalidatePath('/dashboard')

  return { success: true }
}