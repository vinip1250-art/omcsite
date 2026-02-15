import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const accounts = await prisma.pointsAccount.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        program: true
      },
      orderBy: { accountName: 'asc' }
    })

    // Agrupar por programa
    const programsMap: any = {}
    
    accounts.forEach((account) => {
      const programName = account.program.name
      
      if (!programsMap[programName]) {
        programsMap[programName] = {
          program: programName,
          accounts: []
        }
      }
      
      programsMap[programName].accounts.push({
        id: account.id,
        account: account.accountName,
        currentBalance: account.currentPoints,
        pointsToReceive: account.pointsToReceive
      })
    })

    const result = Object.values(programsMap)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao buscar pontos:', error)
    return NextResponse.json({ error: 'Erro ao buscar pontos' }, { status: 500 })
  }
}
