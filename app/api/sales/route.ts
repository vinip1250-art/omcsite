import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const sales = await prisma.purchase.findMany({
      where: { status: 'SOLD' },
      include: { product: true },
      orderBy: { saleDate: 'desc' }
    })

    return NextResponse.json(sales)
  } catch (error) {
    console.error('Erro ao buscar vendas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar vendas' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { purchaseId, soldValue, saleDate, customer, profit } = body

    // Obter a data de venda
    const saleDateObj = new Date(saleDate)
    const month = saleDateObj.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).toUpperCase().replace('.', '')

    // Atualizar a compra para status SOLD
    const updatedPurchase = await prisma.$transaction(async (tx) => {
      // Atualizar a compra
      const purchase = await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          status: 'SOLD',
          soldValue,
          saleDate: new Date(saleDate),
          customer,
          profit,
          month
        },
        include: { product: true }
      })

      // Atualizar estoque (decrementar inStock)
      await tx.stock.update({
        where: { productId: purchase.productId },
        data: { inStock: { decrement: 1 } }
      })

      return purchase
    })

    return NextResponse.json(updatedPurchase)
  } catch (error) {
    console.error('Erro ao registrar venda:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar venda' },
      { status: 500 }
    )
  }
}
