import { createClient } from '@/lib/supabase/server'
import { MembersTable } from '@/components/admin/MembersTable'

export default async function AdminMembersPage() {
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true })

  return (
    <div>
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-text)]">
        Members
      </h1>
      <MembersTable profiles={profiles ?? []} />
    </div>
  )
}