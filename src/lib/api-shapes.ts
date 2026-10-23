import type { PublicProfile } from '@/lib/data/profiles'
import type { Product } from '@/lib/data/products'

// What the public API returns. Only fields that are already public on the website:
// never emails, auth ids, roles or EXP.

export function teamMemberShape(p: PublicProfile, origin: string) {
  return {
    username: p.username,
    full_name: p.full_name,
    nex_id: p.nex_id,
    position: p.position,
    department: p.department,
    bio: p.bio,
    avatar_url: p.avatar_url,
    profile_url: `${origin}/${p.username}`,
  }
}

export function productShape(p: Product, origin: string) {
  return {
    product_id: p.product_id,
    slug: p.slug,
    name: p.name,
    type: p.kind,
    description: p.description,
    logo_url: p.logo_url,
    links: {
      repository: p.repo_url,
      production: p.production_url,
      web: p.web_url,
    },
    developers: p.developers.map((d) => teamMemberShape(
      { ...d, department: null, bio: null },
      origin
    )),
    url: `${origin}/products/${p.slug}`,
  }
}
