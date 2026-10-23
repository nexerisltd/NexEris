import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

import type { UserRole, ProfileRole } from '@/lib/roles'

export type { UserRole }

export interface CurrentUser {
  role: UserRole
  authUserId: string | null
  profile: {
    id: string
    username: string
    full_name: string
    role: ProfileRole
  } | null
}

// cache(): Navbar, page and footer all ask for the user; this makes it one lookup per request.
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { role: 'guest', authUserId: null, profile: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, role')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!profile) {
    return { role: 'guest', authUserId: user.id, profile: null }
  }

  return {
    role: profile.role as UserRole,
    authUserId: user.id,
    profile,
  }
})
