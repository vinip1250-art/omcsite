import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

type Params = { params: Promise<{ id: string }> }

async function getSaleForUser(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Não autorizado' }, { status: 401 }) }
  }
  const sale = await prisma.purchase.findUnique({
    where: { id },
    include: { product: true }
  })
  if (!sale || sale.userId !== session.user.id) {
    return { error: NextResponse.json({ error: 'Venda não encontrada' }, { status: 404 }) }
  }
  return { sale, session }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const { sale, error } = await getSaleForUser(id)
    if (error) return error

    const body = await request.json()
    const { soldValue, saleDate, customer, serialNumber, profit } = body

    const updated = await prisma.purchase.update({
      where: { id: sale!.id },
      data: {
        soldValue:    soldValue    !== undefined ? parseFloat(soldValue)   : sale!.soldValue,
        saleDate:     saleDate     ? new Date(saleDate)                    : sale!.saleDate,
        customer:     customer     !== undefined ? (customer || null)      : sale!.customer,
        serialNumber: serialNumber !== undefined ? (serialNumber || null)  : sale!.serialNumber,
        profit:       profit       !== undefined ? parseFloat(profit)      : sale!.profit,
      },
      include: { product: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Erro ao editar venda:', error)
    return NextResponse.json({ error: 'Erro ao editar venda' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const { sale, error } = await getSaleForUser(id)
    if (error) return error

    if (sale!.status !== 'SOLD') {
      return NextResponse.json({ error: 'Apenas vendas concluídas podem ser canceladas' }, { status: 400 })
    }

    const updated = await prisma.$transaction(async (tx) => {
      const compra = await tx.purchase.update({
        where: { id: sale!.id },
        data: {
          status:       'DELIVERED',
          soldValue:    null,
          saleDate:     null,
          customer:     null,
          serialNumber: null,
          profit:       null,
          month:        null,
        },
        include: { product: true },
      })

      await tx.stock.update({
        where: { productId: sale!.productId },
        data:  { inStock: { increment: 1 } },
      })

      return compra
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Erro ao cancelar venda:', error)
    return NextResponse.json({ error: 'Erro ao cancelar venda' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const { sale, error } = await getSaleForUser(id)
    if (error) return error

    if (sale!.status !== 'SOLD') {
      return NextResponse.json({ error: 'Apenas vendas concluídas podem ser excluídas' }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.stock.update({
        where: { productId: sale!.productId },
        data:  { inStock: { increment: 1 } },
      })
      await tx.purchase.delete({ where: { id: sale!.id } })
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro ao excluir venda:', error)
    return NextResponse.json({ error: 'Erro ao excluir venda' }, { status: 500 })
  }
}
