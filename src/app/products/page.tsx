import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getProducts } from '@/lib/data/products'
import { getCurrentUser } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/roles'
import { products as starterProducts } from '@/lib/company'
import { ProductCard, type ProductCardData } from '@/components/products/ProductCard'

export const metadata = {
  title: 'Products — NexEris LTD',
  description: 'Everything NexEris LTD builds.',
}

export default async function ProductsPage() {
  const [products, currentUser] = await Promise.all([getProducts(), getCurrentUser()])
  const canManage = isSuperAdmin(currentUser.role)

  const cards: ProductCardData[] =
    products.length > 0
      ? products.map((p) => ({
          name: p.name,
          kind: p.kind,
          description: p.description,
          logo_url: p.logo_url,
          href: `/products/${p.slug}`,
        }))
      : starterProducts.map((p) => ({ name: p.name, kind: p.kind, description: p.description, externalHref: p.href }))

  return (
    <main className="min-h-screen px-6 pb-20 pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.2em] text-[var(--color-accent-bright)]">
              Our work
            </span>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-text)] sm:text-4xl">
              Products
            </h1>
          </div>
          {canManage && (
            <Link
              href="/products/new"
              className="flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-bright)]"
            >
              <Plus className="h-4 w-4" /> Add product
            </Link>
          )}
        </div>

        {canManage && products.length === 0 && (
          <p className="mt-4 text-xs text-[var(--color-text-muted)]">
            Showing the starter list. Add your first product to replace it.
          </p>
        )}

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <ProductCard key={c.name} product={c} />
          ))}
        </div>
      </div>
    </main>
  )
}
