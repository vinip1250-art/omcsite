import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Preparar dados para atualização
    const updateData = {}

    if (body.status !== undefined) {
      updateData.status = body.status
    }

    if (body.deliveryDate !== undefined) {
      updateData.deliveryDate = body.deliveryDate 
        ? new Date(body.deliveryDate + 'T00:00:00.000Z').toISOString()
        : null
    }

    if (body.purchaseDate !== undefined) {
      if (typeof body.purchaseDate === 'string' && body.purchaseDate.length === 10) {
        updateData.purchaseDate = new Date(body.purchaseDate + 'T00:00:00.000Z').toISOString()
      } else {
        updateData.purchaseDate = body.purchaseDate
      }
    }

    if (body.pointsReceived !== undefined) {
      updateData.pointsReceived = body.pointsReceived
    }

    if (body.paidValue !== undefined) {
      updateData.paidValue = parseFloat(body.paidValue)
    }

    if (body.freight !== undefined) {
      updateData.shipping = parseFloat(body.freight)  // <-- freight → shipping
    }

    if (body.advanceDiscount !== undefined) {
      updateData.advanceDiscount = parseFloat(body.advanceDiscount)
    }

    if (body.points !== undefined) {
      updateData.points = parseFloat(body.points)
    }

    if (body.cashback !== undefined) {
      updateData.cashback = parseFloat(body.cashback)
    }

    if (body.finalCost !== undefined) {
      updateData.finalCost = parseFloat(body.finalCost)
    }

    if (body.clubAndStore !== undefined) {
      updateData.clubAndStore = body.clubAndStore
    }

    if (body.account !== undefined) {
      updateData.account = body.account
    }

    const purchase = await prisma.purchase.update({
      where: { id },
      data: updateData
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

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    await prisma.purchase.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar compra:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar compra' },
      { status: 500 }
    )
  }
}
