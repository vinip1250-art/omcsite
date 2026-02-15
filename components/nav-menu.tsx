'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function NavMenu() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/compras', label: 'Compras' },
    { href: '/vendas', label: 'Vendas' },
    { href: '/estoque', label: 'Estoque' },
    { href: '/pontos', label: 'Pontos' },
    { href: '/produtos', label: 'Produtos' },
    { href: '/contas', label: 'Contas' },
    { href: '/programas', label: 'Programas' },
    { href: '/lojas', label: 'Lojas' },
    { href: '/relatorios', label: 'Relatórios' },
  ]

  if (!session) return null

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-blue-600">OMC Site</h1>
            <div className="hidden md:flex space-x-1">
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    pathname === link.href
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}>
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user?.name}</span>
            <Button onClick={() => signOut({ callbackUrl: '/auth/login' })} size="sm" variant="outline">
              Sair
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
