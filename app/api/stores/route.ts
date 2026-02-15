import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const stores = await prisma.store.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(stores)
  } catch (error) {
    console.error('Erro ao buscar lojas:', error)
    return NextResponse.json({ error: 'Erro ao buscar lojas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()

    const store = await prisma.store.create({
      data: {
        name: body.name,
        active: body.active !== false,
        userId: session.user.id
      }
    })

    return NextResponse.json(store)
  } catch (error) {
    console.error('Erro ao criar loja:', error)
    return NextResponse.json({ error: 'Erro ao criar loja' }, { status: 500 })
  }
}
