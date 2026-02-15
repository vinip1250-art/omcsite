'use client'

import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-blue-600">
            OMC Prod
          </Link>
          <nav className="hidden md:flex gap-4">
            <Link href="/compras" className="text-gray-600 hover:text-blue-600">
              Compras
            </Link>
            <Link href="/vendas" className="text-gray-600 hover:text-blue-600">
              Vendas
            </Link>
            <Link href="/estoque" className="text-gray-600 hover:text-blue-600">
              Estoque
            </Link>
            <Link href="/pontos" className="text-gray-600 hover:text-blue-600">
              Pontos
            </Link>
            <Link href="/produtos" className="text-gray-600 hover:text-blue-600">
              Produtos
            </Link>
            <Link href="/relatorios" className="text-gray-600 hover:text-blue-600">
              Relatórios
            </Link>
          </nav>
        </div>

        {session && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Olá, <strong>{session.user?.name}</strong>
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
            >
              Sair
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
