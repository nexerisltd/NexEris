import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/roles'
import { createServiceClient } from '@/lib/supabase/service'

const MAX_BYTES = 2 * 1024 * 1024
const TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!isSuperAdmin(user.role)) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
  }

  const form = await request.formData()
  const file = form.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file received.' }, { status: 400 })
  }
  const ext = TYPES[file.type]
  if (!ext) {
    return NextResponse.json({ error: 'Use a PNG, JPG, WebP or GIF image.' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Logo must be 2 MB or smaller.' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const path = `logos/${Date.now()}-${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from('product-logos')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data } = supabase.storage.from('product-logos').getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
