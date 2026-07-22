import { createClient } from '@/lib/supabase/server'

export interface PublicProfile {
  id: string
  username: string
  full_name: string
  position: string | null
  department: string | null
  bio: string | null
  nex_id: string | null
  avatar_url: string | null
}

export async function getAllProfiles(): Promise<PublicProfile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, position, department, bio, nex_id, avatar_url')
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Failed to load profiles:', error)
    return []
  }

  return data ?? []
}