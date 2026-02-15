import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const product = await prisma.product.create({
      data: {
        name: body.name,
        model: body.model,
        storage: body.storage,
        color: body.color,
        active: true
      }
    })

    // Criar estoque zerado
    await prisma.stock.create({
      data: {
        productId: product.id,
        onTheWay: 0,
        inStock: 0,
        averageUnitCost: 0,
        averageStockCost: 0,
        totalInStock: 0
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
  }
}
