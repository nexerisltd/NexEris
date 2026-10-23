import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { company } from '@/lib/company'
import { Logo } from '@/components/ui/Logo'

export async function Footer() {
  const currentUser = await getCurrentUser()
  const link = 'text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]'
  const heading = 'font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.2em] text-[var(--color-text)]'

  return (
    <footer className="border-t border-[var(--color-border)] px-6 pb-8 pt-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--color-text)]">
              <Logo size={30} />
              {company.name}
            </Link>
            <p className="mt-4 max-w-sm text-sm text-[var(--color-text-muted)]">{company.intro}</p>
          </div>

          <div>
            <p className={heading}>Explore</p>
            <ul className="mt-4 space-y-3">
              <li><Link href="/products" className={link}>Products</Link></li>
              <li><Link href="/#services" className={link}>Services</Link></li>
              <li><Link href="/about" className={link}>About</Link></li>
              <li><Link href="/team" className={link}>Team</Link></li>
              <li><Link href="/docs/api" className={link}>API docs</Link></li>
            </ul>
          </div>

          <div>
            <p className={heading}>Connect</p>
            <ul className="mt-4 space-y-3">
              <li><Link href="/#contact" className={link}>Contact</Link></li>
              <li>
                <a href={company.github} target="_blank" rel="noopener noreferrer" className={link}>
                  GitHub
                </a>
              </li>
              {company.email && (
                <li><a href={`mailto:${company.email}`} className={link}>{company.email}</a></li>
              )}
              <li>
                {currentUser.role === 'guest' ? (
                  <Link href="/login" className={link}>Member sign in</Link>
                ) : (
                  <Link href={`/${currentUser.profile?.username}`} className={link}>My Profile</Link>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[var(--color-border)] pt-6">
          <p className="text-xs text-[var(--color-text-muted)]">
            &copy; {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
