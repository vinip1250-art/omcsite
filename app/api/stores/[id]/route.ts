import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()

    const store = await prisma.store.update({
      where: { id },
      data: {
        name: body.name,
        active: body.active
      }
    })

    return NextResponse.json(store)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}
