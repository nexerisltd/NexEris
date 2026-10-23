import { RESERVED_USERNAMES } from '@/lib/roles'

export type NavKey = 'home' | 'products' | 'about' | 'team' | 'profile' | 'admin' | 'login'

/**
 * Which navbar item the current page belongs to (sub-pages count too):
 *  /products/nexsync/edit -> products, /admin/members -> admin,
 *  /<someone>             -> team (or "My Profile" when it is your own page).
 */
export function getActiveNav(pathname: string, username?: string): NavKey | null {
  if (pathname === '/') return 'home'

  const first = pathname.split('/').filter(Boolean)[0]?.toLowerCase()
  if (!first) return null

  switch (first) {
    case 'products':
    case 'about':
    case 'team':
    case 'admin':
    case 'login':
      return first
    case 'dashboard':
      return 'profile'
  }

  if (RESERVED_USERNAMES.includes(first)) return null

  // Anything else is a member profile page (/<username>, /<username>/edit).
  return username && first === username.toLowerCase() ? 'profile' : 'team'
}
