'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { updateProfile, checkUsernameAvailable } from '@/lib/actions/profile'
import { adjustExpPoints } from '@/lib/actions/admin'
import { CoverPositionEditor } from './CoverPositionEditor'
import { Toast } from '@/components/ui/Toast'
import type { Profile } from '@/lib/types'

export function ProfileEditForm({ profile, isAdmin }: { profile: Profile; isAdmin: boolean }) {
  const [form, setForm] = useState({
    full_name: profile.full_name ?? '',
    username: profile.username ?? '',
    position: profile.position ?? '',
    department: profile.department ?? '',
    pronouns: profile.pronouns ?? '',
    bio: profile.bio ?? '',
    portfolio_url: profile.portfolio_url ?? '',
    github_username: profile.github_username ?? '',
    avatar_url: profile.avatar_url ?? '',
    cover_url: profile.cover_url ?? '',
    cover_position: profile.cover_position ?? 50,
    whatsapp: profile.whatsapp ?? '',
    facebook: profile.facebook ?? '',
    instagram: profile.instagram ?? '',
  })

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  )
  const [copied, setCopied] = useState(false)

  const [expTotal, setExpTotal] = useState(profile.exp_points ?? 0)
  const [expAmount, setExpAmount] = useState('10')
  const [isExpPending, startExpTransition] = useTransition()

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!message) return
    const timeout = setTimeout(() => setMessage(null), 3000)
    return () => clearTimeout(timeout)
  }, [message])

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))

    if (field === 'username') {
      setUsernameStatus('idle')
      if (debounceRef.current) clearTimeout(debounceRef.current)

      if (value === profile.username || value.length < 3) return

      debounceRef.current = setTimeout(async () => {
        setUsernameStatus('checking')
        const available = await checkUsernameAvailable(value, profile.id)
        setUsernameStatus(available ? 'available' : 'taken')
      }, 500)
    }
  }

  async function handleImageUpload(
    file: File,
    bucket: 'avatars' | 'covers',
    setUploading: (v: boolean) => void,
    field: 'avatar_url' | 'cover_url'
  ) {
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${profile.auth_user_id}/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })

    if (error) {
      setMessage({ type: 'error', text: `Upload failed: ${error.message}` })
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    setForm((prev) => ({
      ...prev,
      [field]: data.publicUrl,
      ...(field === 'cover_url' ? { cover_position: 50 } : {}),
    }))
    setUploading(false)
  }

  function handleCopyNexId() {
    if (!profile.nex_id) return
    navigator.clipboard.writeText(profile.nex_id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function handleExpAdjust(sign: 1 | -1) {
    const amount = Math.abs(Math.round(Number(expAmount)))
    if (!amount) {
      setMessage({ type: 'error', text: 'Enter a valid EXP amount.' })
      return
    }

    startExpTransition(async () => {
      const result = await adjustExpPoints(profile.id, sign * amount, profile.username)
      if (result.success && typeof result.total === 'number') {
        setExpTotal(result.total)
        setMessage({
          type: 'success',
          text: `${sign === 1 ? 'Added' : 'Removed'} ${amount} EXP.`,
        })
      } else {
        setMessage({ type: 'error', text: result.error ?? 'Could not update EXP.' })
      }
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    if (usernameStatus === 'taken') {
      setMessage({ type: 'error', text: 'That username is already taken.' })
      return
    }

    startTransition(async () => {
      const result = await updateProfile(profile.id, form)
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile saved.' })
      } else {
        setMessage({ type: 'error', text: result.error ?? 'Something went wrong.' })
      }
    })
  }

  return (
    <>
      <Toast message={message} />

      <form onSubmit={handleSubmit} className="space-y-6 pb-24">
        <div>
          <p className="mb-2 text-xs text-[var(--color-text-muted)]">Cover image (optional)</p>
          {form.cover_url ? (
            <CoverPositionEditor
              imageUrl={form.cover_url}
              position={form.cover_position}
              onPositionChange={(pos) => setForm((prev) => ({ ...prev, cover_position: pos }))}
            />
          ) : (
            <div className="flex h-44 w-full items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
              No cover image yet
            </div>
          )}
          <label className="mt-2 inline-block cursor-pointer text-xs text-[var(--color-accent-bright)] underline">
            {uploadingCover ? 'Uploading…' : form.cover_url ? 'Change cover' : 'Upload cover'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingCover}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file, 'covers', setUploadingCover, 'cover_url')
              }}
            />
          </label>
        </div>
        
        <div>
          <p className="mb-2 text-xs text-[var(--color-text-muted)]">Profile picture</p>
          <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-[var(--color-accent)]/50">
            {form.avatar_url ? (
              <Image src={form.avatar_url} alt="Avatar" fill className="object-cover" />
            ) : (
              <div className="h-full w-full bg-[var(--color-surface-hover)]" />
            )}
          </div>
          <label className="mt-2 block cursor-pointer text-xs text-[var(--color-accent-bright)] underline">
            {uploadingAvatar ? 'Uploading…' : 'Change'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingAvatar}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file, 'avatars', setUploadingAvatar, 'avatar_url')
              }}
            />
          </label>
        </div>

        <Field label="Full name">
          <input
            value={form.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            className="input"
            required
          />
        </Field>

        <Field
          label="Username"
          hint={
            usernameStatus === 'checking'
              ? 'Checking…'
              : usernameStatus === 'available'
                ? 'Username available'
                : usernameStatus === 'taken'
                  ? 'Username already taken'
                  : undefined
          }
          hintColor={
            usernameStatus === 'available' ? 'good' : usernameStatus === 'taken' ? 'bad' : undefined
          }
        >
          <input
            value={form.username}
            onChange={(e) =>
              handleChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
            }
            className="input"
            required
          />
        </Field>

        <div>
          <label className="mb-1.5 block text-xs text-[var(--color-text-muted)]">Nex ID</label>
          <div className="input flex items-center justify-between gap-2">
            <span className="select-all font-[family-name:var(--font-data)] text-[var(--color-text)]">
              {profile.nex_id ? profile.nex_id.replace(/^Nex/, '') : 'Generated after first save'}
            </span>
            {profile.nex_id && (
              <button
                type="button"
                onClick={handleCopyNexId}
                className="shrink-0 text-xs text-[var(--color-accent-bright)] hover:underline"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Auto-generated from username, position &amp; department. Copying always includes the
            &quot;Nex&quot; prefix.
          </p>
        </div>

        {isAdmin && (
          <div>
            <label className="mb-1.5 block text-xs text-[var(--color-text-muted)]">
              EXP Points (admin only)
            </label>
            <div className="input flex flex-wrap items-center justify-between gap-3">
              <span className="font-[family-name:var(--font-data)] text-[var(--color-text)]">
                {expTotal.toLocaleString()} EXP
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-20 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-text)]"
                />
                <button
                  type="button"
                  onClick={() => handleExpAdjust(1)}
                  disabled={isExpPending}
                  className="rounded-lg bg-[var(--color-accent)] px-3 py-1 text-xs font-medium text-white hover:bg-[var(--color-accent-bright)] disabled:opacity-50"
                >
                  + Add
                </button>
                <button
                  type="button"
                  onClick={() => handleExpAdjust(-1)}
                  disabled={isExpPending}
                  className="rounded-lg border border-[var(--color-border)] px-3 py-1 text-xs font-medium text-[var(--color-text)] hover:border-red-400/50 hover:text-red-400 disabled:opacity-50"
                >
                  − Remove
                </button>
              </div>
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Adjusts this member&apos;s EXP immediately — separate from &quot;Save changes&quot;
              below. Shown on their public profile as a progress bar.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Pronouns">
            <input
              value={form.pronouns}
              onChange={(e) => handleChange('pronouns', e.target.value)}
              className="input"
            />
          </Field>
          <div />
          <Field label="Position" hint={!isAdmin ? 'Only admins can change this' : undefined}>
            <input
              value={form.position}
              onChange={(e) => handleChange('position', e.target.value)}
              className="input disabled:opacity-50"
              disabled={!isAdmin}
            />
          </Field>
          <Field label="Department" hint={!isAdmin ? 'Only admins can change this' : undefined}>
            <input
              value={form.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className="input disabled:opacity-50"
              disabled={!isAdmin}
            />
          </Field>
        </div>

        <Field label="Bio">
          <textarea
            value={form.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            rows={4}
            className="input resize-none"
          />
        </Field>

        <Field label="Portfolio URL">
          <input
            value={form.portfolio_url}
            onChange={(e) => handleChange('portfolio_url', e.target.value)}
            className="input"
            placeholder="https://"
          />
        </Field>

        <Field label="GitHub username">
          <input
            value={form.github_username}
            onChange={(e) => handleChange('github_username', e.target.value)}
            className="input"
            placeholder="octocat"
          />
        </Field>

        <Field label="WhatsApp (required)">
          <input
            value={form.whatsapp}
            onChange={(e) => handleChange('whatsapp', e.target.value)}
            className="input"
            placeholder="+8801XXXXXXXXX"
            required
          />
        </Field>

        <Field label="Facebook (optional)">
          <input
            value={form.facebook}
            onChange={(e) => handleChange('facebook', e.target.value)}
            className="input"
            placeholder="username or full profile link"
          />
        </Field>

        <Field label="Instagram (optional)">
          <input
            value={form.instagram}
            onChange={(e) => handleChange('instagram', e.target.value)}
            className="input"
            placeholder="username or full profile link"
          />
        </Field>
      </form>

      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <div className="flex gap-2">
          <button
            type="submit"
            form="__ignored"
            onClick={handleSubmit}
            disabled={isPending || uploadingAvatar || uploadingCover}
            className="rounded-full bg-[var(--color-accent)] px-5 py-2 text-xs font-medium text-white shadow-lg shadow-black/30 transition-colors hover:bg-[var(--color-accent-bright)] disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save changes'}
          </button>
          <Link
            href={`/${profile.username}`}
            className="glass flex items-center justify-center rounded-full px-5 py-2 text-xs font-medium text-[var(--color-text)] shadow-lg shadow-black/30 hover:border-[var(--color-accent)]/40"
          >
            Cancel
          </Link>
        </div>
      </div>
    </>
  )
}

function Field({
  label,
  hint,
  hintColor,
  children,
}: {
  label: string
  hint?: string
  hintColor?: 'good' | 'bad'
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-[var(--color-text-muted)]">{label}</label>
      {children}
      {hint && (
        <p
          className={`mt-1 text-xs ${
            hintColor === 'good'
              ? 'text-emerald-400'
              : hintColor === 'bad'
                ? 'text-red-400'
                : 'text-[var(--color-text-muted)]'
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  )
}