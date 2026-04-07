import type { Metadata, Viewport } from 'next'
import { Syne, Inria_Sans, Geist_Mono } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const inriaSans = Inria_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-inria',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#0e0e12',
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
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${inriaSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
