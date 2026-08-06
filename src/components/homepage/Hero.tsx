'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { TypewriterText } from '@/components/ui/TypewriterText'

interface HeroProps {
  isSignedIn: boolean
  username?: string
}

export function Hero({ isSignedIn, username }: HeroProps) {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-28 sm:pt-36">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-float absolute left-1/2 top-[-10%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[var(--color-accent)]/20 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mx-auto max-w-3xl text-center"
      >
        <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.25em] text-[var(--color-accent-bright)]">
          NexEris Directory
        </span>

        <p className="mt-4 font-[family-name:var(--font-data)] text-base text-[var(--color-text-muted)] sm:text-lg">
          Crafted by{' '}
          <TypewriterText
            texts={['Arabi Islam', 'MR. ARX']}
            className="text-lg font-semibold text-[var(--color-accent-bright)] sm:text-xl"
          />
        </p>

        <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-semibold leading-[1.15] text-[var(--color-text)] sm:text-5xl">
          Every person behind NexEris,
          <br className="hidden sm:block" /> verified and in one place.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-sm text-[var(--color-text-muted)] sm:text-lg">
          Browse the team, find who owns what, and reach out directly — no gatekeeping, just a clear map of who&apos;s who.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/team" className="rounded-xl bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-bright)]">
            Browse the team
          </Link>
          {isSignedIn ? (
            <Link href={`/${username}`} className="glass rounded-xl px-6 py-3 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)]/40">
              My Profile
            </Link>
          ) : (
            <Link href="/login" className="glass rounded-xl px-6 py-3 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)]/40">
              Member sign in
            </Link>
          )}
        </div>
      </motion.div>
    </section>
  )
}