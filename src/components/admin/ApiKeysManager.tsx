'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Eye, EyeOff, Check } from 'lucide-react'
import { createApiKey, setApiKeyActive, deleteApiKey } from '@/lib/actions/api-keys'
import { API_SCOPES, SCOPE_LABELS, maskKey, type ApiKeyRow, type ApiScope } from '@/lib/api-keys'

function day(iso: string | null) {
  return iso ? new Date(iso).toISOString().slice(0, 10) : '—'
}

export function ApiKeysManager({
  keys,
  isSuperAdmin,
}: {
  keys: ApiKeyRow[]
  isSuperAdmin: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [scopes, setScopes] = useState<ApiScope[]>([...API_SCOPES])
  const [error, setError] = useState<string | null>(null)
  const [shown, setShown] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState<string | null>(null)

  function toggleScope(s: ApiScope) {
    setScopes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  function toggleShown(id: string) {
    setShown((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function copy(row: ApiKeyRow) {
    try {
      await navigator.clipboard.writeText(row.key)
      setCopied(row.id)
      setTimeout(() => setCopied((c) => (c === row.id ? null : c)), 1500)
    } catch {
      setError('Could not copy — select the key and copy it manually.')
    }
  }

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (!result.success) setError(result.error ?? 'Something went wrong.')
      router.refresh()
    })
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    run(async () => {
      const result = await createApiKey(name, scopes)
      if (result.success) setName('')
      return result
    })
  }

  return (
    <div className="space-y-6">
      {isSuperAdmin && (
        <form onSubmit={handleCreate} className="glass flex flex-wrap items-end gap-4 rounded-2xl p-5">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1.5 block text-xs text-[var(--color-text-muted)]">Key name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mobile app, Marketing site"
              className="input"
            />
          </div>
          <div>
            <p className="mb-1.5 text-xs text-[var(--color-text-muted)]">Can read</p>
            <div className="flex gap-4 py-2">
              {API_SCOPES.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                  <input type="checkbox" checked={scopes.includes(s)} onChange={() => toggleScope(s)} />
                  {SCOPE_LABELS[s]}
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-bright)] disabled:opacity-50"
          >
            Create key
          </button>
        </form>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</div>
      )}

      <div className="glass overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">API key</th>
              <th className="px-5 py-3 font-medium">Access</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Last used</th>
              <th className="px-5 py-3 font-medium">Requests</th>
              {isSuperAdmin && <th className="px-5 py-3" />}
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 && (
              <tr>
                <td colSpan={isSuperAdmin ? 7 : 6} className="px-5 py-8 text-center text-[var(--color-text-muted)]">
                  No API keys yet.{isSuperAdmin ? ' Create the first one above.' : ''}
                </td>
              </tr>
            )}
            {keys.map((k) => (
              <tr key={k.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-5 py-3">
                  <p className="text-[var(--color-text)]">{k.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Created {day(k.created_at)}</p>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <code className="font-[family-name:var(--font-data)] text-xs text-[var(--color-text)]">
                      {shown.has(k.id) ? k.key : maskKey(k.key)}
                    </code>
                    <button
                      type="button"
                      onClick={() => toggleShown(k.id)}
                      aria-label={shown.has(k.id) ? 'Hide key' : 'Show key'}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    >
                      {shown.has(k.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => copy(k)}
                      aria-label="Copy key"
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    >
                      {copied === k.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {k.scopes.map((s) => (
                      <span key={s} className="rounded-full bg-[var(--color-surface-hover)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                        {SCOPE_LABELS[s] ?? s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs ${k.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                    {k.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-[var(--color-text-muted)]">{day(k.last_used_at)}</td>
                <td className="px-5 py-3 font-[family-name:var(--font-data)] text-xs text-[var(--color-text-muted)]">
                  {Number(k.request_count).toLocaleString('en-US')}
                </td>
                {isSuperAdmin && (
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => run(() => setApiKeyActive(k.id, !k.is_active))}
                        className="text-xs text-[var(--color-accent-bright)] hover:underline disabled:opacity-50"
                      >
                        {k.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          if (confirm(`Delete "${k.name}"? Anything using this key will stop working.`)) {
                            run(() => deleteApiKey(k.id))
                          }
                        }}
                        className="text-xs text-red-400 hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
