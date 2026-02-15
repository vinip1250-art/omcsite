export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/',
    '/compras/:path*',
    '/vendas/:path*',
    '/estoque/:path*',
    '/pontos/:path*',
    '/produtos/:path*',
    '/contas/:path*',
    '/programas/:path*',
    '/lojas/:path*',
    '/relatorios/:path*',
  ]
}
