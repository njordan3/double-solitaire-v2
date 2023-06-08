"use client"

import { SocketProvider } from './contexts/socket.context'
import { UserProvider } from './contexts/user.context'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

interface RootLayoutProps {
  children: React.ReactNode
}
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </UserProvider>
      </body>
    </html>
  )
}
