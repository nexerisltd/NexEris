export default function Loading() {
  return (
    <main className="min-h-screen px-6 py-20">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="mx-auto h-4 w-40 rounded-full bg-[var(--color-surface-hover)]" />
        <div className="mx-auto mt-6 h-12 w-3/4 rounded-lg bg-[var(--color-surface-hover)]" />
        <div className="mx-auto mt-4 h-6 w-1/2 rounded-lg bg-[var(--color-surface-hover)]" />

        <div className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 shrink-0 rounded-full bg-[var(--color-surface-hover)]" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 w-2/3 rounded bg-[var(--color-surface-hover)]" />
                  <div className="h-3 w-1/2 rounded bg-[var(--color-surface-hover)]" />
                </div>
              </div>
              <div className="mt-4 h-3 w-full rounded bg-[var(--color-surface-hover)]" />
              <div className="mt-2 h-3 w-2/3 rounded bg-[var(--color-surface-hover)]" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}