import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { products as starterProducts } from '@/lib/company'
import type { Product } from '@/lib/data/products'
import { Reveal } from '@/components/ui/Reveal'
import { ProductCard, type ProductCardData } from '@/components/products/ProductCard'

export function Products({ products }: { products: Product[] }) {
  // Products managed by a Super Admin win; until one exists, show the starter list.
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
    <section id="products" className="scroll-mt-20 border-y border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.2em] text-[var(--color-accent-bright)]">
            Our work
          </span>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
            Products
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal key={c.name} delay={Math.min(i, 8) * 0.05}>
              <ProductCard product={c} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-10 flex justify-center">
          <Link
            href="/products"
            className="glass flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)]/40"
          >
            View all products <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
