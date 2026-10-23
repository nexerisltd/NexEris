import { createServiceClient } from '@/lib/supabase/service'
import { requireStaffPage } from '@/lib/permissions'
import { isSuperAdmin } from '@/lib/roles'
import { MembersTable } from '@/components/admin/MembersTable'

export default async function AdminMembersPage() {
  const currentUser = await requireStaffPage('/admin/members')
  const supabase = createServiceClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true })

  return (
    <div>
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-text)]">
        Members
      </h1>
      <MembersTable
        profiles={profiles ?? []}
        isSuperAdmin={isSuperAdmin(currentUser.role)}
        currentProfileId={currentUser.profile?.id ?? null}
      />
    </div>
  )
}
