import Link from 'next/link'
import { TypewriterText } from '@/components/ui/TypewriterText'
import { getCurrentUser } from '@/lib/auth'

export async function Footer() {
  const currentUser = await getCurrentUser()

  return (
    <footer className="border-t border-[var(--color-border)] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--color-text)]">
          NexEris
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          &copy; {new Date().getFullYear()} NexEris. All rights reserved.
        </p>
        {currentUser.role === 'guest' ? (
          <a href="/login" className="text-xs text-[var(--color-text-muted)] underline-offset-4 hover:text-[var(--color-text)] hover:underline">
            Member sign in
          </a>
        ) : (
          <Link href={`/${currentUser.profile?.username}`} className="text-xs text-[var(--color-text-muted)] underline-offset-4 hover:text-[var(--color-text)] hover:underline">
            My Profile
          </Link>
        )}
      </div>
      <div className="mt-6 flex justify-center">
        <p className="font-[family-name:var(--font-data)] text-xs text-[var(--color-text-muted)]">
          Developed by <TypewriterText texts={['Arabi Islam']} className="text-[var(--color-accent-bright)]" />
        </p>
      </div>
    </footer>
  )
}