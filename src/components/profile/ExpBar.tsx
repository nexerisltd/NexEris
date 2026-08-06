'use client'

import { useEffect, useRef } from 'react'

const PARTICLE_COLORS = ['#4c7cff', '#6f97ff', '#86aaff', '#3466e6']

/**
 * Derives a stable "illusion" fill percentage from a string (profile id or
 * username) so each member's bar looks alive but never actually reflects
 * their real EXP total or changes between visits — it's decorative, not
 * a real progress indicator. The real number is shown as text alongside it.
 */
function illusionPercent(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return 48 + (hash % 34) // lands somewhere in the 48–81% range
}

export function ExpBar({ exp, seed }: { exp: number; seed: string }) {
  const glowRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLDivElement>(null)
  const pct = illusionPercent(seed)

  useEffect(() => {
    const field = fieldRef.current
    const glow = glowRef.current
    if (!field || !glow) return

    function spawnParticle() {
      if (!field || !glow) return
      const round = Math.random() > 0.35
      const p = document.createElement('div')
      const size = round ? 3 + Math.random() * 4 : 2 + Math.random() * 2
      const length = round ? size : size * (3 + Math.random() * 2)
      const startY = 8 + Math.random() * 8
      const dur = 1600 + Math.random() * 1200
      const travel = 30 + Math.random() * 70
      const fall = 4 + Math.random() * 18
      const rot = (Math.random() - 0.5) * 60
      const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]

      p.style.position = 'absolute'
      p.style.left = pct + '%'
      p.style.top = startY + 'px'
      p.style.width = length + 'px'
      p.style.height = size + 'px'
      p.style.borderRadius = round ? '50%' : '2px'
      p.style.background = color
      p.style.boxShadow = `0 0 4px 1px ${color}80`
      p.style.opacity = '1'
      p.style.transform = `translate(0,0) rotate(${rot}deg) scale(1)`
      p.style.transition = `transform ${dur}ms cubic-bezier(0.15,0.6,0.35,1), opacity ${dur}ms ease-in`
      field.appendChild(p)

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          p.style.transform = `translate(-${travel}px, ${fall}px) rotate(${rot}deg) scale(0.3)`
          p.style.opacity = '0'
        })
      })

      window.setTimeout(() => p.remove(), dur + 60)

      glow.style.transition = 'transform 140ms ease-out'
      glow.style.transform = 'scale(1.5)'
      window.setTimeout(() => {
        if (glow) glow.style.transform = 'scale(1)'
      }, 140)
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const id = window.setInterval(spawnParticle, 160)
    return () => window.clearInterval(id)
  }, [pct])

  return (
    <div className="mt-4 max-w-xs">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          Experience
        </span>
        <span className="font-[family-name:var(--font-data)] text-xs font-medium text-[var(--color-accent-bright)]">
          {exp.toLocaleString()} EXP
        </span>
      </div>

      <div
        style={{
          position: 'relative',
          height: 10,
          background: 'var(--color-surface-hover)',
          borderRadius: 999,
          overflow: 'visible',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${pct}%`,
            background: 'var(--color-accent)',
            borderRadius: 999,
            overflow: 'visible',
          }}
        >
          <div
            ref={glowRef}
            style={{
              position: 'absolute',
              right: -2,
              top: -2,
              height: 14,
              width: 14,
              borderRadius: '50%',
              background: 'var(--color-accent-bright)',
              boxShadow: '0 0 8px 3px rgba(134, 170, 255, 0.7)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              height: '100%',
              width: 26,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6))',
              borderRadius: 999,
            }}
          />
        </div>
        <div
          ref={fieldRef}
          style={{
            position: 'absolute',
            top: -10,
            left: 0,
            width: '100%',
            height: 30,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}
