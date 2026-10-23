import type { NextRequest } from 'next/server'
import { apiJson, preflight, requireApiKey } from '@/lib/api-auth'
import { getAllProfiles } from '@/lib/data/profiles'
import { teamMemberShape } from '@/lib/api-shapes'

export const OPTIONS = preflight

export async function GET(request: NextRequest) {
  const denied = await requireApiKey(request, 'team')
  if (denied) return denied

  const origin = request.nextUrl.origin
  const profiles = await getAllProfiles()
  return apiJson({ data: profiles.map((p) => teamMemberShape(p, origin)), meta: { count: profiles.length } })
}
