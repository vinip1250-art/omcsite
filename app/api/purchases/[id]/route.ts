import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        product: true
      }
    })

    if (!purchase) {
      return NextResponse.json({ error: 'Compra não encontrada' }, { status: 404 })
    }

    return NextResponse.json(purchase)
  } catch (error) {
    console.error('Erro ao buscar compra:', error)
    return NextResponse.json({ error: 'Erro ao buscar compra' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: any = {}

    // Campos básicos
    if (body.productId !== undefined) updateData.productId = body.productId
    if (body.purchaseDate !== undefined) updateData.purchaseDate = new Date(body.purchaseDate)
    if (body.deliveryDate !== undefined) updateData.deliveryDate = new Date(body.deliveryDate)
    if (body.orderNumber !== undefined) updateData.orderNumber = body.orderNumber
    if (body.paidValue !== undefined) updateData.paidValue = parseFloat(body.paidValue)
    if (body.shipping !== undefined) updateData.shipping = parseFloat(body.shipping)
    if (body.advanceDiscount !== undefined) updateData.advanceDiscount = parseFloat(body.advanceDiscount)
    if (body.cashback !== undefined) updateData.cashback = parseFloat(body.cashback)
    if (body.points !== undefined) updateData.points = parseFloat(body.points)
    if (body.thousand !== undefined) updateData.thousand = parseFloat(body.thousand)
    if (body.account !== undefined) updateData.account = body.account
    if (body.clubAndStore !== undefined) updateData.clubAndStore = body.clubAndStore
    if (body.pointsPerReal !== undefined) updateData.pointsPerReal = parseFloat(body.pointsPerReal)
    if (body.pointsReceived !== undefined) updateData.pointsReceived = body.pointsReceived

    // Calcular custo final
    if (body.paidValue !== undefined || body.shipping !== undefined || 
        body.advanceDiscount !== undefined || body.cashback !== undefined || 
        body.points !== undefined || body.thousand !== undefined) {
      
      const current = await prisma.purchase.findUnique({ where: { id } })
      
      const paidValue = body.paidValue !== undefined ? parseFloat(body.paidValue) : (current?.paidValue || 0)
      const shipping = body.shipping !== undefined ? parseFloat(body.shipping) : (current?.shipping || 0)
      const advanceDiscount = body.advanceDiscount !== undefined ? parseFloat(body.advanceDiscount) : (current?.advanceDiscount || 0)
      const cashback = body.cashback !== undefined ? parseFloat(body.cashback) : (current?.cashback || 0)
      const points = body.points !== undefined ? parseFloat(body.points) : (current?.points || 0)
      const thousand = body.thousand !== undefined ? parseFloat(body.thousand) : (current?.thousand || 0)

      updateData.finalCost = paidValue + shipping - advanceDiscount - cashback - points - thousand
    }

    // Status
    if (body.status !== undefined) {
      updateData.status = body.status

      if (body.status === 'DELIVERED' && body.deliveryDate === undefined) {
        updateData.deliveryDate = new Date()
      }
    }

    // Campos de venda
    if (body.soldValue !== undefined) updateData.soldValue = parseFloat(body.soldValue)
    if (body.saleDate !== undefined) updateData.saleDate = new Date(body.saleDate)
    if (body.customer !== undefined) updateData.customer = body.customer
    if (body.serialNumber !== undefined) updateData.serialNumber = body.serialNumber
    if (body.month !== undefined) updateData.month = body.month

    // Calcular lucro
    if (body.soldValue !== undefined || updateData.finalCost !== undefined) {
      const current = await prisma.purchase.findUnique({ where: { id } })
      const soldValue = body.soldValue !== undefined ? parseFloat(body.soldValue) : (current?.soldValue || 0)
      const finalCost = updateData.finalCost !== undefined ? updateData.finalCost : (current?.finalCost || 0)
      
      updateData.profit = soldValue - finalCost
    }

    const purchase = await prisma.purchase.update({
      where: { id },
      data: updateData,
      include: {
        product: true
      }
    })

    return NextResponse.json(purchase)
  } catch (error) {
    console.error('Erro ao atualizar compra:', error)
    return NextResponse.json({ error: 'Erro ao atualizar compra' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await prisma.purchase.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar compra:', error)
    return NextResponse.json({ error: 'Erro ao deletar compra' }, { status: 500 })
  }
}
