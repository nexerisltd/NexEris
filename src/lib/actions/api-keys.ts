'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'
import { getCurrentUser } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/roles'
import { API_SCOPES, type ApiScope } from '@/lib/api-keys'

async function requireSuperAdmin() {
  const user = await getCurrentUser()
  if (!isSuperAdmin(user.role)) throw new Error('Only a Super Admin can manage API keys.')
  return user
}

export async function createApiKey(name: string, scopes: string[]) {
  const user = await requireSuperAdmin()

  const cleanName = name.trim()
  if (cleanName.length < 2 || cleanName.length > 60) {
    return { success: false, error: 'Name must be 2–60 characters.' }
  }
  const cleanScopes = Array.from(new Set(scopes)).filter((s): s is ApiScope =>
    (API_SCOPES as readonly string[]).includes(s)
  )
  if (cleanScopes.length === 0) return { success: false, error: 'Choose at least one data scope.' }

  const supabase = createServiceClient()
  const { error } = await supabase.from('api_keys').insert({
    name: cleanName,
    key: `nxk_live_${randomBytes(24).toString('base64url')}`,
    scopes: cleanScopes,
    created_by: user.profile?.id ?? null,
  })

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/api-keys')
  return { success: true }
}

export async function setApiKeyActive(id: string, active: boolean) {
  await requireSuperAdmin()
  const supabase = createServiceClient()
  const { error } = await supabase.from('api_keys').update({ is_active: active }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/api-keys')
  return { success: true }
}

export async function deleteApiKey(id: string) {
  await requireSuperAdmin()
  const supabase = createServiceClient()
  const { error } = await supabase.from('api_keys').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/api-keys')
  return { success: true }
}
