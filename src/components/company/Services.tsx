import { services } from '@/lib/company'
import { Reveal } from '@/components/ui/Reveal'

export function Services() {
  return (
    <section id="services" className="scroll-mt-20 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.2em] text-[var(--color-accent-bright)]">
            What we do
          </span>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
            Services
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <div className="glass card-hover h-full rounded-2xl p-6">
                <s.icon className="h-6 w-6 text-[var(--color-accent-bright)]" />
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-base font-semibold text-[var(--color-text)]">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">{s.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
