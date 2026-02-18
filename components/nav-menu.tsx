'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function NavMenu() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [menuAberto, setMenuAberto] = useState(false)

  const links = [
    { href: '/',           label: '🏠 Dashboard' },
    { href: '/compras',    label: '🛍️ Compras'    },
    { href: '/vendas',     label: '💰 Vendas'     },
    { href: '/estoque',    label: '📦 Estoque'    },
    { href: '/pontos',     label: '⭐ Pontos'     },
    { href: '/produtos',   label: '📱 Produtos'   },
    { href: '/relatorios', label: '📊 Relatórios' },
  ]

  if (!session) return null

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-blue-600">OMC Site</h1>

            {/* Desktop links */}
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

          {/* Desktop: user + sair */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user?.name}</span>
            <Button onClick={() => signOut({ callbackUrl: '/auth/login' })} size="sm" variant="outline">
              Sair
            </Button>
          </div>

          {/* Mobile: hamburguer */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setMenuAberto(!menuAberto)}
            aria-label="Menu"
          >
            {menuAberto ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {menuAberto && (
          <div className="md:hidden border-t py-2 space-y-1 pb-4">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuAberto(false)}>
                <span className={`block px-4 py-3 rounded-md text-sm font-medium transition ${
                  pathname === link.href
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}>
                  {link.label}
                </span>
              </Link>
            ))}
            <div className="border-t pt-3 px-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">{session.user?.name}</span>
              <Button onClick={() => signOut({ callbackUrl: '/auth/login' })} size="sm" variant="outline">
                Sair
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
