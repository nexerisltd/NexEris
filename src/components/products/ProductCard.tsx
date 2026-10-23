import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

export interface ProductCardData {
  name: string
  kind?: string | null
  description?: string | null
  logo_url?: string | null
  /** Internal product page, e.g. /products/nexapp */
  href?: string
  /** External link (used for starter products that have no product page yet) */
  externalHref?: string
}

function Logo({ name, url }: { name: string; url?: string | null }) {
  return (
    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[var(--color-surface-hover)] ring-1 ring-[var(--color-border)]">
      {url ? (
        <Image src={url} alt={`${name} logo`} fill sizes="44px" className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--color-accent-bright)]">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  )
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const body = (
    <div className="glass card-hover h-full rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <Logo name={product.name} url={product.logo_url} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-text)]">
              {product.name}
            </h3>
            {(product.href || product.externalHref) && (
              <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[var(--color-accent-bright)]" />
            )}
          </div>
          {product.kind && (
            <p className="font-[family-name:var(--font-data)] text-xs text-[var(--color-accent-bright)]">
              {product.kind}
            </p>
          )}
        </div>
      </div>
      {product.description && (
        <p className="mt-4 line-clamp-3 text-sm text-[var(--color-text-muted)]">{product.description}</p>
      )}
    </div>
  )

  if (product.href) {
    return (
      <Link href={product.href} className="block h-full">
        {body}
      </Link>
    )
  }
  if (product.externalHref) {
    return (
      <a href={product.externalHref} target="_blank" rel="noopener noreferrer" className="block h-full">
        {body}
      </a>
    )
  }
  return body
}
