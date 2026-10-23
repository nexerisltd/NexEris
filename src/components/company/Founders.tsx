import Link from 'next/link'
import Image from 'next/image'
import { founders } from '@/lib/company'
import type { PublicProfile } from '@/lib/data/profiles'
import { Reveal } from '@/components/ui/Reveal'

export function Founders({ profiles }: { profiles: PublicProfile[] }) {
  const people = founders.map((f) => ({
    ...f,
    profile: profiles.find((p) => p.username === f.username) ?? null,
  }))

  return (
    <section id="developers" className="scroll-mt-20 px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.2em] text-[var(--color-accent-bright)]">
            Developers
          </span>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
            Built by two, as one
          </h2>
          <p className="max-w-xl text-sm text-[var(--color-text-muted)] sm:text-base">
            NexEris was built as a true collaboration between{' '}
            <span className="text-[var(--color-text)]">{founders[0].name}</span> and{' '}
            <span className="text-[var(--color-text)]">{founders[1].name}</span>.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-12 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-6">
          {people.map((person, i) => {
            const card = (
              <div className="flex w-56 flex-col items-center text-center">
                <div className="relative h-32 w-32 overflow-hidden rounded-full ring-4 ring-[var(--color-accent)]/40 transition-transform duration-300 group-hover:scale-105">
                  {person.profile?.avatar_url ? (
                    <Image
                      src={person.profile.avatar_url}
                      alt={person.name}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface-hover)] font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-text)]">
                      {person.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>
                  )}
                </div>
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-text)]">
                  {person.name}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {person.profile?.position ?? person.role}
                </p>
                <p className="mt-1 font-[family-name:var(--font-data)] text-xs text-[var(--color-accent-bright)]">
                  @{person.username}
                </p>
              </div>
            )

            return (
              <div key={person.username} className="flex flex-col items-center gap-8 sm:flex-row sm:gap-6">
                {i > 0 && (
                  <span
                    aria-hidden
                    className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-accent-bright)]"
                  >
                    ×
                  </span>
                )}
                {person.profile ? (
                  <Link href={`/${person.username}`} className="group">
                    {card}
                  </Link>
                ) : (
                  <div className="group">{card}</div>
                )}
              </div>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
