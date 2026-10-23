export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-20 pt-28" aria-busy="true" aria-live="polite">
      <div className="h-3 w-24 animate-pulse rounded bg-[var(--color-surface-hover)]" />
      <div className="mt-4 h-9 w-2/3 max-w-md animate-pulse rounded-lg bg-[var(--color-surface-hover)]" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]" />
        ))}
      </div>
    </main>
  )
}
