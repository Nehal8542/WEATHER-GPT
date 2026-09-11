import { Analytics } from '@vercel/analytics/next'
import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Noto_Sans_Devanagari } from 'next/font/google'
import './globals.css'

const devanagari = Noto_Sans_Devanagari({ subsets: ['devanagari'], variable: '--font-devanagari' })
const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'WeatherGPT — Conversational Weather Intelligence',
  description:
    'WeatherGPT: real-time forecasts, extreme-weather alerts, air quality, and climate insights through a friendly, multilingual conversational assistant for India.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#4d9de0',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html
      lang="hi"
      className={`bg-[#d8edf8] ${geistSans.variable} ${geistMono.variable} ${devanagari.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
