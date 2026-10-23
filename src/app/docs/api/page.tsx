import Link from 'next/link'
import { siteUrl } from '@/lib/company'
import { CodeTabs } from '@/components/ui/CodeTabs'
import { Footer } from '@/components/homepage/Footer'

export const metadata = {
  title: 'API Guide — NexEris LTD',
  description: 'How to use a NexEris API key to read team and product data from your own website or app.',
}

const SECTIONS = [
  ['overview', 'Overview'],
  ['get-a-key', 'Get a key'],
  ['authentication', 'Authentication'],
  ['endpoints', 'Endpoints'],
  ['responses', 'Responses'],
  ['errors', 'Errors'],
  ['examples', 'Code examples'],
  ['best-practices', 'Best practices'],
] as const

const ENDPOINTS = [
  { path: '/api/v1/team', scope: 'Team', desc: 'List every team member.' },
  { path: '/api/v1/team/{username}', scope: 'Team', desc: 'One team member, by username.' },
  { path: '/api/v1/products', scope: 'Products', desc: 'List every product, with developers and links.' },
  { path: '/api/v1/products/{slug}', scope: 'Products', desc: 'One product, by its URL slug.' },
]

const ERRORS = [
  ['401', 'missing_api_key', 'No key was sent. Add the Authorization (or X-API-Key) header.'],
  ['401', 'invalid_api_key', 'The key is misspelled or does not exist.'],
  ['403', 'key_disabled', 'A Super Admin disabled this key. Ask them for a new one.'],
  ['403', 'insufficient_scope', 'The key is not allowed to read this kind of data (for example a Team-only key calling /products).'],
  ['404', 'not_found', 'No team member or product matches that username / slug.'],
] as const

const TEAM_JSON = `{
  "data": {
    "username": "janedoe",
    "full_name": "Jane Doe",
    "nex_id": "Nex120239065712",
    "position": "Frontend Developer",
    "department": "Engineering",
    "bio": "Builds interfaces.",
    "avatar_url": "https://…/avatar.png",
    "profile_url": "${siteUrl}/janedoe"
  }
}`

const PRODUCT_JSON = `{
  "data": {
    "product_id": "NXP-001",
    "slug": "nexsync",
    "name": "NexSync",
    "type": "Web App",
    "description": "Synced audio rooms.",
    "logo_url": "https://…/logo.png",
    "links": {
      "repository": "https://github.com/…",
      "production": "https://…",
      "web": null
    },
    "developers": [ { "username": "janedoe", "full_name": "Jane Doe", … } ],
    "url": "${siteUrl}/products/nexsync"
  }
}`

const ERROR_JSON = `{
  "error": {
    "code": "invalid_api_key",
    "message": "That API key is not valid."
  }
}`

