import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { company, founders, values } from '@/lib/company'
import { getProfilesByUsernames } from '@/lib/data/profiles'
import { Founders } from '@/components/company/Founders'
import { Footer } from '@/components/homepage/Footer'
import { Reveal } from '@/components/ui/Reveal'

export const metadata = {
  title: 'About — NexEris LTD',
  description: 'About NexEris LTD and the people who built it.',
}

export default async function AboutPage() {
  const profiles = await getProfilesByUsernames(founders.map((f) => f.username))

  return (
    <main>
      <section className="relative overflow-hidden px-6 pb-16 pt-28 sm:pt-36">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="animate-float absolute left-1/2 top-[-10%] h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-[var(--color-accent)]/20 blur-[120px]" />
        </div>
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.25em] text-[var(--color-accent-bright)]">
            About
          </span>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-semibold leading-[1.15] text-[var(--color-text)] sm:text-5xl">
            {company.name}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[var(--color-text-muted)] sm:text-lg">{company.intro}</p>
        </Reveal>
      </section>

      <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.2em] text-[var(--color-accent-bright)]">
              What we believe
            </span>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="glass h-full rounded-2xl p-6">
                  <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-[var(--color-text)]">{v.title}</h3>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)]">{v.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Founders profiles={profiles} />

      <section className="px-6 pb-20">
        <Reveal className="flex flex-wrap justify-center gap-3">
          <Link href="/team" className="glass flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)]/40">
            Meet the team <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/products" className="glass flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)]/40">
            See our products <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>

      <Footer />
    </main>
  )
}
