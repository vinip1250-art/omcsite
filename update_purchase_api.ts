import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, deliveryDate } = body

    const updateData = { status }

    // Se está marcando como entregue e não tem data de entrega, adiciona a data atual
    if (status === 'DELIVERED' && deliveryDate) {
      updateData.deliveryDate = new Date(deliveryDate)
    }

    // Atualizar a compra
    const purchase = await prisma.$transaction(async (tx) => {
      const updated = await tx.purchase.update({
        where: { id },
        data: updateData,
        include: { product: true }
      })

      // Se mudou para DELIVERED, atualizar estoque
      if (status === 'DELIVERED') {
        await tx.stock.update({
          where: { productId: updated.productId },
          data: { 
            onTheWay: { decrement: 1 },
            inStock: { increment: 1 }
          }
        })
      }

      return updated
    })

    return NextResponse.json(purchase)
  } catch (error) {
    console.error('Erro ao atualizar compra:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar compra' },
      { status: 500 }
    )
  }
}
