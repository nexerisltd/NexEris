'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { getActiveNav, type NavKey } from '@/lib/nav'
import { isStaff, isSignedInMember, type UserRole } from '@/lib/roles'

interface Item {
  key: NavKey
  href: string
  label: string
}

export function NavLinks({ role, username }: { role: UserRole; username?: string }) {
  const pathname = usePathname()
  const active = getActiveNav(pathname, username)

  const items: Item[] = [
    { key: 'home', href: '/', label: 'Home' },
    { key: 'products', href: '/products', label: 'Products' },
    { key: 'about', href: '/about', label: 'About' },
    { key: 'team', href: '/team', label: 'Team' },
  ]
  if (role === 'guest') items.push({ key: 'login', href: '/login', label: 'Sign in' })
  if (isSignedInMember(role) && username) items.push({ key: 'profile', href: `/${username}`, label: 'My Profile' })
  if (isStaff(role)) {
    items.push({ key: 'admin', href: '/admin', label: role === 'super_admin' ? 'Super Admin' : 'Admin' })
  }

  return (
    <>
      {items.map((item) => {
        const isActive = active === item.key
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`relative rounded-lg px-3 py-1.5 transition-colors duration-200 ${
              isActive
                ? 'text-[var(--color-text)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {isActive && (
              <>
                {/* Both layoutIds glide from the old active link to the new one. */}
                <motion.span
                  layoutId="nav-pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-lg bg-[var(--color-surface-hover)] ring-1 ring-[var(--color-border)]"
                />
                <motion.span
                  layoutId="nav-bar"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  className="absolute inset-x-3 -bottom-[7px] h-[2px] rounded-full bg-[var(--color-accent-bright)] sm:-bottom-[11px]"
                />
              </>
            )}
            <span className="relative">{item.label}</span>
          </Link>
        )
      })}
    </>
  )
}
