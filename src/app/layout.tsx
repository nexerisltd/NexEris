import type { Metadata } from 'next'
import { Sora, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Suspense } from 'react'
import { siteUrl } from '@/lib/company'
import { Navbar, NavbarFallback } from '@/components/layout/Navbar'
import { ScrollProgress } from '@/components/ui/ScrollProgress'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { ThemeScript } from '@/components/ui/ThemeScript'


const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['400', '600', '700'],
})


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'NexEris LTD', template: '%s' },
  description: 'NexEris LTD builds web platforms, desktop apps, browser tools and bots.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeScript />
        <ScrollProgress />
        <CustomCursor />
        <Suspense fallback={<NavbarFallback />}>
          <Navbar />
        </Suspense>
        {children}
      </body>
    </html>
  )
}