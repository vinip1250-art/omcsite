'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function NavMenu() {
  const pathname = usePathname()

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

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">OMC Site</h1>
            <div className="hidden md:flex space-x-2">
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === link.href
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <Button onClick={() => signOut()} variant="outline" size="sm">
            Sair
          </Button>
        </div>
      </div>
    </nav>
  )
}
