import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Buscar compras com pontos não recebidos
    const purchases = await prisma.purchase.findMany({
      where: {
        pointsReceived: false,
        status: { in: ['PENDING', 'DELIVERED'] }
      },
      include: {
        product: true
      },
      orderBy: {
        purchaseDate: 'desc'
      }
    })

    // Mapear para formato mais útil
    const result = purchases.map(purchase => ({
      id: purchase.id,
      clubAndStore: purchase.clubAndStore,
      account: purchase.account,
      points: purchase.points,
      product: purchase.product,
      purchaseDate: purchase.purchaseDate
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao buscar pontos a receber:', error)
    return NextResponse.json([], { status: 200 })
  }
}
