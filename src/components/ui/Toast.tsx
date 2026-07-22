'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'

export function Toast({
  message,
}: {
  message: { type: 'success' | 'error'; text: string } | null
}) {
  return (
    <div className="fixed right-4 top-20 z-[70] sm:right-6">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, x: 40, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`glass flex items-center gap-2 rounded-xl px-4 py-3 text-sm shadow-2xl ${
              message.type === 'success' ? 'text-emerald-300' : 'text-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0" />
            )}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}