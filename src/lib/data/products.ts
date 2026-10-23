import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export interface ProductDeveloper {
  id: string
  username: string
  full_name: string
  nex_id: string | null
  avatar_url: string | null
  position: string | null
}

export interface Product {
  id: string
  product_id: string
  slug: string
  name: string
  kind: string | null
  description: string | null
  logo_url: string | null
  repo_url: string | null
  production_url: string | null
  web_url: string | null
  developers: ProductDeveloper[]
}

const SELECT =
  '*, product_developers(profiles(id, username, full_name, nex_id, avatar_url, position))'

type Row = Omit<Product, 'developers'> & {
  product_developers?: { profiles: ProductDeveloper | ProductDeveloper[] | null }[] | null
}

function normalize(row: Row): Product {
  const { product_developers, ...rest } = row
  const developers: ProductDeveloper[] = []
  for (const link of product_developers ?? []) {
    const p = Array.isArray(link.profiles) ? link.profiles[0] : link.profiles
    if (p) developers.push(p)
  }
  developers.sort((a, b) => a.full_name.localeCompare(b.full_name))
  return { ...rest, developers }
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(SELECT)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to load products:', error.message)
    return []
  }
  return ((data ?? []) as unknown as Row[]).map(normalize)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(SELECT)
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error('Failed to load product:', error.message)
    return null
  }
  return data ? normalize(data as unknown as Row) : null
}

export interface PreviewMeta {
  kind: 'production' | 'web'
  source_url: string
  status: 'ok' | 'error'
  error: string | null
  fetched_at: string
}

/** Snapshot status only (never the HTML itself). Table is server-only, hence the service client. */
export async function getPreviewMeta(productRowId: string): Promise<PreviewMeta[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('product_previews')
    .select('kind, source_url, status, error, fetched_at')
    .eq('product_id', productRowId)

  if (error) {
    console.error('Failed to load preview info:', error.message)
    return []
  }
  return (data ?? []) as PreviewMeta[]
}
