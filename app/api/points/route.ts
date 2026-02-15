import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Buscar todas as contas de pontos com seus programas
    const accounts = await prisma.pointsAccount.findMany({
      include: {
        program: true
      }
    })

    // Agrupar por programa
    const programsMap = {}

    accounts.forEach(account => {
      const programName = account.program?.name || 'Outros'

      if (!programsMap[programName]) {
        programsMap[programName] = {
          program: programName,
          currentBalance: 0,
          pointsToReceive: 0,
          accounts: []
        }
      }

      programsMap[programName].accounts.push({
        id: account.id,
        account: account.account,
        currentBalance: account.currentBalance || 0,
        pointsToReceive: account.pointsToReceive || 0
      })
    })

    const result = Object.values(programsMap)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao buscar contas de pontos:', error)
    return NextResponse.json([], { status: 200 }) // Retorna array vazio em caso de erro
  }
}
