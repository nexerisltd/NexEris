'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { SignOutButton } from '@/components/auth/SignOutButton'

interface MobileMenuProps {
  role: 'guest' | 'member' | 'admin'
  username?: string
}

export function MobileMenu({ role, username }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text)]"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
              className="fixed right-0 top-0 z-[90] h-full w-64 border-l border-[var(--color-border)] bg-[rgba(10,14,22,0.6)] backdrop-blur-3xl p-6"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="mb-8 flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text)]"
              >
                <X className="h-5 w-5" />
              </button>

              <nav className="flex flex-col gap-5 text-sm">
                <Link href="/" onClick={() => setOpen(false)} className="text-[var(--color-text)]">
                  Home
                </Link>
                <Link href="/team" onClick={() => setOpen(false)} className="text-[var(--color-text)]">
                  Team
                </Link>

                {role === 'guest' && (
                  <Link href="/login" onClick={() => setOpen(false)} className="text-[var(--color-text)]">
                    Sign in
                  </Link>
                )}

                {(role === 'member' || role === 'admin') && (
                  <>
                    <Link href={`/${username}`} onClick={() => setOpen(false)} className="text-[var(--color-text)]">
                      My Profile
                    </Link>
                    {role === 'admin' && (
                      <Link href="/admin" onClick={() => setOpen(false)} className="text-[var(--color-text)]">
                        Admin
                      </Link>
                    )}
                    <div className="pt-2">
                      <SignOutButton />
                    </div>
                  </>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}