'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export function AvatarLightbox({
  src,
  alt,
  children,
}: {
  src: string | null
  alt: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  // No photo to zoom into — just render the avatar as-is (e.g. initials fallback).
  if (!src) return <>{children}</>

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block cursor-zoom-in rounded-full transition-opacity hover:opacity-90"
        aria-label={`View ${alt}'s profile photo`}
      >
        {children}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`${alt}'s profile photo`}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:right-6 sm:top-6"
            >
              <X className="h-5 w-5" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative h-[min(70vmin,32rem)] w-[min(70vmin,32rem)] max-h-[80vh] max-w-[80vw] overflow-hidden rounded-2xl ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={src} alt={alt} fill className="object-contain" sizes="80vw" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
