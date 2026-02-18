import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const sales = await prisma.purchase.findMany({
      where: {
        status: 'SOLD',
        userId: session.user.id
      },
      include: { product: true },
      orderBy: { saleDate: 'desc' }
    })

    return NextResponse.json(sales)
  } catch (error) {
    console.error('Erro ao buscar vendas:', error)
    return NextResponse.json({ error: 'Erro ao buscar vendas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { purchaseId, soldValue, saleDate, customer, serialNumber, profit } = body

    const saleDateObj = new Date(saleDate)
    const month = saleDateObj
      .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      .toUpperCase()
      .replace('.', '')

    const updatedPurchase = await prisma.$transaction(async (tx) => {
      // Garante que a compra pertence ao usuário logado
      const existing = await tx.purchase.findUnique({ where: { id: purchaseId } })
      if (!existing || existing.userId !== session.user.id) {
        throw new Error('Compra não encontrada ou sem permissão')
      }

      const purchase = await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          status: 'SOLD',
          soldValue: parseFloat(soldValue),
          saleDate: saleDateObj,
          customer: customer || null,
          serialNumber: serialNumber || null,
          profit: parseFloat(profit),
          month,
        },
        include: { product: true }
      })

      const stock = await tx.stock.findUnique({ where: { productId: purchase.productId } })
      if (stock && stock.inStock > 0) {
        await tx.stock.update({
          where: { productId: purchase.productId },
          data: { inStock: { decrement: 1 } }
        })
      }

      return purchase
    })

    return NextResponse.json(updatedPurchase)
  } catch (error) {
    console.error('Erro ao registrar venda:', error)
    return NextResponse.json({ error: 'Erro ao registrar venda' }, { status: 500 })
  }
}
