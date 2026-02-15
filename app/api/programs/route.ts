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

    const programs = await prisma.program.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(programs)
  } catch (error) {
    console.error('Erro ao buscar programas:', error)
    return NextResponse.json({ error: 'Erro ao buscar programas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()

    const program = await prisma.program.create({
      data: {
        name: body.name,
        active: body.active ?? true,
        userId: session.user.id
      }
    })

    return NextResponse.json(program)
  } catch (error) {
    console.error('Erro ao criar programa:', error)
    return NextResponse.json({ error: 'Erro ao criar programa' }, { status: 500 })
  }
}
