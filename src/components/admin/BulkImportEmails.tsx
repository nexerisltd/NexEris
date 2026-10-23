'use client'

import { useState, useTransition, useRef } from 'react'
import { Upload } from 'lucide-react'
import { bulkAddAllowedEmails } from '@/lib/actions/admin'
import type { ProfileRole } from '@/lib/roles'

interface ParsedEntry {
  email: string
  role: ProfileRole
}

function parseCsv(text: string): ParsedEntry[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const entries: ParsedEntry[] = []

  for (const line of lines) {
    const parts = line.split(',').map((p) => p.trim())
    const email = parts[0]?.toLowerCase()

    // skip header row
    if (email === 'email') continue
    if (!email || !email.includes('@')) continue

    const raw = parts[1]?.toLowerCase().replace(/[\s-]/g, '_')
    const role: ProfileRole = raw === 'super_admin' ? 'super_admin' : raw === 'admin' ? 'admin' : 'member'
    entries.push({ email, role })
  }

  return entries
}

export function BulkImportEmails({ canAssignRoles }: { canAssignRoles: boolean }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ added: number; skipped: number; errors: string[] } | null>(
    null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setText(event.target?.result as string)
    }
    reader.readAsText(file)
  }

  function handleImport() {
    setResult(null)
    const entries = parseCsv(text)

    if (entries.length === 0) {
      setResult({ added: 0, skipped: 0, errors: ['No valid emails found.'] })
      return
    }

    startTransition(async () => {
      const res = await bulkAddAllowedEmails(entries)
      setResult(res)
      if (res.added > 0) setText('')
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)]/40"
      >
        <Upload className="h-4 w-4" />
        Bulk import (CSV)
      </button>
    )
  }

  return (
    <div className="glass mb-6 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--color-text)]">Bulk import emails</p>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          Close
        </button>
      </div>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        Upload a CSV or paste rows below. Format: <code>email,role</code> — role is optional,
        defaults to &quot;member&quot;. Example:
        {!canAssignRoles && ' Only a Super Admin can assign admin roles — all rows are added as members.'}
      </p>
      <pre className="mt-2 rounded-lg bg-[var(--color-surface-hover)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
{`email,role
jane@company.com,member
admin@company.com,admin`}
      </pre>

      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-accent)]/40">
        <Upload className="h-3.5 w-3.5" />
        Choose CSV file
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="email,role&#10;jane@company.com,member"
        className="input mt-3 resize-none font-[family-name:var(--font-data)]"
      />

      {result && (
        <div className="mt-3 rounded-lg border border-[var(--color-border)] px-4 py-2 text-xs text-[var(--color-text-muted)]">
          <p>
            ✅ {result.added} added · ⏭️ {result.skipped} skipped (duplicates/invalid)
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-1 list-disc pl-4 text-red-400">
              {result.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={isPending || !text.trim()}
        className="mt-3 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-bright)] disabled:opacity-50"
      >
        {isPending ? 'Importing…' : 'Import'}
      </button>
    </div>
  )
}