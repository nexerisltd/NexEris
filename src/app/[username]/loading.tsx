export default function Loading() {
  return (
    <main className="min-h-screen pb-20">
      <div className="h-56 w-full animate-pulse bg-[var(--color-surface-hover)] sm:h-72" />
      <div className="mx-auto -mt-16 max-w-3xl px-6">
        <div className="h-32 w-32 animate-pulse rounded-full bg-[var(--color-surface)] ring-4 ring-[var(--color-bg)]" />
        <div className="mt-6 animate-pulse space-y-3">
          <div className="h-8 w-64 rounded-lg bg-[var(--color-surface-hover)]" />
          <div className="h-4 w-40 rounded-lg bg-[var(--color-surface-hover)]" />
          <div className="mt-6 h-4 w-full max-w-lg rounded-lg bg-[var(--color-surface-hover)]" />
          <div className="h-4 w-2/3 max-w-md rounded-lg bg-[var(--color-surface-hover)]" />
        </div>
      </div>
    </main>
  )
}