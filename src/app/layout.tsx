import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  colorScheme: 'dark',
}

export const metadata: Metadata = {
  title: 'Lunar Shift — Discover Your Hijri Birthday',
  description:
    'Find your exact Hijri Date of Birth, compare lunar and solar ages, ' +
    'and forecast when your Hijri birthday will next appear on the Gregorian calendar.',
  keywords: ['hijri birthday', 'islamic calendar', 'ummalqura', 'date converter', 'lunar calendar'],
  openGraph: {
    title: 'Lunar Shift — Discover Your Hijri Birthday',
    description: 'Know your Hijri age. Find your next Hijri birthday.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ fontSynthesis: 'none', textRendering: 'optimizeLegibility' }}
      >
        {children}
      </body>
    </html>
  )
}
