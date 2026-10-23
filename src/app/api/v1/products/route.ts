import type { NextRequest } from 'next/server'
import { apiJson, preflight, requireApiKey } from '@/lib/api-auth'
import { getProducts } from '@/lib/data/products'
import { productShape } from '@/lib/api-shapes'

export const OPTIONS = preflight

export async function GET(request: NextRequest) {
  const denied = await requireApiKey(request, 'products')
  if (denied) return denied

  const origin = request.nextUrl.origin
  const products = await getProducts()
  return apiJson({ data: products.map((p) => productShape(p, origin)), meta: { count: products.length } })
}
