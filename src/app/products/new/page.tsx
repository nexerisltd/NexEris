import { requireSuperAdminPage } from '@/lib/permissions'
import { getAllProfiles } from '@/lib/data/profiles'
import { ProductForm } from '@/components/products/ProductForm'

export const metadata = { title: 'Add product — NexEris LTD' }

// Saving a product may fetch its pages once to store a preview snapshot.
export const maxDuration = 30

export default async function NewProductPage() {
  await requireSuperAdminPage('/products/new', '/products')
  const profiles = await getAllProfiles()

  return (
    <main className="min-h-screen px-6 pb-20 pt-24">
      <div className="mx-auto max-w-3xl">
        <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.2em] text-[var(--color-accent-bright)]">
          Super Admin
        </span>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-text)]">
          Add product
        </h1>
        <div className="glass mt-8 rounded-2xl p-6 sm:p-8">
          <ProductForm profiles={profiles} />
        </div>
      </div>
    </main>
  )
}
