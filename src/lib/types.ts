export interface Profile {
  id: string
  auth_user_id: string
  email: string
  username: string
  nex_id: string | null
  full_name: string
  position: string | null
  department: string | null
  pronouns: string | null
  bio: string | null
  github_username: string | null
  portfolio_url: string | null
  avatar_url: string | null
  cover_url: string | null
  cover_position: number | null
  whatsapp: string | null
  facebook: string | null
  instagram: string | null
  role: 'member' | 'admin' | 'super_admin'
  exp_points: number
  created_at: string
  updated_at: string
}