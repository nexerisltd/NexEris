import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { ProfileEditForm } from '@/components/profile/ProfileEditForm'

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
  const isOwnerOrAdmin =
    currentUser.authUserId === profile.auth_user_id || currentUser.role === 'admin'

  if (!isOwnerOrAdmin) {
    redirect(`/${username}`)
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
          <ProfileEditForm profile={profile} isAdmin={currentUser.role === 'admin'} />
        </div>
      </div>
    </main>
  )
}