'use client'

import { useEffect, useState } from 'react'

export function TypewriterText({
  texts,
  className,
}: {
  texts: string[]
  className?: string
}) {
  const [textIndex, setTextIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting'>('typing')

  const currentText = texts[textIndex]

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    if (phase === 'typing') {
      if (displayed.length < currentText.length) {
        timeout = setTimeout(() => setDisplayed(currentText.slice(0, displayed.length + 1)), 80)
      } else {
        timeout = setTimeout(() => setPhase('pausing'), 1800)
      }
    } else if (phase === 'pausing') {
      timeout = setTimeout(() => setPhase('deleting'), 800)
    } else if (phase === 'deleting') {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40)
      } else {
        timeout = setTimeout(() => {
          setTextIndex((prev) => (prev + 1) % texts.length)
          setPhase('typing')
        }, 400)
      }
    }

    return () => clearTimeout(timeout)
  }, [displayed, phase, currentText, texts.length])

  return (
    <span className={className}>
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  )
}