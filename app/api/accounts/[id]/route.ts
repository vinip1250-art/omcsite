import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()

    const account = await prisma.account.update({
      where: { id },
      data: {
        name: body.name,
        type: body.type,
        active: body.active
      }
    })

    return NextResponse.json(account)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}
