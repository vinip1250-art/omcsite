import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const account = await prisma.account.create({
      data: {
        name: body.name,
        type: body.type || 'PERSON',
        active: body.active !== false
      }
    })
    return NextResponse.json(account)
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ error: 'Erro ao criar conta' }, { status: 500 })
  }
}
