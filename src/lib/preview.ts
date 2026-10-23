import 'server-only'
import { lookup } from 'node:dns/promises'
import net from 'node:net'

const MAX_BYTES = 2 * 1024 * 1024
const TIMEOUT_MS = 8000
const MAX_REDIRECTS = 4

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number)
    return (
      a === 0 || a === 10 || a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    )
  }
  const v = ip.toLowerCase()
  if (v === '::1' || v === '::') return true
  if (v.startsWith('::ffff:')) {
    const rest = v.slice(7)
    return net.isIPv4(rest) ? isPrivateIp(rest) : true
  }
  return v.startsWith('fe80') || v.startsWith('fc') || v.startsWith('fd')
}

// Server-side fetching of a user-supplied URL: never allow internal addresses.
async function assertPublicUrl(url: URL) {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Only http(s) links are supported.')
  const host = url.hostname.replace(/^\[|\]$/g, '')
  const addresses = net.isIP(host) ? [{ address: host }] : await lookup(host, { all: true })
  if (addresses.length === 0 || addresses.some((a) => isPrivateIp(a.address))) {
    throw new Error('That address is not publicly reachable.')
  }
}

async function readCapped(res: Response): Promise<string> {
  if (!res.body) return ''
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > MAX_BYTES) {
      await reader.cancel()
      throw new Error('Page is too large to snapshot (over 2 MB).')
    }
    chunks.push(value)
  }
  return new TextDecoder('utf-8').decode(Buffer.concat(chunks))
}

function escapeAttr(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function prepare(html: string, baseUrl: string) {
  // A refresh tag would send the frame to the live site, so remove it.
  const cleaned = html.replace(/<meta[^>]+http-equiv=["']?refresh["']?[^>]*>/gi, '')
  // Our <base> comes first, so relative CSS/images load from the original site
  // and every link opens in a new tab instead of inside the preview.
  const base = `<base href="${escapeAttr(baseUrl)}" target="_blank">`
  return /<head[^>]*>/i.test(cleaned)
    ? cleaned.replace(/<head[^>]*>/i, (m) => m + base)
    : base + cleaned
}

/** Fetches a page once and returns self-contained HTML ready to be stored. */
export async function captureSnapshot(startUrl: string): Promise<string> {
  let current = new URL(startUrl)

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicUrl(current)

    const res = await fetch(current, {
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'User-Agent': 'NexEris-Preview/1.0', Accept: 'text/html,application/xhtml+xml' },
    })

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location')
      if (!location) throw new Error('Redirect without a destination.')
      current = new URL(location, current)
      continue
    }

    if (!res.ok) throw new Error(`The site responded with HTTP ${res.status}.`)
    const type = res.headers.get('content-type') ?? ''
    if (!type.includes('html')) throw new Error('That link is not a web page.')

    return prepare(await readCapped(res), current.toString())
  }

  throw new Error('Too many redirects.')
}

/**
 * Makes a stored snapshot safe and readable to serve. Scripts are removed: a page's
 * JavaScript would run at OUR url, and apps like Next.js then fail to boot and show
 * their own error screen. The server-rendered HTML + CSS is what we show instead.
 */
export function hardenForServing(html: string): string {
  const withoutScripts = html.replace(/<script\b[\s\S]*?<\/script\s*>/gi, '')

  // Entrance animations start at opacity:0 and rely on JS to fade in; without JS the
  // content would stay invisible, so show those elements in their final state.
  // The scrollbar inside the frame is the snapshot page's own, so style it here:
  // a slim, neutral-grey thumb on a transparent track works on dark and light pages.
  const thumb = 'rgba(140,150,170,.45)'
  const reveal =
    '<style>' +
    '[style*="opacity:0"],[style*="opacity: 0"]{opacity:1!important;transform:none!important}' +
    `*{scrollbar-width:thin;scrollbar-color:${thumb} transparent}` +
    '@supports not (scrollbar-color:auto){' +
    '::-webkit-scrollbar{width:8px;height:8px}' +
    '::-webkit-scrollbar-track{background:transparent}' +
    `::-webkit-scrollbar-thumb{background:${thumb};border-radius:9999px}` +
    '::-webkit-scrollbar-thumb:hover{background:rgba(140,150,170,.7)}}' +
    '</style>'

  return /<\/head\s*>/i.test(withoutScripts)
    ? withoutScripts.replace(/<\/head\s*>/i, (m) => reveal + m)
    : withoutScripts + reveal
}
