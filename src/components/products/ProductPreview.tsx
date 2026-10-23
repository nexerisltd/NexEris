'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { refreshProductPreview } from '@/lib/actions/products'

export interface PreviewItem {
  label: string
  url: string
  /** Our saved copy of the page; null when no snapshot exists yet. */
  snapshotSrc: string | null
  fetchedAt: string | null
  error: string | null
}

function formatTime(iso: string) {
  return `${new Date(iso).toISOString().slice(0, 16).replace('T', ' ')} UTC`
}

export function ProductPreview({
  items,
  title,
  productId,
  canRefresh,
}: {
  items: PreviewItem[]
  title: string
  productId: string
  canRefresh: boolean
}) {
  const router = useRouter()
  const [active, setActive] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const current = items[active] ?? items[0]
  if (!current) return null

  let host = current.url
  try {
    host = new URL(current.url).host
  } catch {}

  function refresh() {
    setMessage(null)
    startTransition(async () => {
      const result = await refreshProductPreview(productId)
      setMessage(result.success ? 'Preview refreshed.' : (result.error ?? 'Could not refresh.'))
      router.refresh()
    })
  }

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
        </div>

        {items.length > 1 && (
          <div className="flex gap-1 rounded-lg bg-[var(--color-surface)] p-0.5">
            {items.map((item, i) => (
              <button
                key={item.url}
                type="button"
                onClick={() => setActive(i)}
                className={`rounded-md px-3 py-1 text-xs ${
                  i === active
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        <span className="min-w-0 flex-1 truncate rounded-md bg-[var(--color-surface)] px-3 py-1 font-[family-name:var(--font-data)] text-xs text-[var(--color-text-muted)]">
          {host}
        </span>

        {canRefresh && (
          <button
            type="button"
            onClick={refresh}
            disabled={isPending}
            className="flex items-center gap-1 text-xs text-[var(--color-accent-bright)] hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isPending ? 'animate-spin' : ''}`} />
            {isPending ? 'Refreshing…' : 'Refresh preview'}
          </button>
        )}

        <a
          href={current.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-[var(--color-accent-bright)] hover:underline"
        >
          Open <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {current.snapshotSrc ? (
        <iframe
          key={current.snapshotSrc}
          src={current.snapshotSrc}
          title={`${title} — ${current.label} preview`}
          loading="lazy"
          sandbox="allow-popups allow-popups-to-escape-sandbox"
          className="h-[420px] w-full bg-white sm:h-[560px]"
        />
      ) : (
        <div className="flex h-48 flex-col items-center justify-center gap-2 px-6 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            {current.error
              ? `The preview couldn't be saved: ${current.error}`
              : 'No preview has been saved for this link yet.'}
          </p>
          {canRefresh && (
            <p className="text-xs text-[var(--color-text-muted)]">Use &quot;Refresh preview&quot; to try again.</p>
          )}
        </div>
      )}

      <p className="border-t border-[var(--color-border)] px-4 py-2 text-xs text-[var(--color-text-muted)]">
        {message ??
          (current.fetchedAt && current.snapshotSrc
            ? `Static copy saved ${formatTime(current.fetchedAt)} — open the site for the interactive version. Updates only when a Super Admin refreshes it.`
            : 'Previews are saved copies, not fetched live.')}
      </p>
    </div>
  )
}
