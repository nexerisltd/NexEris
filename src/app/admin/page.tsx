import { createClient } from '@/lib/supabase/server'

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  const { count: totalMembers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'member')

  const { count: totalAdmins } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin')

  const { count: totalAllowed } = await supabase
    .from('allowed_members')
    .select('*', { count: 'exact', head: true })

  const totalProfiles = (totalMembers ?? 0) + (totalAdmins ?? 0)

  const stats = [
    { label: 'Total Profiles', value: totalProfiles },
    { label: 'Members', value: totalMembers ?? 0 },
    { label: 'Admins', value: totalAdmins ?? 0 },
    { label: 'Allowed Emails', value: totalAllowed ?? 0 },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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