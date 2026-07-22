import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

function hashToDigits(input: string, salt: number): string {
  let hash = 5381
  const salted = `${input}::${salt}`
  for (let i = 0; i < salted.length; i++) {
    hash = (hash * 33) ^ salted.charCodeAt(i)
  }
  const unsigned = hash >>> 0
  const expanded = (unsigned.toString() + unsigned.toString()).padStart(12, '0')
  return expanded.slice(0, 12)
}

async function generateUniqueNexId(
  serviceClient: ReturnType<typeof createServiceClient>,
  seed: string
): Promise<string> {
  for (let salt = 0; salt < 50; salt++) {
    const candidate = `Nex${hashToDigits(seed, salt)}`
    const { data } = await serviceClient
      .from('profiles')
      .select('id')
      .eq('nex_id', candidate)
      .maybeSingle()
    if (!data) return candidate
  }
  return `Nex${Date.now().toString().slice(-12).padStart(12, '0')}`
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo') ?? '/'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const user = data.user
  const email = user.email

  if (!email) {
    return NextResponse.redirect(`${origin}/login?error=no_email`)
  }

  const serviceClient = createServiceClient()

  const { data: allowedEntry } = await serviceClient
    .from('allowed_members')
    .select('email, role')
    .eq('email', email)
    .maybeSingle()

  if (!allowedEntry) {
    return NextResponse.redirect(`${origin}/?guest=1`)
  }

  const { data: existingProfile } = await serviceClient
    .from('profiles')
    .select('id, username')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (existingProfile) {
    return NextResponse.redirect(`${origin}${redirectTo}`)
  }

  const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
  let username = baseUsername
  let suffix = 0

  while (true) {
    const { data: taken } = await serviceClient
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()
    if (!taken) break
    suffix += 1
    username = `${baseUsername}${suffix}`
  }

  // Nex ID is generated ONCE, right here at account creation, and never
  // touched again by the app afterward — only a direct database edit
  // can change it.
  const nexId = await generateUniqueNexId(serviceClient, `${username}|${Date.now()}`)

  const { error: insertError } = await serviceClient.from('profiles').insert({
    auth_user_id: user.id,
    email,
    username,
    nex_id: nexId,
    full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? email.split('@')[0],
    avatar_url: user.user_metadata?.avatar_url ?? null,
    role: allowedEntry.role,
  })

  if (insertError) {
    console.error('Profile creation failed:', insertError)
    return NextResponse.redirect(`${origin}/login?error=profile_creation_failed`)
  }

  return NextResponse.redirect(`${origin}/dashboard?welcome=1`)
}