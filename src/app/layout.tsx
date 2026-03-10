import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { ChatWidget } from '@/components/ai-assistant'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Saga Read - Read Manga, Webtoons, Comics & Novels',
  description: 'Your ultimate reading hub for manga, webtoons, comics and novels',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <Navbar />
        
        {/* ADD THESE TWO LINES - They'll fix the blue tint on EVERY page */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-black z-40 md:hidden" />
        <div className="h-0.005 w-full bg-white dark:bg-black md:hidden" />
        
        <main>{children}</main>
        {/* AI Assistant Widget - Fixed bottom right */}
        <ChatWidget />
      </body>
    </html>
  )
}