import type { NextRequest } from 'next/server'
import { apiError, apiJson, preflight, requireApiKey } from '@/lib/api-auth'
import { getProductBySlug } from '@/lib/data/products'
import { productShape } from '@/lib/api-shapes'

export const OPTIONS = preflight

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const denied = await requireApiKey(request, 'products')
  if (denied) return denied

  const { slug } = await params
  const product = await getProductBySlug(slug.toLowerCase())
  if (!product) return apiError(404, 'not_found', 'No product with that slug.')

  return apiJson({ data: productShape(product, request.nextUrl.origin) })
}
