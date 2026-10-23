'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import type { PublicProfile } from '@/lib/data/profiles'

const MotionLink = motion.create(Link)

export function ProfileCard({
  profile,
  index = 0,
}: {
  profile: PublicProfile
  index?: number
}) {
  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <MotionLink
      href={`/${profile.username}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="badge-card glass group relative flex flex-col rounded-2xl p-5 transition-colors duration-300 hover:border-[var(--color-accent)]/40"
    >
      <div className="flex items-start gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-[var(--color-accent)]/50">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface-hover)] font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--color-text)]">
              {initials}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <h3 className="truncate font-[family-name:var(--font-display)] text-base font-semibold text-[var(--color-text)]">
            {profile.full_name}
          </h3>
          <p className="truncate text-sm text-[var(--color-text-muted)]">
            {profile.position ?? 'Team Member'}
          </p>
        </div>
      </div>

      {profile.bio && (
        <p className="mt-4 line-clamp-2 text-sm text-[var(--color-text-muted)]">
          {profile.bio}
        </p>
      )}

      <div className="perforation mt-5 mb-3" />

      <div className="flex items-center justify-between text-xs">
        <span className="rounded-full bg-[var(--color-surface-hover)] px-2.5 py-1 text-[var(--color-text-muted)]">
          {profile.department ?? 'General'}
        </span>
        <span className="flex items-center gap-1 font-[family-name:var(--font-data)] text-[var(--color-accent-bright)]">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {profile.nex_id ?? '—'}
        </span>
      </div>
    </MotionLink>
  )
}