import type { Metadata } from 'next'
import { Sora, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
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
  title: 'NexEris Team Directory',
  description: "Meet the people behind NexEris — verified, current, in one place.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeScript />
        <ScrollProgress />
        <CustomCursor />
        <Navbar />
        {children}
      </body>
    </html>
  )
}