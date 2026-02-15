import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'
import NavMenu from '@/components/nav-menu'
import AuthProvider from '@/components/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OMC Site - Gestão de Revenda',
  description: 'Sistema de gestão completo para revenda',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider session={session}>
          <div className="min-h-screen bg-gray-50">
            <NavMenu />
            <main>{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
