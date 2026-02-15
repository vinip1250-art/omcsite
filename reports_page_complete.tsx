'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function RelatoriosPage() {
  const [purchases, setPurchases] = useState([])
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/purchases')
      const data = await res.json()
      setPurchases(data)
      setLoading(false)
    } catch (error) {
      console.error('Erro:', error)
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Filtrar compras do mês/ano
  const filteredPurchases = purchases.filter(p => {
    if (!p.purchaseDate) return false
    const date = new Date(p.purchaseDate)
    return date.getMonth() === filterMonth - 1 && date.getFullYear() === filterYear
  })

  // Filtrar vendas do mês/ano
  const filteredSales = filteredPurchases.filter(p => p.status === 'SOLD')

  // CÁLCULOS CORRIGIDOS

  // Total Investido = Valor Pago (SEM descontar cashback)
  const totalInvestido = filteredPurchases.reduce((sum, p) => sum + (p.paidValue || 0), 0)

  // Total Faturado = Soma das vendas
  const totalFaturado = filteredSales.reduce((sum, p) => sum + (p.soldValue || 0), 0)

  // Lucro Total = Total Faturado - Custo Final das vendas
  const custoFinalVendas = filteredSales.reduce((sum, p) => sum + (p.finalCost || 0), 0)
  const lucroTotal = totalFaturado - custoFinalVendas

  // Desagio = Valor Original de Compra - Valor de Venda
  const desagio = filteredSales.reduce((sum, p) => {
    return sum + ((p.paidValue || 0) - (p.soldValue || 0))
  }, 0)

  // Cashback Total = Cashback de Valor + Valor dos Pontos
  const cashbackTotal = filteredPurchases.reduce((sum, p) => {
    const cashbackValor = p.cashback || 0
    const valorPontos = (p.points || 0) / (p.thousand || 1) // Pontos convertidos em reais
    return sum + cashbackValor + valorPontos
  }, 0)

  // Pontos Totais
  const pontosTotais = filteredPurchases.reduce((sum, p) => sum + (p.points || 0), 0)

  // TOP 10 PRODUTOS
  const productSales = {}
  filteredSales.forEach(p => {
    const productName = p.product?.name || 'N/A'
    if (!productSales[productName]) {
      productSales[productName] = {
        name: productName,
        quantity: 0,
        totalRevenue: 0,
        totalProfit: 0
      }
    }
    productSales[productName].quantity += 1
    productSales[productName].totalRevenue += p.soldValue || 0
    productSales[productName].totalProfit += p.profit || 0
  })
  const top10Products = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)

  // TOP 10 CLIENTES
  const clientSales = {}
  filteredSales.forEach(p => {
    const customer = p.customer || 'Sem Cliente'
    if (!clientSales[customer]) {
      clientSales[customer] = {
        name: customer,
        quantity: 0,
        totalRevenue: 0,
        totalProfit: 0
      }
    }
    clientSales[customer].quantity += 1
    clientSales[customer].totalRevenue += p.soldValue || 0
    clientSales[customer].totalProfit += p.profit || 0
  })
  const top10Clients = Object.values(clientSales)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10)

  // TOP 10 PROGRAMAS
  const programSales = {}
  filteredPurchases.forEach(p => {
    const program = p.clubAndStore || 'N/A'
    if (!programSales[program]) {
      programSales[program] = {
        name: program,
        quantity: 0,
        totalPoints: 0,
        totalValue: 0
      }
    }
    programSales[program].quantity += 1
    programSales[program].totalPoints += p.points || 0
    programSales[program].totalValue += p.paidValue || 0
  })
  const top10Programs = Object.values(programSales)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 10)

  const years = [2025, 2026, 2027, 2028, 2029, 2030]
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <p className="text-gray-600 mt-1">Análise completa de performance e resultados</p>
      </div>

      {/* Filtro de Mês/Ano */}
      <Card>
        <CardHeader>
          <CardTitle>Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="text-sm font-medium mb-1 block">Mês/Ano</label>
              <Select value={`${filterMonth}-${filterYear}`} onValueChange={(v) => { const [m, y] = v.split('-'); setFilterMonth(parseInt(m)); setFilterYear(parseInt(y)) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {years.flatMap(year => months.map((month, idx) => <SelectItem key={`${idx + 1}-${year}`} value={`${idx + 1}-${year}`}>{month}/{year}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 font-medium">Total Investido</p>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalInvestido)}</p>
            <p className="text-xs text-gray-500 mt-1">Valor pago (sem cashback)</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 font-medium">Total Faturado</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalFaturado)}</p>
            <p className="text-xs text-gray-500 mt-1">{filteredSales.length} vendas</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 font-medium">Lucro Total</p>
            <p className="text-3xl font-bold text-orange-600">{formatCurrency(lucroTotal)}</p>
            <p className="text-xs text-gray-500 mt-1">Faturado - Custo Final</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 font-medium">Deságio</p>
            <p className="text-3xl font-bold text-purple-600">{formatCurrency(desagio)}</p>
            <p className="text-xs text-gray-500 mt-1">Valor Original - Venda</p>
          </CardContent>
        </Card>

        <Card className="bg-pink-50 border-pink-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 font-medium">Valor em Cashback</p>
            <p className="text-3xl font-bold text-pink-600">{formatCurrency(cashbackTotal)}</p>
            <p className="text-xs text-gray-500 mt-1">Cashback + Pontos</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 font-medium">Total de Pontos</p>
            <p className="text-3xl font-bold text-yellow-600">{pontosTotais.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-gray-500 mt-1">{filteredPurchases.length} compras</p>
          </CardContent>
        </Card>
      </div>

      {/* TOP 10 PRODUTOS */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Produtos Mais Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          {top10Products.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Nenhuma venda no período</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">#</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">Qtd Vendida</TableHead>
                  <TableHead className="text-right">Receita Total</TableHead>
                  <TableHead className="text-right">Lucro Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top10Products.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-center font-bold">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center"><Badge className="bg-blue-500">{item.quantity}</Badge></TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(item.totalRevenue)}</TableCell>
                    <TableCell className="text-right font-bold text-green-600">{formatCurrency(item.totalProfit)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* TOP 10 CLIENTES */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {top10Clients.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Nenhum cliente no período</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">#</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-center">Qtd Compras</TableHead>
                  <TableHead className="text-right">Receita Total</TableHead>
                  <TableHead className="text-right">Lucro Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top10Clients.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-center font-bold">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center"><Badge className="bg-purple-500">{item.quantity}</Badge></TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(item.totalRevenue)}</TableCell>
                    <TableCell className="text-right font-bold text-green-600">{formatCurrency(item.totalProfit)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* TOP 10 PROGRAMAS */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Programas/Lojas</CardTitle>
        </CardHeader>
        <CardContent>
          {top10Programs.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Nenhum programa no período</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">#</TableHead>
                  <TableHead>Programa/Loja</TableHead>
                  <TableHead className="text-center">Qtd Compras</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-right">Total Pontos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top10Programs.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-center font-bold">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center"><Badge className="bg-orange-500">{item.quantity}</Badge></TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(item.totalValue)}</TableCell>
                    <TableCell className="text-right font-bold text-yellow-600">{item.totalPoints.toLocaleString('pt-BR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">📊 Definições:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Total Investido</strong>: Valor pago nas compras (sem descontar cashback)</li>
            <li>• <strong>Deságio</strong>: Diferença entre valor original de compra vs valor de venda</li>
            <li>• <strong>Valor em Cashback</strong>: Soma de cashback em dinheiro + valor dos pontos</li>
            <li>• <strong>Lucro Total</strong>: Faturamento - Custo Final (já considera cashback e descontos)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
