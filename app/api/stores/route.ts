import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(stores)
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const store = await prisma.store.create({
      data: {
        name: body.name,
        active: body.active !== false
      }
    })
    return NextResponse.json(store)
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ error: 'Erro ao criar loja' }, { status: 500 })
  }
}
