import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { MobileMenu } from './MobileMenu'
import { NavLinks } from './NavLinks'
import { Logo } from '@/components/ui/Logo'
import { isSignedInMember } from '@/lib/roles'

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--color-text)]">
      <Logo size={30} priority />
      NexEris LTD
    </Link>
  )
}

/** Shown instantly while the real navbar waits for the sign-in check. */
export function NavbarFallback() {
  return (
    <header className="glass glass-blur sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Brand />
      </div>
    </header>
  )
}

export async function Navbar() {
  const currentUser = await getCurrentUser()

  return (
    <header className="glass glass-blur sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Brand />

        <nav className="hidden items-center gap-1 text-sm sm:flex">
          <NavLinks role={currentUser.role} username={currentUser.profile?.username} />

          <div className="ml-3 flex items-center gap-3">
            {isSignedInMember(currentUser.role) && <SignOutButton />}
            <ThemeToggle />
            <Link
              href="/#contact"
              className="rounded-lg bg-[var(--color-accent)] px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--color-accent-bright)]"
            >
              Contact
            </Link>
          </div>
        </nav>

        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <MobileMenu role={currentUser.role} username={currentUser.profile?.username} />
        </div>
      </div>
    </header>
  )
}