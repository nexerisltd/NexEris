import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { stack } from '@/lib/company'

interface HeroProps {
  isSignedIn: boolean
  username?: string
  productCount: number
  memberCount: number
}

export function Hero({ isSignedIn, username, productCount, memberCount }: HeroProps) {
  const stats = [
    { value: productCount, label: 'Products' },
    { value: memberCount, label: 'Team members' },
  ]

  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-28 sm:pb-28 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0" />
        <div className="animate-float absolute left-1/2 top-[-12%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[var(--color-accent)]/20 blur-[120px]" />
      </div>

      <div className="animate-fade-in-up mx-auto max-w-4xl text-center">
        <Link
          href="/about#developers"
          className="group inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1.5 text-xs text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-text)]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Built by Arabi Islam × MR. ARX
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>

        <h1 className="mt-8 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.1] text-[var(--color-text)] sm:text-6xl">
          We build software
          <br className="hidden sm:block" />{' '}
          <span className="text-gradient">people actually use.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-[var(--color-text-muted)] sm:text-lg">
          Web platforms, desktop apps, browser tools and bots — designed, shipped and maintained by one tight team.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/products"
            className="flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-7 py-3 text-sm font-medium text-white shadow-lg shadow-[var(--color-accent)]/20 transition-colors hover:bg-[var(--color-accent-bright)]"
          >
            See our products <ArrowRight className="h-4 w-4" />
          </Link>
          {isSignedIn ? (
            <Link href={`/${username}`} className="glass rounded-xl px-7 py-3 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)]/40">
              My Profile
            </Link>
          ) : (
            <Link href="/login" className="glass rounded-xl px-7 py-3 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)]/40">
              Member sign in
            </Link>
          )}
        </div>

        <div className="mx-auto mt-16 flex max-w-md items-center justify-center divide-x divide-[var(--color-border)]">
          {stats.map((s) => (
            <div key={s.label} className="flex-1 px-6">
              <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-text)]">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-xs text-[var(--color-text-muted)]">Built with</span>
          {stack.map((t) => (
            <span
              key={t}
              className="rounded-full border border-[var(--color-border)] px-3 py-1 font-[family-name:var(--font-data)] text-xs text-[var(--color-text-muted)]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
