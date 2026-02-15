import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Buscar compras com pontos não recebidos (pointsReceived = false)
    const purchases = await prisma.purchase.findMany({
      where: {
        pointsReceived: false, // BOOLEAN ao invés de STRING
        status: { in: ['PENDING', 'DELIVERED', 'SOLD'] }
      },
      select: {
        clubAndStore: true,
        account: true,
        points: true
      }
    })

    // Agrupar por programa
    const programsMap = {}

    purchases.forEach(purchase => {
      // Extrair nome do programa (ex: "CB/Esfera" -> "Esfera")
      const programParts = purchase.clubAndStore?.split('/') || []
      const programName = programParts[programParts.length - 1] || 'Outros'

      if (!programsMap[programName]) {
        programsMap[programName] = {
          program: programName,
          total: 0,
          Miri: 0,
          Vini: 0,
          Lindy: 0,
          Milla: 0,
          Tony: 0
        }
      }

      const points = purchase.points || 0
      programsMap[programName].total += points

      if (purchase.account && programsMap[programName][purchase.account] !== undefined) {
        programsMap[programName][purchase.account] += points
      }
    })

    const result = Object.values(programsMap)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao buscar pontos a receber:', error)
    return NextResponse.json([], { status: 200 })
  }
}
