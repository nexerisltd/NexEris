'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { X, Search } from 'lucide-react'
import type { PublicProfile } from '@/lib/data/profiles'

function Avatar({ p, size = 28 }: { p: PublicProfile; size?: number }) {
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-hover)] text-[10px] font-semibold text-[var(--color-text)]"
      style={{ width: size, height: size }}
    >
      {p.full_name.slice(0, 1).toUpperCase()}
      {p.avatar_url && (
        <Image src={p.avatar_url} alt="" fill sizes={`${size}px`} className="object-cover" />
      )}
    </span>
  )
}

export function DeveloperPicker({
  profiles,
  selectedIds,
  onChange,
}: {
  profiles: PublicProfile[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const selected = useMemo(
    () => selectedIds.map((id) => profiles.find((p) => p.id === id)).filter((p): p is PublicProfile => !!p),
    [selectedIds, profiles]
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^@/, '')
    return profiles
      .filter((p) => !selectedIds.includes(p.id))
      .filter(
        (p) =>
          !q ||
          p.full_name.toLowerCase().includes(q) ||
          p.username.toLowerCase().includes(q) ||
          (p.nex_id ?? '').toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [profiles, selectedIds, query])

  function add(id: string) {
    onChange([...selectedIds, id])
    setQuery('')
  }

  return (
    <div>
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selected.map((p) => (
            <span
              key={p.id}
              className="flex items-center gap-2 rounded-full bg-[var(--color-surface-hover)] py-1 pl-1 pr-2 text-xs text-[var(--color-text)]"
            >
              <Avatar p={p} size={22} />
              {p.full_name}
              <button
                type="button"
                onClick={() => onChange(selectedIds.filter((id) => id !== p.id))}
                aria-label={`Remove ${p.full_name}`}
                className="text-[var(--color-text-muted)] hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder="Search by Nex ID, name or username…"
          className="input pl-9"
        />

        {open && (
          <ul className="absolute z-50 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-1 shadow-2xl">
            {results.length === 0 ? (
              <li className="px-3 py-2 text-xs text-[var(--color-text-muted)]">No matching members.</li>
            ) : (
              results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => add(p.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-[var(--color-surface-hover)]"
                  >
                    <Avatar p={p} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-[var(--color-text)]">{p.full_name}</span>
                      <span className="block truncate font-[family-name:var(--font-data)] text-xs text-[var(--color-text-muted)]">
                        @{p.username} · {p.nex_id ?? 'no Nex ID'}
                      </span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
