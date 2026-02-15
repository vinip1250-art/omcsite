import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

const prisma = new PrismaClient()

// Função auxiliar para converter data
function convertDate(dateValue) {
  if (!dateValue) return null

  // Se já é ISO completo, usar direto
  if (typeof dateValue === 'string' && dateValue.includes('T')) {
    return dateValue
  }

  // Se é data simples (YYYY-MM-DD), converter para ISO
  if (typeof dateValue === 'string' && dateValue.length === 10) {
    return new Date(dateValue + 'T12:00:00.000-03:00').toISOString()
  }

  // Se é Date object, converter
  if (dateValue instanceof Date) {
    return dateValue.toISOString()
  }

  // Tentar criar Date e converter
  try {
    return new Date(dateValue).toISOString()
  } catch {
    return null
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Verificar se a compra pertence ao usuário
    const purchase = await prisma.purchase.findUnique({
      where: { id }
    })

    if (!purchase || purchase.userId !== session.user.id) {
      return NextResponse.json({ error: 'Compra não encontrada' }, { status: 404 })
    }

    const updateData = {}

    if (body.status !== undefined) {
      updateData.status = body.status

      if (body.status === 'DELIVERED' && body.deliveryDate === undefined) {
        updateData.deliveryDate = new Date().toISOString()
      }
    }

    if (body.deliveryDate !== undefined) {
      updateData.deliveryDate = convertDate(body.deliveryDate)
    }

    if (body.purchaseDate !== undefined) {
      updateData.purchaseDate = convertDate(body.purchaseDate)
    }

    if (body.pointsReceived !== undefined) {
      updateData.pointsReceived = body.pointsReceived
    }

    if (body.paidValue !== undefined) {
      updateData.paidValue = parseFloat(body.paidValue)
    }

    if (body.freight !== undefined) {
      updateData.shipping = parseFloat(body.freight)
    }

    if (body.advanceDiscount !== undefined) {
      updateData.advanceDiscount = parseFloat(body.advanceDiscount)
    }

    if (body.points !== undefined) {
      updateData.points = parseFloat(body.points)
    }

    if (body.cashback !== undefined) {
      updateData.cashback = parseFloat(body.cashback)
    }

    if (body.thousand !== undefined) {
      updateData.thousand = parseFloat(body.thousand)
    }

    if (body.pointsPerReal !== undefined) {
      updateData.pointsPerReal = parseFloat(body.pointsPerReal)
    }

    if (body.clubAndStore !== undefined) {
      updateData.clubAndStore = body.clubAndStore
    }

    if (body.account !== undefined) {
      updateData.account = body.account
    }

    if (body.orderNumber !== undefined) {
      updateData.orderNumber = body.orderNumber
    }

    // Campos de venda
    if (body.soldValue !== undefined) {
      updateData.soldValue = parseFloat(body.soldValue)
    }

    if (body.saleDate !== undefined) {
      updateData.saleDate = convertDate(body.saleDate)
    }

    if (body.customer !== undefined) {
      updateData.customer = body.customer
    }

    if (body.serialNumber !== undefined) {
      updateData.serialNumber = body.serialNumber
    }

    if (body.month !== undefined) {
      updateData.month = body.month
    }

    if (body.profit !== undefined) {
      updateData.profit = parseFloat(body.profit)
    }

    // RECALCULAR CUSTO FINAL se algum campo relevante mudou
    const needsRecalc = [
      'paidValue', 'freight', 'advanceDiscount', 
      'cashback', 'points', 'thousand'
    ].some(field => body[field] !== undefined)

    if (needsRecalc) {
      const paidValue = updateData.paidValue ?? purchase.paidValue
      const shipping = updateData.shipping ?? purchase.shipping
      const advanceDiscount = updateData.advanceDiscount ?? purchase.advanceDiscount
      const cashback = updateData.cashback ?? purchase.cashback
      const points = updateData.points ?? purchase.points
      const thousand = updateData.thousand ?? purchase.thousand

      const pointsValue = thousand > 0 ? points / thousand : 0
      updateData.finalCost = paidValue + shipping - advanceDiscount - cashback - pointsValue
    }

    const updated = await prisma.purchase.update({
      where: { id },
      data: updateData,
      include: {
        product: true
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Erro ao atualizar compra:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar compra', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Verificar se a compra pertence ao usuário
    const purchase = await prisma.purchase.findUnique({
      where: { id }
    })

    if (!purchase || purchase.userId !== session.user.id) {
      return NextResponse.json({ error: 'Compra não encontrada' }, { status: 404 })
    }

    await prisma.purchase.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar compra:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar compra', details: error.message },
      { status: 500 }
    )
  }
}
