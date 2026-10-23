import Image from 'next/image'

// The real NexEris mark (public/brand). Pre-sized files, so no image optimizer round-trip.
export function Logo({
  size = 32,
  className = '',
  priority = false,
}: {
  size?: number
  className?: string
  priority?: boolean
}) {
  return (
    <Image
      src={size > 64 ? '/brand/logo-512.png' : '/brand/logo-128.png'}
      alt="NexEris LTD logo"
      width={size}
      height={size}
      unoptimized
      priority={priority}
      className={`shrink-0 object-contain ${className}`}
    />
  )
}
