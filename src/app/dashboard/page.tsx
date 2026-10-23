import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { ProfileEditForm } from '@/components/profile/ProfileEditForm'
import { isStaff, isSuperAdmin } from '@/lib/roles'

export default async function DashboardPage() {
  const currentUser = await getCurrentUser()

  if (currentUser.role === 'guest') {
    redirect('/login?redirectTo=/dashboard')
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', currentUser.authUserId)
    .single()

  if (!profile) {
    redirect('/login?redirectTo=/dashboard')
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.2em] text-[var(--color-accent-bright)]">
          Dashboard
        </span>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-text)]">
          Edit your profile
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          This is what other people see at{' '}
          <span className="font-[family-name:var(--font-data)] text-[var(--color-accent-bright)]">
            /{profile.username}
          </span>
        </p>

        <div className="glass mt-8 rounded-2xl p-6 sm:p-8">
          <ProfileEditForm
            profile={profile}
            canManage={isSuperAdmin(currentUser.role)}
            canAdjustExp={isStaff(currentUser.role)}
          />
        </div>
      </div>
    </main>
  )
}