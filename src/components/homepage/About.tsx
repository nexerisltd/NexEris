'use client'

import { motion } from 'framer-motion'

export function About() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-[1fr_auto] sm:items-center"
      >
        <div>
          <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.2em] text-[var(--color-accent-bright)]">
            About
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
            One directory, every department.
          </h2>
          <p className="mt-4 max-w-2xl text-[var(--color-text-muted)]">
            NexEris brings every team member into a single, living directory. Profiles are self-maintained by the people in them, so what you see here is always current — not an HR spreadsheet frozen in time.
          </p>
        </div>
        <div className="h-px w-24 self-center bg-[var(--color-accent)]/40 sm:h-24 sm:w-px" />
      </motion.div>
    </section>
  )
}