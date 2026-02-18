import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { purchaseId, pointsReceived } = await request.json()

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId }
    })

    if (!purchase || purchase.userId !== session.user.id) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    }

    const updated = await prisma.purchase.update({
      where: { id: purchaseId },
      data: { pointsReceived },
      include: { product: true }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Erro ao atualizar pontos:', error)
    return NextResponse.json({ error: 'Erro ao atualizar pontos' }, { status: 500 })
  }
}
