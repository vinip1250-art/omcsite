import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/',
    '/compras/:path*',
    '/vendas/:path*',
    '/estoque/:path*',
    '/pontos/:path*',
    '/produtos/:path*',
    '/relatorios/:path*',
  ]
}
