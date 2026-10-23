'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createProduct, updateProduct, deleteProduct, type ProductInput } from '@/lib/actions/products'
import { DeveloperPicker } from './DeveloperPicker'
import type { PublicProfile } from '@/lib/data/profiles'
import type { Product } from '@/lib/data/products'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-[var(--color-text-muted)]">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p>}
    </div>
  )
}

export function ProductForm({
  product,
  profiles,
}: {
  product?: Product
  profiles: PublicProfile[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(!!product)

  const [form, setForm] = useState<ProductInput>({
    product_id: product?.product_id ?? '',
    slug: product?.slug ?? '',
    name: product?.name ?? '',
    kind: product?.kind ?? '',
    description: product?.description ?? '',
    logo_url: product?.logo_url ?? '',
    repo_url: product?.repo_url ?? '',
    production_url: product?.production_url ?? '',
    web_url: product?.web_url ?? '',
    developer_ids: product?.developers.map((d) => d.id) ?? [],
  })

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleName(value: string) {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }))
  }

  async function handleLogo(file: File) {
    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/products/logo', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload failed.')
      set('logo_url', json.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = product ? await updateProduct(product.id, form) : await createProduct(form)
      if (result.success) {
        router.push(`/products/${result.slug}`)
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  function handleDelete() {
    if (!product) return
    if (!confirm(`Delete ${product.name}? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await deleteProduct(product.id)
      if (result.success) {
        router.push('/products')
        router.refresh()
      } else {
        setError(result.error ?? 'Could not delete product.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[var(--color-surface-hover)] ring-1 ring-[var(--color-border)]">
          {form.logo_url ? (
            <Image src={form.logo_url} alt="Product logo" fill sizes="80px" className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-[var(--color-text-muted)]">
              No logo
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="glass cursor-pointer rounded-xl px-4 py-2 text-sm text-[var(--color-text)] hover:border-[var(--color-accent)]/40">
            {uploading ? 'Uploading…' : form.logo_url ? 'Change logo' : 'Upload logo'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              disabled={uploading}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleLogo(f)
                e.target.value = ''
              }}
            />
          </label>
          {form.logo_url && (
            <button
              type="button"
              onClick={() => set('logo_url', '')}
              className="text-xs text-[var(--color-text-muted)] hover:text-red-400"
            >
              Remove
            </button>
          )}
          <span className="text-xs text-[var(--color-text-muted)]">PNG, JPG, WebP or GIF · max 2 MB</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Product name *">
          <input required value={form.name} onChange={(e) => handleName(e.target.value)} className="input" />
        </Field>
        <Field label="App / Product ID *" hint="Unique ID, e.g. NXP-001. Letters, numbers, . _ -">
          <input
            required
            value={form.product_id}
            onChange={(e) => set('product_id', e.target.value)}
            className="input font-[family-name:var(--font-data)]"
          />
        </Field>
        <Field label="URL slug *" hint={`Page address: /products/${form.slug || 'your-slug'}`}>
          <input
            required
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true)
              set('slug', e.target.value)
            }}
            className="input font-[family-name:var(--font-data)]"
          />
        </Field>
        <Field label="Type" hint="e.g. Web platform, Chrome extension, Desktop app">
          <input value={form.kind} onChange={(e) => set('kind', e.target.value)} className="input" />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          rows={5}
          maxLength={2000}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          className="input"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Repo link">
          <input type="url" placeholder="https://github.com/…" value={form.repo_url} onChange={(e) => set('repo_url', e.target.value)} className="input" />
        </Field>
        <Field label="Production link" hint="A preview copy is saved when you save">
          <input type="url" placeholder="https://…" value={form.production_url} onChange={(e) => set('production_url', e.target.value)} className="input" />
        </Field>
        <Field label="Web link" hint="Optional — also saved as a preview">
          <input type="url" placeholder="https://…" value={form.web_url} onChange={(e) => set('web_url', e.target.value)} className="input" />
        </Field>
      </div>

      <Field label="Developers" hint="Choose one or more members of the NexEris team.">
        <DeveloperPicker
          profiles={profiles}
          selectedIds={form.developer_ids}
          onChange={(ids) => set('developer_ids', ids)}
        />
      </Field>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="submit"
          disabled={isPending || uploading}
          className="rounded-xl bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-bright)] disabled:opacity-50"
        >
          {isPending ? 'Saving…' : product ? 'Save changes' : 'Create product'}
        </button>
        {product && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="text-sm text-red-400 hover:underline disabled:opacity-50"
          >
            Delete product
          </button>
        )}
      </div>
    </form>
  )
}
