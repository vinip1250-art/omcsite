import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const programs = await prisma.pointsProgram.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(programs)
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const program = await prisma.pointsProgram.create({
      data: {
        name: body.name,
        store: body.store,
        type: body.type || 'POINTS',
        active: true
      }
    })
    return NextResponse.json(program)
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ error: 'Erro ao criar programa' }, { status: 500 })
  }
}
