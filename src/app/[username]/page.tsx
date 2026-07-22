import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Globe, Mail, CheckCircle2, Pencil, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { whatsappUrl, facebookUrl, instagramUrl } from '@/lib/social-links'
import { LikeButton } from '@/components/profile/LikeButton'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, position, bio')
    .eq('username', username)
    .maybeSingle()

  if (!profile) {
    return { title: 'Profile not found — NexAuras' }
  }

  return {
    title: `${profile.full_name} — NexAuras`,
    description: profile.bio ?? `${profile.full_name}'s profile on the NexAuras team directory.`,
  }
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.113.793-.26.793-.577 0-.285-.01-1.04-.016-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.42-1.304.762-1.604-2.665-.303-5.467-1.333-5.467-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 013.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.655 1.653.243 2.873.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.807 5.624-5.48 5.92.43.372.823 1.104.823 2.226 0 1.606-.014 2.902-.014 3.297 0 .32.19.694.8.576C20.565 21.796 24 17.298 24 12c0-6.63-5.373-12-12-12z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

export default async function ProfilePage({
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
  const supabaseForLikes = await createClient()
  const { count: likeCount } = await supabaseForLikes
    .from('profile_likes')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profile.id)

  let initialLiked = false
  if (currentUser.authUserId) {
    const { data: likeRow } = await supabaseForLikes
      .from('profile_likes')
      .select('id')
      .eq('profile_id', profile.id)
      .eq('liker_auth_user_id', currentUser.authUserId)
      .maybeSingle()
    initialLiked = !!likeRow
  }

  const isOwnerOrAdmin =
    currentUser.authUserId === profile.auth_user_id || currentUser.role === 'admin'

  const initials = profile.full_name
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <main className="min-h-screen pb-20">
      <div className="relative h-64 w-full overflow-hidden sm:h-96">
        {profile.cover_url ? (
          <Image
            src={profile.cover_url}
            alt=""
            fill
            className="object-cover"
            style={{ objectPosition: `center ${profile.cover_position ?? 50}%` }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[var(--color-accent)]/20 to-transparent" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-transparent" />
      </div>

      <div className="mx-auto -mt-16 max-w-3xl px-6">
        <div className="flex items-end justify-between">
          <div className="relative h-32 w-32 overflow-hidden rounded-full ring-4 ring-[var(--color-bg)]">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface-hover)] font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-text)]">
                {initials}
              </div>
            )}
          </div>

          {isOwnerOrAdmin && (
            <Link
              href={`/${profile.username}/edit`}
              className="glass mb-2 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)]/40"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit profile
            </Link>
          )}
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-text)]">
              {profile.full_name}
            </h1>
            {profile.pronouns && (
              <span className="text-sm text-[var(--color-text-muted)]">{profile.pronouns}</span>
            )}
          </div>
          <p className="mt-1 text-[var(--color-text-muted)]">
            {profile.position ?? 'Team Member'}
            {profile.department ? ` · ${profile.department}` : ''}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-[family-name:var(--font-data)] text-[var(--color-text-muted)]">
              @{profile.username}
            </span>
            {profile.nex_id && (
              <span className="flex items-center gap-1 rounded-full bg-[var(--color-surface-hover)] px-2.5 py-1 font-[family-name:var(--font-data)] text-xs text-[var(--color-accent-bright)]">
                <CheckCircle2 className="h-3 w-3" />
                {profile.nex_id}
              </span>
            )}
          </div>

          {profile.bio && (
            <p className="mt-6 max-w-2xl text-[var(--color-text)]">{profile.bio}</p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {profile.portfolio_url && (
              <a
                href={profile.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-bright)]"
              >
                <Globe className="h-4 w-4" />
                Portfolio
              </a>
            )}
            {profile.github_username && (
              <a
                href={`https://github.com/${profile.github_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="glass flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)]/40"
              >
                <GithubIcon />
                GitHub
              </a>
            )}
            {profile.whatsapp && (
              <a
                href={whatsappUrl(profile.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-400"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            )}
            {profile.facebook && (
              <a
                href={facebookUrl(profile.facebook)}
                target="_blank"
                rel="noopener noreferrer"
                className="glass flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)]/40"
              >
                <FacebookIcon />
                Facebook
              </a>
            )}
            {profile.instagram && (
              <a
                href={instagramUrl(profile.instagram)}
                target="_blank"
                rel="noopener noreferrer"
                className="glass flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)]/40"
              >
            
                <InstagramIcon />
                Instagram
              </a>
            )}
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="glass flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)]/40"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
            )}
            <LikeButton
              profileId={profile.id}
              initialCount={likeCount ?? 0}
              initialLiked={initialLiked}
              isSignedIn={!!currentUser.authUserId}
            />
          </div>
        </div>
      </div>
    </main>
  )
}