'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CodeTabs({ tabs }: { tabs: { label: string; code: string }[] }) {
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)
  const current = tabs[active] ?? tabs[0]

  async function copy() {
    try {
      await navigator.clipboard.writeText(current.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <div className="glass overflow-hidden rounded-xl">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-3 py-2">
        <div className="flex flex-wrap gap-1">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-md px-3 py-1 text-xs transition-colors ${
                i === active
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-[family-name:var(--font-data)] text-xs leading-relaxed text-[var(--color-text)]">
        {current.code}
      </pre>
    </div>
  )
}
