import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const stock = await prisma.stock.findMany({
      include: { product: true },
      orderBy: { product: { name: 'asc' } }
    })

    return NextResponse.json(stock)
  } catch (error) {
    console.error('Erro ao buscar estoque:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estoque' },
      { status: 500 }
    )
  }
}
