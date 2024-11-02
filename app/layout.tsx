'use client'

import type { Metadata, Viewport } from 'next'
import { Inter as FontSans } from 'next/font/google'
import './globals.css'
import { cn } from '../lib/utils'
import { ThemeProvider } from '../components/theme-provider'
import Header from '../components/header'
import Footer from '../components/footer'
import { Sidebar } from '../components/sidebar'
import { Toaster } from '../components/ui/sonner'
import { AppStateProvider } from '../lib/utils/app-state'
import { AuthProvider } from '../components/auth/auth-provider'
import { useEffect } from 'react'
import { useAuth } from '../components/auth/auth-provider' // Make sure this import exists
import { toast } from 'sonner'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

const title = 'Aivy'
const description =
  'A fully open-source AI-powered answer engine with a generative UI.'

// export const metadata: Metadata = {
//   metadataBase: new URL('https://aivy.sh'),
//   title,
//   description,
//   openGraph: {
//     title,
//     description
//   },
//   twitter: {
//     title,
//     description,
//     card: 'summary_large_image',
//     creator: '@miiura'
//   }
// }

// export const viewport: Viewport = {
//   width: 'device-width',
//   initialScale: 1,
//   minimumScale: 1,
//   maximumScale: 1
// }

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={cn('font-sans antialiased min-h-screen flex flex-col', fontSans.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppStateProvider>
            <AuthProvider>
              <Header />
              {children}
              <Sidebar />
              <Footer />
              <Toaster />
            </AuthProvider>
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
