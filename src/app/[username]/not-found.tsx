'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { UserX } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="glass mx-auto flex h-20 w-20 items-center justify-center rounded-full"
        >
          <UserX className="h-8 w-8 text-[var(--color-accent-bright)]" />
        </motion.div>

        <span className="mt-6 block font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.2em] text-[var(--color-accent-bright)]">
          404
        </span>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-text)]">
          No one here by that name
        </h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          This profile doesn&apos;t exist, or the username has changed.
        </p>
        <Link
          href="/"
          className="glass mt-8 inline-block rounded-xl px-6 py-3 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)]/40"
        >
          Back to the team directory
        </Link>
      </motion.div>
    </main>
  )
}