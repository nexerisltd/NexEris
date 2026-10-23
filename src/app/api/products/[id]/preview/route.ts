import type { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { hardenForServing } from '@/lib/preview'

export const runtime = 'nodejs'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Serves the saved snapshot of a product's page. It is third-party HTML, so it is
// locked into an opaque, script-free sandbox: it cannot read our cookies or session,
// and it cannot navigate the parent page.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const kind = request.nextUrl.searchParams.get('kind')

  if (!UUID.test(id) || (kind !== 'production' && kind !== 'web')) {
    return new Response('Not found', { status: 404 })
  }

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('product_previews')
    .select('html, status')
    .eq('product_id', id)
    .eq('kind', kind)
    .maybeSingle()

  if (!data?.html || data.status !== 'ok') {
    return new Response('No snapshot saved yet.', { status: 404 })
  }

  return new Response(hardenForServing(data.html), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // No scripts, no forms; links may open a new tab that is NOT sandboxed.
      'Content-Security-Policy':
        "sandbox allow-popups allow-popups-to-escape-sandbox; script-src 'none'",
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      // The page URL carries a ?v=<snapshot time>, so a refresh gets a new URL.
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
