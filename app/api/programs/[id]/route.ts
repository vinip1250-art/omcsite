import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()

    const program = await prisma.pointsProgram.update({
      where: { id },
      data: {
        name: body.name,
        store: body.store,
        type: body.type,
        active: body.active
      }
    })

    return NextResponse.json(program)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}
