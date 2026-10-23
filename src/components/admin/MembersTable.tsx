'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { changeProfileRole, deleteProfile } from '@/lib/actions/admin'
import type { Profile } from '@/lib/types'
import type { ProfileRole } from '@/lib/roles'
import { ROLE_LABELS } from '@/lib/roles'

export function MembersTable({
  profiles,
  isSuperAdmin,
  currentProfileId,
}: {
  profiles: Profile[]
  isSuperAdmin: boolean
  currentProfileId: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)

  function handleRoleChange(id: string, role: ProfileRole) {
    setPendingId(id)
    startTransition(async () => {
      await changeProfileRole(id, role)
      setPendingId(null)
    })
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name}'s profile? This cannot be undone.`)) return
    setPendingId(id)
    startTransition(async () => {
      await deleteProfile(id)
      setPendingId(null)
    })
  }

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
            <th className="px-5 py-3 font-medium">Name</th>
            <th className="px-5 py-3 font-medium">Username</th>
            <th className="px-5 py-3 font-medium">Role</th>
            <th className="px-5 py-3 font-medium">EXP</th>
            <th className="px-5 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => (
            <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0">
              <td className="px-5 py-3 text-[var(--color-text)]">{p.full_name}</td>
              <td className="px-5 py-3 font-[family-name:var(--font-data)] text-[var(--color-text-muted)]">
                @{p.username}
              </td>
              <td className="px-5 py-3">
                {isSuperAdmin && p.id !== currentProfileId ? (
                  <select
                    value={p.role}
                    disabled={isPending && pendingId === p.id}
                    onChange={(e) => handleRoleChange(p.id, e.target.value as ProfileRole)}
                    style={{ colorScheme: 'dark' }}
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-text)]"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                ) : (
                  <span className="text-xs text-[var(--color-text-muted)]">{ROLE_LABELS[p.role]}</span>
                )}
              </td>
              <td className="px-5 py-3 font-[family-name:var(--font-data)] text-xs text-[var(--color-text-muted)]">
                {(p.exp_points ?? 0).toLocaleString()}
              </td>
              <td className="px-5 py-3 text-right">
                <div className="flex items-center justify-end gap-4">
                  <Link href={`/${p.username}/edit`} className="text-xs text-[var(--color-accent-bright)] hover:underline">
                    {isSuperAdmin ? 'Edit' : 'EXP'}
                  </Link>
                  {isSuperAdmin && p.id !== currentProfileId && (
                    <button
                      onClick={() => handleDelete(p.id, p.full_name)}
                      disabled={isPending && pendingId === p.id}
                      className="text-xs text-red-400 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}