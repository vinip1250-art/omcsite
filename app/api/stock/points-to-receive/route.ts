import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const purchases = await prisma.purchase.findMany({
      where: {
        userId: session.user.id,
        pointsReceived: false,
        status: { in: ['PENDING', 'DELIVERED', 'SOLD'] }
      },
      select: {
        account: true,
        clubAndStore: true,
        points: true,
        pointsPerReal: true
      }
    })

    // Agrupar por conta/clube
    const pointsMap: any = {}

    purchases.forEach((purchase) => {
      const key = `${purchase.account} - ${purchase.clubAndStore}`
      
      if (!pointsMap[key]) {
        pointsMap[key] = {
          account: purchase.account,
          program: purchase.clubAndStore,
          pointsToReceive: 0
        }
      }
      
      pointsMap[key].pointsToReceive += purchase.points
    })

    const result = Object.values(pointsMap)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao buscar pontos a receber:', error)
    return NextResponse.json({ error: 'Erro ao buscar pontos' }, { status: 500 })
  }
}
