// Shared (server + client) API-key definitions.

export const API_SCOPES = ['team', 'products'] as const
export type ApiScope = (typeof API_SCOPES)[number]

export const SCOPE_LABELS: Record<ApiScope, string> = {
  team: 'Team',
  products: 'Products',
}

export interface ApiKeyRow {
  id: string
  name: string
  key: string
  scopes: ApiScope[]
  is_active: boolean
  created_at: string
  last_used_at: string | null
  request_count: number
}

export function maskKey(key: string) {
  return `${key.slice(0, 13)}${'•'.repeat(20)}`
}
