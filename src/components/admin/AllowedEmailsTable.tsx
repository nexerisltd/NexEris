'use client'

import { useState, useTransition } from 'react'
import { addAllowedEmail, removeAllowedEmail, updateAllowedEmailRole } from '@/lib/actions/admin'
import { ROLE_LABELS, type ProfileRole } from '@/lib/roles'

interface AllowedEmail {
  id: string
  email: string
  role: ProfileRole
}

export function AllowedEmailsTable({
  emails,
  isSuperAdmin,
}: {
  emails: AllowedEmail[]
  isSuperAdmin: boolean
}) {
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<ProfileRole>('member')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await addAllowedEmail(newEmail, newRole)
      if (result.success) {
        setNewEmail('')
      } else {
        setError(result.error ?? 'Failed to add email.')
      }
    })
  }

  function handleRoleChange(id: string, role: ProfileRole) {
    startTransition(async () => {
      await updateAllowedEmailRole(id, role)
    })
  }

  function handleRemove(id: string, email: string) {
    if (!confirm(`Remove ${email} from the allowlist?`)) return
    startTransition(async () => {
      await removeAllowedEmail(id)
    })
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="glass mb-6 flex flex-wrap items-end gap-3 rounded-2xl p-5">
        <div className="flex-1" style={{ minWidth: '200px' }}>
          <label className="mb-1.5 block text-xs text-[var(--color-text-muted)]">Email</label>
          <input
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="input"
            placeholder="name@company.com"
          />
        </div>
        {isSuperAdmin ? (
          <div>
            <label className="mb-1.5 block text-xs text-[var(--color-text-muted)]">Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as ProfileRole)}
              style={{ colorScheme: 'dark' }}
              className="input"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        ) : (
          <p className="pb-2.5 text-xs text-[var(--color-text-muted)]">New emails are added as Members.</p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-bright)] disabled:opacity-50"
        >
          Add email
        </button>
      </form>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="glass overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {emails.map((e) => (
              <tr key={e.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-5 py-3 text-[var(--color-text)]">{e.email}</td>
                <td className="px-5 py-3">
                  {isSuperAdmin ? (
                    <select
                      value={e.role}
                      onChange={(ev) => handleRoleChange(e.id, ev.target.value as ProfileRole)}
                      style={{ colorScheme: 'dark' }}
                      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-text)]"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  ) : (
                    <span className="text-xs text-[var(--color-text-muted)]">{ROLE_LABELS[e.role]}</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  {isSuperAdmin && (
                    <button
                      onClick={() => handleRemove(e.id, e.email)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}