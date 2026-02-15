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
    }

    if (body.purchaseDate !== undefined) {
      updateData.purchaseDate = body.purchaseDate
    }

    if (body.pointsReceived !== undefined) {
      updateData.pointsReceived = body.pointsReceived
    }

    if (body.paidValue !== undefined) {
      updateData.paidValue = body.paidValue
    }

    if (body.freight !== undefined) {
      updateData.freight = body.freight
    }

    if (body.advanceDiscount !== undefined) {
      updateData.advanceDiscount = body.advanceDiscount
    }

    if (body.points !== undefined) {
      updateData.points = body.points
    }

    if (body.cashback !== undefined) {
      updateData.cashback = body.cashback
    }

    if (body.finalCost !== undefined) {
      updateData.finalCost = body.finalCost
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
