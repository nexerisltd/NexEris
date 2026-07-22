'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { ProfileCard } from './ProfileCard'
import type { PublicProfile } from '@/lib/data/profiles'

export function TeamSection({ profiles }: { profiles: PublicProfile[] }) {
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('all')

  const departments = useMemo(() => {
    const unique = new Set(
      profiles.map((p) => p.department).filter((d): d is string => Boolean(d))
    )
    return Array.from(unique).sort()
  }, [profiles])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    return profiles.filter((p) => {
      const matchesDepartment = department === 'all' || p.department === department
      if (!matchesDepartment) return false

      if (!q) return true

      return [p.full_name, p.username, p.nex_id, p.position]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    })
  }, [query, department, profiles])

  return (
    <section id="team" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.2em] text-[var(--color-accent-bright)]">
              Team
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
              {filtered.length} {filtered.length === 1 ? 'member' : 'members'}
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {departments.length > 0 && (
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="glass rounded-xl px-4 py-3 text-sm text-[var(--color-text)] sm:w-48"
              >
                <option value="all">All departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            )}

            <div className="glass flex w-full items-center gap-2 rounded-xl px-4 py-3 sm:w-80">
              <Search className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, username, Nex ID, position…"
                className="w-full bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass mt-10 rounded-2xl px-6 py-16 text-center"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.5 }}
              className="mx-auto flex h-14 w-14 items-center justify-center"
            >
              <Search className="h-8 w-8 text-[var(--color-text-muted)]" />
            </motion.div>
            <p className="mt-4 font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-text)]">
              {query ? `No one matches "${query}"` : 'No one in this department'}
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Try a different name, username, Nex ID, or department.
            </p>
          </motion.div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((profile, index) => (
              <ProfileCard key={profile.id} profile={profile} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}