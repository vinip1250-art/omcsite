import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(campaigns)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar campanhas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, imageUrl, fileUrl } = body

    if (!title) {
      return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 })
    }

    const campaign = await prisma.campaign.create({
      data: {
        title,
        description: description || null,
        imageUrl:    imageUrl    || null,
        fileUrl:     fileUrl     || null,
        createdBy:   session.user.name ?? session.user.email ?? 'Usuário',
      }
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar campanha' }, { status: 500 })
  }
}
