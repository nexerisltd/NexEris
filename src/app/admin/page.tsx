import { createServiceClient } from '@/lib/supabase/service'
import { requireStaffPage } from '@/lib/permissions'

export default async function AdminOverviewPage() {
  await requireStaffPage()
  const supabase = createServiceClient()

  async function countRole(role: string) {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', role)
    return count ?? 0
  }

  const [members, admins, superAdmins] = await Promise.all([
    countRole('member'),
    countRole('admin'),
    countRole('super_admin'),
  ])

  const { count: totalAllowed } = await supabase
    .from('allowed_members')
    .select('*', { count: 'exact', head: true })

  const stats = [
    { label: 'Total Profiles', value: members + admins + superAdmins },
    { label: 'Members', value: members },
    { label: 'Admins', value: admins },
    { label: 'Super Admins', value: superAdmins },
    { label: 'Allowed Emails', value: totalAllowed ?? 0 },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      {stats.map((s) => (
        <div key={s.label} className="glass rounded-2xl p-6">
          <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-text)]">
            {s.value}
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
