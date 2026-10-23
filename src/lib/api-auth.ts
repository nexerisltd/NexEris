import 'server-only'
import { after, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { ApiScope } from '@/lib/api-keys'

// Browsers on other websites call this API, so allow cross-origin GET requests.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-API-Key, Content-Type',
  'Access-Control-Max-Age': '86400',
}

export function apiJson(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      ...CORS,
      'Cache-Control': status === 200 ? 'private, max-age=60' : 'no-store',
    },
  })
}

export function apiError(status: number, code: string, message: string) {
  return apiJson({ error: { code, message } }, status)
}

export function preflight() {
  return new Response(null, { status: 204, headers: CORS })
}

/** Returns an error Response when the key is missing / invalid / disabled / out of scope, else null. */
export async function requireApiKey(request: NextRequest, scope: ApiScope): Promise<Response | null> {
  const auth = request.headers.get('authorization')
  const key = (auth?.toLowerCase().startsWith('bearer ')
    ? auth.slice(7)
    : request.headers.get('x-api-key')
  )?.trim()

  if (!key) {
    return apiError(401, 'missing_api_key', 'Send your key as "Authorization: Bearer <key>" or in the "X-API-Key" header.')
  }
  if (!/^nxk_[A-Za-z0-9_-]{16,80}$/.test(key)) {
    return apiError(401, 'invalid_api_key', 'That API key is not valid.')
  }

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('api_keys')
    .select('id, is_active, scopes')
    .eq('key', key)
    .maybeSingle()

  if (!data) return apiError(401, 'invalid_api_key', 'That API key is not valid.')
  if (!data.is_active) return apiError(403, 'key_disabled', 'This API key has been disabled.')
  if (!(data.scopes as string[]).includes(scope)) {
    return apiError(403, 'insufficient_scope', `This API key cannot access "${scope}" data.`)
  }

  // Usage stats are recorded after the response is sent, so they never slow the request.
  after(async () => {
    await supabase.rpc('increment_api_key_usage', { p_key_id: data.id })
  })

  return null
}
