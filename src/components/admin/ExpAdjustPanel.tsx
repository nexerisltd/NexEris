'use client'

import { useState, useTransition } from 'react'
import { adjustExpPoints } from '@/lib/actions/admin'

export function ExpAdjustPanel({
  profileId,
  username,
  initialExp,
}: {
  profileId: string
  username: string
  initialExp: number
}) {
  const [total, setTotal] = useState(initialExp)
  const [amount, setAmount] = useState('10')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function adjust(sign: 1 | -1) {
    const value = Math.abs(Math.round(Number(amount)))
    if (!value) {
      setMessage({ type: 'error', text: 'Enter a valid EXP amount.' })
      return
    }
    startTransition(async () => {
      const result = await adjustExpPoints(profileId, sign * value, username)
      if (result.success && typeof result.total === 'number') {
        setTotal(result.total)
        setMessage({ type: 'success', text: `${sign === 1 ? 'Added' : 'Removed'} ${value} EXP.` })
      } else {
        setMessage({ type: 'error', text: result.error ?? 'Could not update EXP.' })
      }
    })
  }

  return (
    <div>
      <div className="input flex flex-wrap items-center justify-between gap-3">
        <span className="font-[family-name:var(--font-data)] text-[var(--color-text)]">
          {total.toLocaleString()} EXP
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-20 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-text)]"
          />
          <button
            type="button"
            onClick={() => adjust(1)}
            disabled={isPending}
            className="rounded-lg bg-[var(--color-accent)] px-3 py-1 text-xs font-medium text-white hover:bg-[var(--color-accent-bright)] disabled:opacity-50"
          >
            + Add
          </button>
          <button
            type="button"
            onClick={() => adjust(-1)}
            disabled={isPending}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1 text-xs font-medium text-[var(--color-text)] hover:border-red-400/50 hover:text-red-400 disabled:opacity-50"
          >
            − Remove
          </button>
        </div>
      </div>
      {message && (
        <p className={`mt-2 text-xs ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}
