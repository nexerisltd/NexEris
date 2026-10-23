import { Mail } from 'lucide-react'
import { company } from '@/lib/company'
import { Reveal } from '@/components/ui/Reveal'

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-20 px-6 py-20">
      <Reveal className="glass mx-auto max-w-3xl rounded-3xl px-6 py-14 text-center sm:px-12">
        <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.2em] text-[var(--color-accent-bright)]">
          Contact
        </span>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
          Let&apos;s build something together.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-[var(--color-text-muted)] sm:text-base">
          Have a project, idea or partnership in mind? Reach out to the {company.name} team.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {company.email && (
            <a
              href={`mailto:${company.email}`}
              className="flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-bright)]"
            >
              <Mail className="h-4 w-4" /> {company.email}
            </a>
          )}
          <a
            href={company.github}
            target="_blank"
            rel="noopener noreferrer"
            className="glass rounded-xl px-6 py-3 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)]/40"
          >
            GitHub
          </a>
        </div>
      </Reveal>
    </section>
  )
}
