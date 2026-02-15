import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'mensal'
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))

    // Definir range de datas baseado no período
    let startDate: Date
    let endDate: Date

    if (period === 'mensal') {
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0, 23, 59, 59)
    } else {
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31, 23, 59, 59)
    }

    // Buscar compras do período
    const purchases = await prisma.purchase.findMany({
      where: {
        userId: session.user.id,
        purchaseDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        product: true
      }
    })

    // Calcular estatísticas
    const totalPurchases = purchases.length
    const totalInvested = purchases.reduce((sum, p) => sum + p.finalCost, 0)
    const totalSold = purchases.filter(p => p.soldValue).length
    const totalRevenue = purchases.reduce((sum, p) => sum + (p.soldValue || 0), 0)
    const totalProfit = purchases.reduce((sum, p) => sum + (p.profit || 0), 0)
    const inStock = purchases.filter(p => p.status === 'DELIVERED' && !p.soldValue).length

    return NextResponse.json({
      period,
      month,
      year,
      stats: {
        totalPurchases,
        totalInvested,
        totalSold,
        totalRevenue,
        totalProfit,
        inStock
      },
      purchases
    })
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json({ error: 'Erro ao gerar relatório' }, { status: 500 })
  }
}
