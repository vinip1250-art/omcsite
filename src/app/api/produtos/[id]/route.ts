import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { name, model, storage, color, active } = body

  const produto = await prisma.product.update({
    where: { id: params.id, userId: session.user.id },
    data: { name, model, storage, color, active }
  })

  return NextResponse.json(produto)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  await prisma.product.delete({
    where: { id: params.id, userId: session.user.id }
  })

  return NextResponse.json({ success: true })
}
