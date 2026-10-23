import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { isStaff, isSuperAdmin } from '@/lib/roles'
import { ProfileEditForm } from '@/components/profile/ProfileEditForm'
import { ExpAdjustPanel } from '@/components/admin/ExpAdjustPanel'

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  if (!profile) {
    notFound()
  }

  const currentUser = await getCurrentUser()
  const isOwner = currentUser.authUserId === profile.auth_user_id
  const isSA = isSuperAdmin(currentUser.role)
  const isAdminOnly = currentUser.role === 'admin' && !isOwner

  // Owner or Super Admin: full profile form. Admin (viewing someone else): EXP only.
  if (!isOwner && !isSA && !isStaff(currentUser.role)) {
    redirect(`/${username}`)
  }

  if (isAdminOnly) {
    return (
      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.2em] text-[var(--color-accent-bright)]">
            Admin
          </span>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-text)]">
            {profile.full_name}&apos;s EXP
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Admins can add or remove EXP. Other profile details can only be edited by the member or a Super Admin.
          </p>
          <div className="glass mt-8 rounded-2xl p-6 sm:p-8">
            <ExpAdjustPanel
              profileId={profile.id}
              username={profile.username}
              initialExp={profile.exp_points ?? 0}
            />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.2em] text-[var(--color-accent-bright)]">
          Editing
        </span>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-text)]">
          {profile.full_name}&apos;s profile
        </h1>

        <div className="glass mt-8 rounded-2xl p-6 sm:p-8">
          <ProfileEditForm
            profile={profile}
            canManage={isSA}
            canAdjustExp={isStaff(currentUser.role)}
          />
        </div>
      </div>
    </main>
  )
}