const EXAMPLES = [
  {
    label: 'cURL',
    code: `curl ${siteUrl}/api/v1/products \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
  },
  {
    label: 'JavaScript',
    code: `const res = await fetch("${siteUrl}/api/v1/products", {
  headers: { Authorization: "Bearer YOUR_API_KEY" },
});

if (!res.ok) {
  const { error } = await res.json();
  throw new Error(error.code + ": " + error.message);
}

const { data } = await res.json();
console.log(data.length + " products");`,
  },
  {
    label: 'Python',
    code: `import requests

res = requests.get(
    "${siteUrl}/api/v1/team",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    timeout=10,
)
res.raise_for_status()

for member in res.json()["data"]:
    print(member["full_name"], "-", member["position"])`,
  },
  {
    label: 'Flutter / Dart',
    code: `import 'dart:convert';
import 'package:http/http.dart' as http;

Future<List<dynamic>> fetchProducts() async {
  final res = await http.get(
    Uri.parse('${siteUrl}/api/v1/products'),
    headers: {'Authorization': 'Bearer YOUR_API_KEY'},
  );
  if (res.statusCode != 200) {
    throw Exception(jsonDecode(res.body)['error']['message']);
  }
  return jsonDecode(res.body)['data'] as List<dynamic>;
}`,
  },
]

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-14 scroll-mt-24 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-text)] sm:text-2xl"
    >
      {children}
    </h2>
  )
}

const code = 'rounded bg-[var(--color-surface-hover)] px-1.5 py-0.5 font-[family-name:var(--font-data)] text-xs text-[var(--color-text)]'
const p = 'mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]'

function Block({ children }: { children: string }) {
  return (
    <pre className="glass mt-4 overflow-x-auto rounded-xl p-4 font-[family-name:var(--font-data)] text-xs leading-relaxed text-[var(--color-text)]">
      {children}
    </pre>
  )
}

export default function ApiGuidePage() {
  return (
    <main>
      <div className="px-6 pb-16 pt-24 sm:pt-32">
        <div className="mx-auto max-w-3xl">
          <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.2em] text-[var(--color-accent-bright)]">
            Developers
          </span>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-text)] sm:text-5xl">
            NexEris API guide
          </h1>
          <p className="mt-4 text-[var(--color-text-muted)] sm:text-lg">
            Read NexEris team and product data from your own website or app, using an API key.
          </p>

          <nav className="mt-8 flex flex-wrap gap-2">
            {SECTIONS.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-text)]"
              >
                {label}
              </a>
            ))}
          </nav>

          <H2 id="overview">Overview</H2>
          <p className={p}>
            The API is <strong className="text-[var(--color-text)]">read-only</strong> and returns JSON. It only shares what is already public on
            the website — names, positions, bios, avatars and product details. Emails, roles and EXP are never included.
          </p>
          <p className={p}>
            Base URL: <code className={code}>{siteUrl}</code>
          </p>

          <H2 id="get-a-key">Get a key</H2>
          <p className={p}>
            Keys are created by a <strong className="text-[var(--color-text)]">Super Admin</strong> only, in the admin panel under{' '}
            <em>API Keys</em>. Ask a Super Admin for one and tell them what it is for (for example “Mobile app”). Each key is limited to{' '}
            <em>Team</em>, <em>Products</em>, or both.
          </p>
          <p className={p}>
            <strong className="text-[var(--color-text)]">Anyone who holds a key can use it</strong> — you do not need an account on the site. Treat it
            like a password, and ask for it to be disabled if it leaks.
          </p>

          <H2 id="authentication">Authentication</H2>
          <p className={p}>Send your key in a request header. Keys start with <code className={code}>nxk_live_</code>.</p>
          <Block>{`Authorization: Bearer nxk_live_YOUR_API_KEY`}</Block>
          <p className={p}>
            Or, if your tool cannot set <code className={code}>Authorization</code>, use <code className={code}>X-API-Key: nxk_live_YOUR_API_KEY</code>.
            Keys are not accepted in the URL, so they never end up in server logs or browser history.
          </p>

          <H2 id="endpoints">Endpoints</H2>
          <p className={p}>All endpoints use <code className={code}>GET</code>.</p>
          <ul className="glass mt-4 divide-y divide-[var(--color-border)] rounded-xl">
            {ENDPOINTS.map((e) => (
              <li key={e.path} className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-3">
                  <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-[family-name:var(--font-data)] text-xs text-emerald-400">GET</span>
                  <code className="font-[family-name:var(--font-data)] text-xs text-[var(--color-text)]">{e.path}</code>
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">{e.desc} Needs <em>{e.scope}</em> access.</span>
              </li>
            ))}
          </ul>

          <H2 id="responses">Responses</H2>
          <p className={p}>
            A successful response is <code className={code}>200</code> with a <code className={code}>data</code> field. Lists also include{' '}
            <code className={code}>meta.count</code>. Fields without a value are <code className={code}>null</code>.
          </p>
          <p className="mt-5 text-sm font-medium text-[var(--color-text)]">Team member — <code className={code}>/api/v1/team/janedoe</code></p>
          <Block>{TEAM_JSON}</Block>
          <p className="mt-5 text-sm font-medium text-[var(--color-text)]">Product — <code className={code}>/api/v1/products/nexsync</code></p>
          <Block>{PRODUCT_JSON}</Block>

          <H2 id="errors">Errors</H2>
          <p className={p}>Errors always look like this, with a machine-readable <code className={code}>code</code>:</p>
          <Block>{ERROR_JSON}</Block>
          <div className="glass mt-4 overflow-x-auto rounded-xl">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Code</th>
                  <th className="px-4 py-2.5 font-medium">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {ERRORS.map(([status, errCode, meaning]) => (
                  <tr key={errCode} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-4 py-2.5 font-[family-name:var(--font-data)] text-xs text-[var(--color-text)]">{status}</td>
                    <td className="px-4 py-2.5 font-[family-name:var(--font-data)] text-xs text-[var(--color-accent-bright)]">{errCode}</td>
                    <td className="px-4 py-2.5 text-xs text-[var(--color-text-muted)]">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <H2 id="examples">Code examples</H2>
          <p className={p}>Replace <code className={code}>YOUR_API_KEY</code> with the key you were given.</p>
          <div className="mt-4">
            <CodeTabs tabs={EXAMPLES} />
          </div>

          <H2 id="best-practices">Best practices</H2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--color-text-muted)]">
            <li>
              <strong className="text-[var(--color-text)]">Keep the key on a server when you can.</strong> A key written into a public website or
              app can be read by anyone who opens it. That is acceptable for this read-only public data, but a server-side call (or an
              environment variable) is safer.
            </li>
            <li>
              <strong className="text-[var(--color-text)]">Cache responses.</strong> Team and product data changes rarely. Responses allow caching for 60
              seconds; caching longer on your side saves requests.
            </li>
            <li>
              <strong className="text-[var(--color-text)]">Handle errors.</strong> Check the status code and show a fallback if the call fails — a
              disabled key returns <code className={code}>403</code>.
            </li>
            <li>
              <strong className="text-[var(--color-text)]">Rotating a key.</strong> Ask a Super Admin for a new key, switch your app to it, then ask for
              the old one to be disabled.
            </li>
            <li>
              <strong className="text-[var(--color-text)]">Be considerate.</strong> There is no fixed rate limit yet, but usage is tracked per key and keys
              that cause problems can be disabled.
            </li>
          </ul>

          <p className="mt-12 text-sm text-[var(--color-text-muted)]">
            Need a key or have a question?{' '}
            <Link href="/#contact" className="text-[var(--color-accent-bright)] hover:underline">
              Contact us
            </Link>
            .
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
