import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser()

  if (currentUser.role !== 'admin') {
    redirect('/login?redirectTo=/admin')
  }

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.2em] text-[var(--color-accent-bright)]">
          Admin
        </span>
        <nav className="glass mt-4 flex w-fit gap-1 rounded-xl p-1">
          <Link href="/admin" className="rounded-lg px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]">Overview</Link>
          <Link href="/admin/members" className="rounded-lg px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]">Members</Link>
          <Link href="/admin/allowed-emails" className="rounded-lg px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]">Allowed Emails</Link>
        </nav>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
} 