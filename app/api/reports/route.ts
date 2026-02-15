import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'mensal'
    const month = parseInt(searchParams.get('month') || new Date().getMonth() + 1)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear())

    // Definir range de datas baseado no período
    let startDate, endDate
    const now = new Date()

    switch(period) {
      case 'diario':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        break
      case 'semanal':
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        startDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate())
        endDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7)
        break
      case 'mensal':
        startDate = new Date(year, month - 1, 1)
        endDate = new Date(year, month, 1)
        break
      case 'anual':
        startDate = new Date(year, 0, 1)
        endDate = new Date(year + 1, 0, 1)
        break
      default:
        startDate = new Date(year, month - 1, 1)
        endDate = new Date(year, month, 1)
    }

    // Buscar compras do período
    const purchases = await prisma.purchase.findMany({
      where: {
        purchaseDate: {
          gte: startDate,
          lt: endDate
        }
      }
    })

    // Buscar vendas do período
    const sales = await prisma.purchase.findMany({
      where: {
        status: 'SOLD',
        saleDate: {
          gte: startDate,
          lt: endDate
        }
      }
    })

    // Buscar estoque atual
    const stock = await prisma.stock.findMany()

    // Calcular métricas
    const totalPurchases = purchases.length
    const totalInvestment = purchases.reduce((sum, p) => sum + (p.finalCost || 0), 0)

    const totalSales = sales.length
    const totalRevenue = sales.reduce((sum, s) => sum + (s.soldValue || 0), 0)
    const totalProfit = sales.reduce((sum, s) => sum + (s.profit || 0), 0)
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

    const stockValue = stock.reduce((sum, s) => sum + (s.totalInStock || 0), 0)

    const pointsEarned = purchases.reduce((sum, p) => sum + (p.points || 0), 0)
    const totalCashback = purchases.reduce((sum, p) => sum + (p.cashback || 0), 0)
    const totalDiscounts = purchases.reduce((sum, p) => sum + (p.advanceDiscount || 0), 0)

    const pointsToReceive = await prisma.purchase.findMany({
      where: { pointsReceived: false }
    })
    const pointsToReceiveTotal = pointsToReceive.reduce((sum, p) => sum + (p.points || 0), 0)

    const averageDiscount = purchases.length > 0 
      ? purchases.reduce((sum, p) => {
          const discount = p.advanceDiscount || 0
          const paid = p.paidValue || 0
          return sum + (paid > 0 ? (discount / paid) * 100 : 0)
        }, 0) / purchases.length
      : 0

    const result = {
      totalPurchases,
      totalInvestment,
      totalSales,
      totalRevenue,
      totalProfit,
      profitMargin,
      stockValue,
      pointsEarned,
      totalCashback,
      totalDiscounts,
      pointsToReceive: pointsToReceiveTotal,
      averageDiscount
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json({
      totalPurchases: 0,
      totalInvestment: 0,
      totalSales: 0,
      totalRevenue: 0,
      totalProfit: 0,
      profitMargin: 0,
      stockValue: 0,
      pointsEarned: 0,
      totalCashback: 0,
      totalDiscounts: 0,
      pointsToReceive: 0,
      averageDiscount: 0
    })
  }
}
