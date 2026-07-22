'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false)
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springConfig = { damping: 20, stiffness: 200, mass: 0.6 }
  const glowX = useSpring(cursorX, springConfig)
  const glowY = useSpring(cursorY, springConfig)

  useEffect(() => {
    // Skip on touch devices — there's no cursor to trail there
    if (window.matchMedia('(pointer: coarse)').matches) return

    setIsVisible(true)

    function handleMove(e: MouseEvent) {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [cursorX, cursorY])

  if (!isVisible) return null

  return (
    <motion.div
      style={{ left: glowX, top: glowY }}
      className="pointer-events-none fixed z-[40] h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-accent)]/25 blur-xl"
    />
  )
}