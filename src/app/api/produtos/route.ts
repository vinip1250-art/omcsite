import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const produtos = await prisma.product.findMany({
    where: { userId: session.user.id },
    orderBy: { name: 'asc' },
    include: {
      stock: true,
      _count: { select: { purchases: true } }
    }
  })

  return NextResponse.json(produtos)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { name, model, storage, color } = body

  if (!name || !model || !storage || !color) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
  }

  const produto = await prisma.product.create({
    data: {
      name,
      model,
      storage,
      color,
      userId: session.user.id
    }
  })

  return NextResponse.json(produto, { status: 201 })
}
