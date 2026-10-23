import type { NextRequest } from 'next/server'
import { apiError, apiJson, preflight, requireApiKey } from '@/lib/api-auth'
import { getProfilesByUsernames } from '@/lib/data/profiles'
import { teamMemberShape } from '@/lib/api-shapes'

export const OPTIONS = preflight

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const denied = await requireApiKey(request, 'team')
  if (denied) return denied

  const { username } = await params
  const [profile] = await getProfilesByUsernames([username.toLowerCase()])
  if (!profile) return apiError(404, 'not_found', 'No team member with that username.')

  return apiJson({ data: teamMemberShape(profile, request.nextUrl.origin) })
}
