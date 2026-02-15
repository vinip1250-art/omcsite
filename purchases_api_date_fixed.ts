import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        product: true
      },
      orderBy: {
        purchaseDate: 'desc'
      }
    })

    return NextResponse.json(purchases)
  } catch (error) {
    console.error('Erro ao buscar compras:', error)
    return NextResponse.json([])
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    // Garantir que o cálculo está correto no backend
    const paidValue = parseFloat(body.paidValue) || 0
    const freight = parseFloat(body.freight) || 0
    const advanceDiscount = parseFloat(body.advanceDiscount) || 0
    const cashback = parseFloat(body.cashback) || 0

    // Fórmula correta: Valor Pago + Frete - Desconto - Cashback
    const finalCost = paidValue + freight - advanceDiscount - cashback

    // Converter data para ISO DateTime
    const purchaseDate = body.purchaseDate 
      ? new Date(body.purchaseDate + 'T00:00:00.000Z').toISOString()
      : new Date().toISOString()

    const deliveryDate = body.deliveryDate 
      ? new Date(body.deliveryDate + 'T00:00:00.000Z').toISOString()
      : null

    const purchase = await prisma.purchase.create({
      data: {
        productId: body.productId,
        purchaseDate: purchaseDate,
        deliveryDate: deliveryDate,
        orderNumber: body.orderNumber,
        paidValue: paidValue,
        account: body.account,
        freight: freight,
        advanceDiscount: advanceDiscount,
        points: parseFloat(body.points) || 0,
        thousand: parseFloat(body.thousand) || 0,
        cashback: cashback,
        clubAndStore: body.clubAndStore,
        pointsPerReal: parseFloat(body.pointsPerReal) || 0,
        finalCost: finalCost,
        pointsReceived: body.pointsReceived || false,
        status: body.status || 'PENDING'
      }
    })

    return NextResponse.json(purchase)
  } catch (error) {
    console.error('Erro ao criar compra:', error)
    return NextResponse.json(
      { error: 'Erro ao criar compra', details: error.message },
      { status: 500 }
    )
  }
}
