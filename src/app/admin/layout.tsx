import Link from 'next/link'
import { requireStaffPage } from '@/lib/permissions'
import { isSuperAdmin, ROLE_LABELS } from '@/lib/roles'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await requireStaffPage()
  const roleLabel = currentUser.role === 'guest' ? '' : ROLE_LABELS[currentUser.role]

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.2em] text-[var(--color-accent-bright)]">
          {isSuperAdmin(currentUser.role) ? 'Super Admin' : 'Admin'}
        </span>
        <nav className="glass mt-4 flex w-fit gap-1 rounded-xl p-1">
          <Link href="/admin" className="rounded-lg px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]">Overview</Link>
          <Link href="/admin/members" className="rounded-lg px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]">Members</Link>
          <Link href="/admin/allowed-emails" className="rounded-lg px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]">Allowed Emails</Link>
          <Link href="/admin/api-keys" className="rounded-lg px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]">API Keys</Link>
        </nav>
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">Signed in as {roleLabel}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}
