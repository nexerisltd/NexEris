'use client'

import { useRef } from 'react'
import Image from 'next/image'

export function CoverPositionEditor({
  imageUrl,
  position,
  onPositionChange,
}: {
  imageUrl: string
  position: number
  onPositionChange: (pos: number) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const startYRef = useRef(0)
  const startPosRef = useRef(position)

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = true
    startYRef.current = e.clientY
    startPosRef.current = position
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current || !containerRef.current) return
    const deltaY = e.clientY - startYRef.current
    const containerHeight = containerRef.current.offsetHeight
    const deltaPercent = (deltaY / containerHeight) * 100
    let newPos = startPosRef.current - deltaPercent
    newPos = Math.max(0, Math.min(100, newPos))
    onPositionChange(newPos)
  }

  function handlePointerUp() {
    draggingRef.current = false
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative h-44 w-full cursor-grab select-none overflow-hidden rounded-lg border border-[var(--color-border)] active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    >
      <Image
        src={imageUrl}
        alt="Cover"
        fill
        sizes="(max-width: 1024px) 100vw, 1024px"
        className="pointer-events-none object-cover"
        style={{ objectPosition: `center ${position}%` }}
        draggable={false}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/50 px-3 py-1.5 text-center text-xs text-white">
        Drag up or down to reposition
      </div>
    </div>
  )
}