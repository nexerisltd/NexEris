import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import { requireStaffPage } from '@/lib/permissions'
import { isSuperAdmin } from '@/lib/roles'
import { ApiKeysManager } from '@/components/admin/ApiKeysManager'
import type { ApiKeyRow } from '@/lib/api-keys'
import { siteUrl } from '@/lib/company'

export const metadata = { title: 'API Keys — NexEris LTD' }

const ENDPOINTS = [
  { path: '/api/v1/team', scope: 'Team', desc: 'All team members' },
  { path: '/api/v1/team/{username}', scope: 'Team', desc: 'One team member' },
  { path: '/api/v1/products', scope: 'Products', desc: 'All products, with developers and links' },
  { path: '/api/v1/products/{slug}', scope: 'Products', desc: 'One product' },
]

export default async function AdminApiKeysPage() {
  const currentUser = await requireStaffPage('/admin/api-keys')
  const canManage = isSuperAdmin(currentUser.role)

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('api_keys')
    .select('id, name, key, scopes, is_active, created_at, last_used_at, request_count')
    .order('created_at', { ascending: false })

  const base = siteUrl

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-text)]">
        API Keys
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">
        Keys let other websites and apps read this website&apos;s team and product data. The API is read-only and only returns
        information that is already public on the site.{' '}
        {canManage
          ? 'As a Super Admin you can create, disable and delete keys.'
          : 'You can view and copy keys. Only a Super Admin can create, disable or delete them.'}
      </p>

      <div className="mt-6">
        <ApiKeysManager keys={(data ?? []) as ApiKeyRow[]} isSuperAdmin={canManage} />
      </div>

      <section className="glass mt-10 rounded-2xl p-6">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-text)]">
          Using the API
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Base URL:{' '}
          <code className="font-[family-name:var(--font-data)] text-[var(--color-text)]">{base}</code>. Send the key in the{' '}
          <code className="font-[family-name:var(--font-data)] text-[var(--color-text)]">Authorization: Bearer</code> header (or{' '}
          <code className="font-[family-name:var(--font-data)] text-[var(--color-text)]">X-API-Key</code>).
        </p>

        <ul className="mt-4 divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)]">
          {ENDPOINTS.map((e) => (
            <li key={e.path} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <span className="flex items-center gap-3">
                <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-[family-name:var(--font-data)] text-xs text-emerald-400">GET</span>
                <code className="font-[family-name:var(--font-data)] text-xs text-[var(--color-text)]">{e.path}</code>
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">{e.desc} · needs {e.scope} access</span>
            </li>
          ))}
        </ul>

        <pre className="mt-4 overflow-x-auto rounded-xl bg-[var(--color-surface-hover)] p-4 font-[family-name:var(--font-data)] text-xs text-[var(--color-text)]">
{`curl ${base}/api/v1/products \\
  -H "Authorization: Bearer YOUR_API_KEY"

// JavaScript
const res = await fetch("${base}/api/v1/team", {
  headers: { Authorization: "Bearer YOUR_API_KEY" },
});
const { data } = await res.json();`}
        </pre>

        <p className="mt-4 text-sm">
          <Link href="/docs/api" className="text-[var(--color-accent-bright)] hover:underline">
            Read the full developer guide &rarr;
          </Link>{' '}
          <span className="text-xs text-[var(--color-text-muted)]">(public — safe to send to developers together with their key)</span>
        </p>

        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          Anyone who has a key can use it, and a key placed in a public website&apos;s code can be seen by its visitors. Disable a
          key here if it is ever misused.
        </p>
      </section>
    </div>
  )
}
