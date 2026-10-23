import { notFound } from 'next/navigation'
import { requireSuperAdminPage } from '@/lib/permissions'
import { getAllProfiles } from '@/lib/data/profiles'
import { getProductBySlug } from '@/lib/data/products'
import { ProductForm } from '@/components/products/ProductForm'

// Saving a product may fetch its pages once to store a preview snapshot.
export const maxDuration = 30

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await requireSuperAdminPage(`/products/${slug}/edit`, `/products/${slug}`)

  const [product, profiles] = await Promise.all([getProductBySlug(slug), getAllProfiles()])
  if (!product) notFound()

  return (
    <main className="min-h-screen px-6 pb-20 pt-24">
      <div className="mx-auto max-w-3xl">
        <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.2em] text-[var(--color-accent-bright)]">
          Super Admin
        </span>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-text)]">
          Edit {product.name}
        </h1>
        <div className="glass mt-8 rounded-2xl p-6 sm:p-8">
          <ProductForm product={product} profiles={profiles} />
        </div>
      </div>
    </main>
  )
}
