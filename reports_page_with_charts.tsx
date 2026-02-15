'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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

  // CÁLCULOS
  const totalInvestido = filteredPurchases.reduce((sum, p) => sum + (p.paidValue || 0), 0)
  const totalFaturado = filteredSales.reduce((sum, p) => sum + (p.soldValue || 0), 0)
  const custoFinalVendas = filteredSales.reduce((sum, p) => sum + (p.finalCost || 0), 0)
  const lucroTotal = totalFaturado - custoFinalVendas

  const desagio = filteredSales.reduce((sum, p) => {
    return sum + ((p.paidValue || 0) - (p.soldValue || 0))
  }, 0)

  const cashbackTotal = filteredPurchases.reduce((sum, p) => {
    const cashbackValor = p.cashback || 0
    const valorPontos = (p.points || 0) / (p.thousand || 1)
    return sum + cashbackValor + valorPontos
  }, 0)

  const pontosTotais = filteredPurchases.reduce((sum, p) => sum + (p.points || 0), 0)

  // PERCENTUAIS
  const percentualDesagio = totalInvestido > 0 ? (desagio / totalInvestido) * 100 : 0
  const percentualLucro = totalFaturado > 0 ? (lucroTotal / totalFaturado) * 100 : 0

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

  // DADOS PARA GRÁFICOS
  const chartProductsData = top10Products.map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    quantidade: p.quantity,
    receita: p.totalRevenue
  }))

  const chartClientsData = top10Clients.slice(0, 5).map(c => ({
    name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
    receita: c.totalRevenue,
    lucro: c.totalProfit
  }))

  const chartProgramsData = top10Programs.map(p => ({
    name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
    value: p.totalValue
  }))

  // Cores para gráficos
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16']

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
          <div className="w-full md:w-1/3">
            <label className="text-sm font-medium mb-1 block">Mês/Ano</label>
            <Select value={`${filterMonth}-${filterYear}`} onValueChange={(v) => { const [m, y] = v.split('-'); setFilterMonth(parseInt(m)); setFilterYear(parseInt(y)) }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {years.flatMap(year => months.map((month, idx) => <SelectItem key={`${idx + 1}-${year}`} value={`${idx + 1}-${year}`}>{month}/{year}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cards de KPIs com Percentuais */}
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
            <Badge className="mt-2 bg-orange-600">{percentualLucro.toFixed(1)}% do faturamento</Badge>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 font-medium">Deságio</p>
            <p className="text-3xl font-bold text-purple-600">{formatCurrency(desagio)}</p>
            <Badge className="mt-2 bg-purple-600">{percentualDesagio.toFixed(1)}% do investido</Badge>
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

      {/* GRÁFICO: Top 10 Produtos - Barras */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Top 10 Produtos - Quantidade vs Receita</CardTitle>
        </CardHeader>
        <CardContent>
          {chartProductsData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhuma venda no período</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartProductsData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                <Tooltip formatter={(value) => typeof value === 'number' && value > 100 ? formatCurrency(value) : value} />
                <Legend />
                <Bar yAxisId="left" dataKey="quantidade" fill="#3b82f6" name="Quantidade" />
                <Bar yAxisId="right" dataKey="receita" fill="#10b981" name="Receita (R$)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* GRÁFICO: Top 5 Clientes - Linha */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Top 5 Clientes - Receita vs Lucro</CardTitle>
        </CardHeader>
        <CardContent>
          {chartClientsData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum cliente no período</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartClientsData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={3} name="Receita" />
                <Line type="monotone" dataKey="lucro" stroke="#f59e0b" strokeWidth={3} name="Lucro" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* GRÁFICO: Programas - Pizza */}
      <Card>
        <CardHeader>
          <CardTitle>🥧 Distribuição por Programa/Loja</CardTitle>
        </CardHeader>
        <CardContent>
          {chartProgramsData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum programa no período</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartProgramsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartProgramsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* TOP 10 PRODUTOS - Tabela */}
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

      {/* TOP 10 CLIENTES - Tabela */}
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

      {/* TOP 10 PROGRAMAS - Tabela */}
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
            <li>• <strong>Deságio</strong>: Diferença entre valor original de compra vs valor de venda - {percentualDesagio.toFixed(1)}% do investido</li>
            <li>• <strong>Valor em Cashback</strong>: Soma de cashback em dinheiro + valor dos pontos</li>
            <li>• <strong>Lucro Total</strong>: Faturamento - Custo Final (já considera cashback e descontos) - {percentualLucro.toFixed(1)}% do faturamento</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
