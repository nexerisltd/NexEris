import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Pencil, Code, Globe, ExternalLink } from 'lucide-react'
import { getProductBySlug, getPreviewMeta } from '@/lib/data/products'
import { getCurrentUser } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/roles'
import { ProductPreview, type PreviewItem } from '@/components/products/ProductPreview'

// Saving a product may fetch its pages once to store a preview snapshot.
export const maxDuration = 30

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Product not found — NexEris LTD' }
  return {
    title: `${product.name} — NexEris LTD`,
    description: product.description ?? `${product.name} by NexEris LTD.`,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [product, currentUser] = await Promise.all([getProductBySlug(slug), getCurrentUser()])
  if (!product) notFound()

  const canEdit = isSuperAdmin(currentUser.role)

  const meta = await getPreviewMeta(product.id)
  function buildPreview(kind: 'production' | 'web', label: string, url: string): PreviewItem {
    // Only trust a snapshot that was taken from the link currently saved.
    const m = meta.find((x) => x.kind === kind && x.source_url === url)
    const ok = m?.status === 'ok'
    return {
      label,
      url,
      snapshotSrc: ok
        ? `/api/products/${product!.id}/preview?kind=${kind}&v=${encodeURIComponent(m.fetched_at)}&fmt=3`
        : null,
      fetchedAt: ok ? m.fetched_at : null,
      error: m?.status === 'error' ? m.error : null,
    }
  }

  const previews: PreviewItem[] = []
  if (product.production_url) previews.push(buildPreview('production', 'Production', product.production_url))
  if (product.web_url && product.web_url !== product.production_url) {
    previews.push(buildPreview('web', 'Web', product.web_url))
  }

  const linkClass =
    'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors'

  return (
    <main className="min-h-screen px-6 pb-20 pt-24">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <ArrowLeft className="h-4 w-4" /> All products
        </Link>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[var(--color-surface-hover)] ring-1 ring-[var(--color-border)] sm:h-24 sm:w-24">
              {product.logo_url ? (
                <Image src={product.logo_url} alt={`${product.name} logo`} fill sizes="96px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-accent-bright)]">
                  {product.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-text)] sm:text-4xl">
                {product.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                {product.kind && (
                  <span className="rounded-full bg-[var(--color-surface-hover)] px-2.5 py-1 text-[var(--color-text-muted)]">
                    {product.kind}
                  </span>
                )}
                <span className="rounded-full bg-[var(--color-surface-hover)] px-2.5 py-1 font-[family-name:var(--font-data)] text-[var(--color-accent-bright)]">
                  {product.product_id}
                </span>
              </div>
            </div>
          </div>

          {canEdit && (
            <Link
              href={`/products/${product.slug}/edit`}
              className="glass flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)]/40"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
        </div>

        {product.description && (
          <p className="mt-8 max-w-2xl whitespace-pre-line text-[var(--color-text)]">{product.description}</p>
        )}

        {(product.production_url || product.web_url || product.repo_url) && (
          <div className="mt-8 flex flex-wrap gap-3">
            {product.production_url && (
              <a href={product.production_url} target="_blank" rel="noopener noreferrer" className={`${linkClass} bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-bright)]`}>
                <Globe className="h-4 w-4" /> Production
              </a>
            )}
            {product.web_url && product.web_url !== product.production_url && (
              <a href={product.web_url} target="_blank" rel="noopener noreferrer" className={`${linkClass} glass text-[var(--color-text)] hover:border-[var(--color-accent)]/40`}>
                <ExternalLink className="h-4 w-4" /> Web
              </a>
            )}
            {product.repo_url && (
              <a href={product.repo_url} target="_blank" rel="noopener noreferrer" className={`${linkClass} glass text-[var(--color-text)] hover:border-[var(--color-accent)]/40`}>
                <Code className="h-4 w-4" /> Repository
              </a>
            )}
          </div>
        )}

        {product.developers.length > 0 && (
          <section className="mt-12">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-text)]">
              {product.developers.length === 1 ? 'Developer' : 'Developers'}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {product.developers.map((d) => (
                <Link
                  key={d.id}
                  href={`/${d.username}`}
                  className="glass flex items-center gap-3 rounded-2xl p-4 transition-colors hover:border-[var(--color-accent)]/40"
                >
                  <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[var(--color-surface-hover)] ring-2 ring-[var(--color-accent)]/40">
                    {d.avatar_url ? (
                      <Image src={d.avatar_url} alt={d.full_name} fill sizes="44px" className="object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-[var(--color-text)]">
                        {d.full_name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-[var(--color-text)]">{d.full_name}</span>
                    <span className="block truncate font-[family-name:var(--font-data)] text-xs text-[var(--color-text-muted)]">
                      @{d.username}
                      {d.position ? ` · ${d.position}` : ''}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {previews.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-text)]">
              Preview
            </h2>
            <ProductPreview
              items={previews}
              title={product.name}
              productId={product.id}
              canRefresh={canEdit}
            />
          </section>
        )}
      </div>
    </main>
  )
}
