'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { getCurrentUser } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/roles'
import { revalidatePath } from 'next/cache'
import { captureSnapshot } from '@/lib/preview'

export interface ProductInput {
  product_id: string
  slug: string
  name: string
  kind: string
  description: string
  logo_url: string
  repo_url: string
  production_url: string
  web_url: string
  developer_ids: string[]
}

type Result = { success: true; slug: string } | { success: false; error: string }

async function requireSuperAdmin() {
  const user = await getCurrentUser()
  if (!isSuperAdmin(user.role)) throw new Error('Only a Super Admin can manage products.')
}

function cleanUrl(value: string, label: string): { value: string | null; error?: string } {
  const v = value.trim()
  if (!v) return { value: null }
  try {
    const u = new URL(v)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error()
    return { value: u.toString() }
  } catch {
    return { value: null, error: `${label} must be a valid http(s) link.` }
  }
}

function validate(input: ProductInput) {
  const name = input.name.trim()
  const slug = input.slug.trim().toLowerCase()
  const productId = input.product_id.trim()

  if (!name || name.length > 80) return { error: 'Name is required (max 80 characters).' }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug === 'new') {
    return { error: 'URL slug can only use lowercase letters, numbers and dashes.' }
  }
  if (!/^[A-Za-z0-9._-]{2,40}$/.test(productId)) {
    return { error: 'Product ID must be 2–40 characters: letters, numbers, dot, dash or underscore.' }
  }
  if (input.description.length > 2000) return { error: 'Description is too long (max 2000).' }

  const logo = cleanUrl(input.logo_url, 'Logo')
  const repo = cleanUrl(input.repo_url, 'Repo link')
  const prod = cleanUrl(input.production_url, 'Production link')
  const web = cleanUrl(input.web_url, 'Web link')
  const urlError = logo.error ?? repo.error ?? prod.error ?? web.error
  if (urlError) return { error: urlError }

  return {
    row: {
      product_id: productId,
      slug,
      name,
      kind: input.kind.trim() || null,
      description: input.description.trim() || null,
      logo_url: logo.value,
      repo_url: repo.value,
      production_url: prod.value,
      web_url: web.value,
    },
  }
}

function friendlyError(error: { code?: string; message: string }) {
  if (error.code === '23505') return 'That Product ID or URL slug is already used by another product.'
  return error.message
}

async function saveDevelopers(
  supabase: ReturnType<typeof createServiceClient>,
  productRowId: string,
  developerIds: string[]
) {
  const { error: delError } = await supabase
    .from('product_developers')
    .delete()
    .eq('product_id', productRowId)
  if (delError) return delError.message

  const unique = Array.from(new Set(developerIds))
  if (unique.length === 0) return null

  const { error } = await supabase
    .from('product_developers')
    .insert(unique.map((profile_id) => ({ product_id: productRowId, profile_id })))
  return error ? error.message : null
}

type Kind = 'production' | 'web'

async function captureAndStore(
  supabase: ReturnType<typeof createServiceClient>,
  productRowId: string,
  kind: Kind,
  url: string
) {
  let html: string | null = null
  let error: string | null = null
  try {
    html = await captureSnapshot(url)
  } catch (e) {
    error = (e instanceof Error ? e.message : 'Could not load the page.').slice(0, 300)
  }
  await supabase.from('product_previews').upsert({
    product_id: productRowId,
    kind,
    source_url: url,
    html,
    status: html ? 'ok' : 'error',
    error,
    fetched_at: new Date().toISOString(),
  })
}

// Saves a snapshot only when needed: new link, changed link, or a previous failure.
// With force=true (Super Admin pressed refresh) every link is fetched again.
async function syncPreviews(
  supabase: ReturnType<typeof createServiceClient>,
  productRowId: string,
  urls: { production: string | null; web: string | null },
  force = false
) {
  const { data: existing } = await supabase
    .from('product_previews')
    .select('kind, source_url, status')
    .eq('product_id', productRowId)

  const jobs: Promise<unknown>[] = []
  for (const kind of ['production', 'web'] as Kind[]) {
    const url = kind === 'web' && urls.web === urls.production ? null : urls[kind]
    const row = existing?.find((r) => r.kind === kind)

    if (!url) {
      if (row) {
        jobs.push(
          Promise.resolve(
            supabase.from('product_previews').delete().eq('product_id', productRowId).eq('kind', kind)
          )
        )
      }
      continue
    }
    if (!force && row && row.source_url === url && row.status === 'ok') continue
    jobs.push(captureAndStore(supabase, productRowId, kind, url))
  }
  await Promise.all(jobs)
}

export async function refreshProductPreview(
  productRowId: string
): Promise<{ success: boolean; error?: string }> {
  await requireSuperAdmin()
  const supabase = createServiceClient()

  const { data: product } = await supabase
    .from('products')
    .select('slug, production_url, web_url')
    .eq('id', productRowId)
    .maybeSingle()
  if (!product) return { success: false, error: 'Product not found.' }

  await syncPreviews(
    supabase,
    productRowId,
    { production: product.production_url, web: product.web_url },
    true
  )

  revalidatePath(`/products/${product.slug}`)

  const { data: failed } = await supabase
    .from('product_previews')
    .select('kind, error')
    .eq('product_id', productRowId)
    .eq('status', 'error')
  if (failed && failed.length > 0) {
    return { success: false, error: failed.map((f) => `${f.kind}: ${f.error}`).join(' · ') }
  }
  return { success: true }
}

function revalidateProduct(slug: string) {
  revalidatePath('/')
  revalidatePath('/products')
  revalidatePath(`/products/${slug}`)
}

export async function createProduct(input: ProductInput): Promise<Result> {
  await requireSuperAdmin()
  const checked = validate(input)
  if (!checked.row) return { success: false, error: checked.error ?? 'Invalid input.' }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('products')
    .insert(checked.row)
    .select('id, slug')
    .single()

  if (error || !data) return { success: false, error: friendlyError(error ?? { message: 'Could not create product.' }) }

  const devError = await saveDevelopers(supabase, data.id, input.developer_ids)
  if (devError) return { success: false, error: `Product saved, but developers failed: ${devError}` }

  await syncPreviews(supabase, data.id, {
    production: checked.row.production_url,
    web: checked.row.web_url,
  })

  revalidateProduct(data.slug)
  return { success: true, slug: data.slug }
}

export async function updateProduct(id: string, input: ProductInput): Promise<Result> {
  await requireSuperAdmin()
  const checked = validate(input)
  if (!checked.row) return { success: false, error: checked.error ?? 'Invalid input.' }

  const supabase = createServiceClient()

  const { data: previous } = await supabase.from('products').select('slug').eq('id', id).maybeSingle()

  const { error } = await supabase
    .from('products')
    .update({ ...checked.row, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { success: false, error: friendlyError(error) }

  const devError = await saveDevelopers(supabase, id, input.developer_ids)
  if (devError) return { success: false, error: `Product saved, but developers failed: ${devError}` }

  await syncPreviews(supabase, id, {
    production: checked.row.production_url,
    web: checked.row.web_url,
  })

  if (previous?.slug && previous.slug !== checked.row.slug) revalidateProduct(previous.slug)
  revalidateProduct(checked.row.slug)
  return { success: true, slug: checked.row.slug }
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  await requireSuperAdmin()
  const supabase = createServiceClient()

  const { data: existing } = await supabase.from('products').select('slug').eq('id', id).maybeSingle()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidateProduct(existing?.slug ?? '')
  return { success: true }
}
