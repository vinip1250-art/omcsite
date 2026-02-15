import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const program = await prisma.program.update({
      where: { id },
      data: {
        name: body.name,
        active: body.active
      }
    })

    return NextResponse.json(program)
  } catch (error) {
    console.error('Erro ao atualizar programa:', error)
    return NextResponse.json({ error: 'Erro ao atualizar programa' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await prisma.program.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar programa:', error)
    return NextResponse.json({ error: 'Erro ao deletar programa' }, { status: 500 })
  }
}
