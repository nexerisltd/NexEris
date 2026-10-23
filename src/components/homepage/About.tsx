import Link from 'next/link'
import { values } from '@/lib/company'
import { Reveal } from '@/components/ui/Reveal'

export function About() {
  return (
    <section id="about" className="scroll-mt-20 border-y border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.2em] text-[var(--color-accent-bright)]">
            About
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-text)] sm:text-4xl">
            A small team with a big product list.
          </h2>
          <p className="mt-4 max-w-2xl text-[var(--color-text-muted)]">
            NexEris LTD designs, builds and runs its own software products across web, desktop and chat platforms. Every member has a public profile in our team directory, maintained by the person themselves.
          </p>
          <Link
            href="/about"
            className="mt-6 inline-block text-sm text-[var(--color-accent-bright)] underline-offset-4 hover:underline"
          >
            More about us &rarr;
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08}>
              <div className="glass card-hover h-full rounded-2xl p-6">
                <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-[var(--color-text)]">{v.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">{v.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
