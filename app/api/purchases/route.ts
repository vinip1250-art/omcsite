import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

const prisma = new PrismaClient()

// GET - Listar compras do usuário logado
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const account = searchParams.get('account')

    const where: any = {
      userId: session.user.id // FILTRO AUTOMÁTICO POR USUÁRIO
    }

    if (status) where.status = status
    if (account) where.account = account

    const purchases = await prisma.purchase.findMany({
      where,
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
    return NextResponse.json(
      { error: 'Erro ao buscar compras' },
      { status: 500 }
    )
  }
}

// POST - Criar compra (adiciona userId automaticamente)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()

    const {
      productId,
      purchaseDate,
      deliveryDate,
      orderNumber,
      account,
      clubAndStore,
      pointsReceived
    } = body

    // CONVERTER TODOS OS VALORES PARA FLOAT (corrige o erro de String)
    const paidValue = parseFloat(body.paidValue) || 0
    const shipping = parseFloat(body.freight || body.shipping) || 0
    const advanceDiscount = parseFloat(body.advanceDiscount) || 0
    const cashback = parseFloat(body.cashback) || 0
    const points = parseFloat(body.points) || 0
    const thousand = parseFloat(body.thousand) || 1
    const pointsPerReal = parseFloat(body.pointsPerReal) || 0

    // Calcular custo final
    const pointsValue = (points * thousand) / 1000
    const finalCost = paidValue + shipping - advanceDiscount - cashback - pointsValue

    const purchase = await prisma.purchase.create({
      data: {
        productId,
        userId: session.user.id, // ADICIONA userId AUTOMATICAMENTE
        purchaseDate: new Date(purchaseDate),
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        orderNumber,
        paidValue,
        shipping,
        advanceDiscount,
        cashback,
        points,
        thousand,
        finalCost,
        account,
        clubAndStore,
        pointsPerReal,
        pointsReceived: pointsReceived || false,
        status: 'PENDING'
      },
      include: {
        product: true
      }
    })

    return NextResponse.json(purchase, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar compra:', error)
    return NextResponse.json(
      { error: 'Erro ao criar compra' },
      { status: 500 }
    )
  }
}

