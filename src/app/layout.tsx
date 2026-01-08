import type { Metadata, Viewport } from 'next'
import { config } from '@fortawesome/fontawesome-svg-core'
import { Geist, Geist_Mono } from 'next/font/google'
import '../globals/globals.css'
import '../../node_modules/@fortawesome/fontawesome-svg-core/styles.css'

config.autoAddCss = false

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: [ 'latin' ]
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: [ 'latin' ]
})

export const metadata: Metadata = {
  title: 'Too Easy Info | Weather',
  description: 'A simple weather app so you can get the info you need, fast.'
}

export const viewport: Viewport = {
  themeColor: '#1d293d'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
