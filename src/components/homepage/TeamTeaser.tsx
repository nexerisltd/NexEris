import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProfileCard } from './ProfileCard'
import type { PublicProfile } from '@/lib/data/profiles'
import { Reveal } from '@/components/ui/Reveal'

export function TeamTeaser({ profiles }: { profiles: PublicProfile[] }) {
  const preview = profiles.slice(0, 3)

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.2em] text-[var(--color-accent-bright)]">
            Team
          </span>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
            Meet {profiles.length} {profiles.length === 1 ? 'member' : 'members'}
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          {preview.length === 0 ? (
            <div className="glass mt-10 rounded-2xl px-6 py-16 text-center">
              <p className="text-sm text-[var(--color-text-muted)]">No profiles yet.</p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {preview.map((profile, index) => (
                <ProfileCard key={profile.id} profile={profile} index={index} />
              ))}
            </div>
          )}
        </Reveal>

        <Reveal delay={0.25} className="mt-10 flex justify-center">
          <Link
            href="/team"
            className="glass flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)]/40"
          >
            View the full team
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}