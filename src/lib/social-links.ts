export function whatsappUrl(input: string): string {
  const digits = input.replace(/[^0-9]/g, '')
  return `https://wa.me/${digits}`
}

export function facebookUrl(input: string): string {
  const trimmed = input.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  const username = trimmed.replace(/^@/, '')
  return `https://facebook.com/${username}`
}

export function instagramUrl(input: string): string {
  const trimmed = input.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  const username = trimmed.replace(/^@/, '')
  return `https://instagram.com/${username}`
}