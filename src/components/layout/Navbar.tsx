import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { MobileMenu } from './MobileMenu'

export async function Navbar() {
  const currentUser = await getCurrentUser()

  return (
    <header className="glass sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--color-text)]">
          NexAuras
        </Link>

        <nav className="hidden items-center gap-5 text-sm sm:flex">
          <Link href="/" className="nav-link text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Home
          </Link>
          <Link href="/team" className="nav-link text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Team
          </Link>

          {currentUser.role === 'guest' && (
            <Link href="/login" className="nav-link text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
              Sign in
            </Link>
          )}

          {(currentUser.role === 'member' || currentUser.role === 'admin') && (
            <>
              <Link href={`/${currentUser.profile?.username}`} className="nav-link text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                My Profile
              </Link>
              {currentUser.role === 'admin' && (
                <Link href="/admin" className="nav-link text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  Admin
                </Link>
              )}
              <SignOutButton />
            </>
          )}

          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <MobileMenu role={currentUser.role} username={currentUser.profile?.username} />
        </div>
      </div>
    </header>
  )
}