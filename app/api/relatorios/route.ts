import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dataInicio = searchParams.get('dataInicio')
    const dataFim    = searchParams.get('dataFim')

    const where: any = { userId: session.user.id }
    if (dataInicio || dataFim) {
      where.purchaseDate = {}
      if (dataInicio) where.purchaseDate.gte = new Date(dataInicio)
      if (dataFim)    where.purchaseDate.lte = new Date(dataFim + 'T23:59:59')
    }

    const [compras, vendas] = await Promise.all([
      prisma.purchase.findMany({
        where,
        include: { product: true },
        orderBy: { purchaseDate: 'desc' },
      }),
      prisma.purchase.findMany({
        where: {
          ...where,
          status: 'SOLD',
          ...(dataInicio || dataFim ? {
            saleDate: {
              ...(dataInicio ? { gte: new Date(dataInicio) } : {}),
              ...(dataFim    ? { lte: new Date(dataFim + 'T23:59:59') } : {}),
            }
          } : {})
        },
        include: { product: true },
        orderBy: { saleDate: 'desc' },
      }),
    ])

    return NextResponse.json({ compras, vendas })
  } catch (error) {
    console.error('Erro ao buscar relatórios:', error)
    return NextResponse.json({ error: 'Erro ao buscar relatórios' }, { status: 500 })
  }
}
