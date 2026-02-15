import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

const prisma = new PrismaClient()

// GET - Listar produtos do usuário
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      where: {
        userId: session.user.id,
        active: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    )
  }
}

// POST - Criar produto
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    
    const product = await prisma.product.create({
      data: {
        name: body.name,
        model: body.model,
        storage: body.storage,
        color: body.color,
        active: true,
        userId: session.user.id // ADICIONA userId
      }
    })

    // Criar estoque inicial
    await prisma.stock.create({
      data: {
        productId: product.id,
        userId: session.user.id, // ADICIONA userId
        onTheWay: 0,
        inStock: 0,
        averageCost: 0,
        totalValue: 0
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    )
  }
}

