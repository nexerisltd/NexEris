'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.2em] text-red-400">
        Something broke
      </span>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-text)]">
        This page hit a snag.
      </h1>
      <p className="mt-2 max-w-md text-sm text-[var(--color-text-muted)]">
        Try again, or head back to the team directory. If this keeps happening, let an admin know.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => reset()}
          className="rounded-xl bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-accent-bright)]"
        >
          Try again
        </button>
        <a
          href="/"
          className="glass rounded-xl px-6 py-3 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)]/40"
        >
          Back to directory
        </a>
      </div>
    </main>
  )
}