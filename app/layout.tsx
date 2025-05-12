import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rich Text Editor',
  description: 'Created with Nand Kishore',
  generator: 'nandk@thinkdatalabs.com',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
