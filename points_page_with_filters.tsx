'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

export default function PontosPage() {
  const [pendingPoints, setPendingPoints] = useState([])
  const [receivedPoints, setReceivedPoints] = useState([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [filterPeriod, setFilterPeriod] = useState('ALL')
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())
  const [filterAccount, setFilterAccount] = useState('ALL')
  const [filterOrder, setFilterOrder] = useState('')
  const [filterProgram, setFilterProgram] = useState('ALL')

  useEffect(() => {
    fetchPoints()
  }, [])

  const fetchPoints = async () => {
    try {
      const res = await fetch('/api/purchases')
      const data = await res.json()

      // Agrupar por número de pedido
      const groupedByOrder = {}

      data.forEach(purchase => {
        const orderNumber = purchase.orderNumber || `SEM-PEDIDO-${purchase.id}`

        if (!groupedByOrder[orderNumber]) {
          groupedByOrder[orderNumber] = {
            orderNumber: purchase.orderNumber,
            account: purchase.account,
            clubAndStore: purchase.clubAndStore,
            pointsPerReal: purchase.pointsPerReal,
            pointsReceived: purchase.pointsReceived,
            purchaseDate: purchase.purchaseDate,
            purchases: [],
            totalValue: 0,
            totalPoints: 0
          }
        }

        groupedByOrder[orderNumber].purchases.push(purchase)
        groupedByOrder[orderNumber].totalValue += purchase.paidValue || 0
        groupedByOrder[orderNumber].totalPoints += purchase.points || 0
      })

      // Separar entre pendentes e recebidos
      const grouped = Object.values(groupedByOrder)
      const pending = grouped.filter(g => !g.pointsReceived)
      const received = grouped.filter(g => g.pointsReceived)

      setPendingPoints(pending)
      setReceivedPoints(received)
      setLoading(false)
    } catch (error) {
      console.error('Erro:', error)
      setLoading(false)
    }
  }

  const handleMarkAsReceived = async (orderNumber) => {
    if (!confirm('Confirma que os pontos foram recebidos?')) return

    try {
      const res = await fetch('/api/purchases')
      const data = await res.json()
      const purchasesToUpdate = data.filter(p => p.orderNumber === orderNumber)

      const promises = purchasesToUpdate.map(p => 
        fetch(`/api/purchases/${p.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pointsReceived: true })
        })
      )

      const results = await Promise.all(promises)
      const allSuccess = results.every(r => r.ok)

      if (allSuccess) {
        alert('Pontos marcados como recebidos!')
        fetchPoints()
      } else {
        alert('Erro ao atualizar')
      }
    } catch (error) {
      alert('Erro ao atualizar')
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Aplicar filtros
  const applyFilters = (points) => {
    return points.filter(p => {
      // Filtro de Conta
      if (filterAccount !== 'ALL' && p.account !== filterAccount) return false

      // Filtro de Pedido
      if (filterOrder && !p.orderNumber?.toLowerCase().includes(filterOrder.toLowerCase())) return false

      // Filtro de Programa/Loja
      if (filterProgram !== 'ALL' && p.clubAndStore !== filterProgram) return false

      // Filtro de Período
      if (filterPeriod !== 'ALL' && p.purchaseDate) {
        const purchaseDate = new Date(p.purchaseDate)
        const today = new Date()

        if (filterPeriod === 'TODAY') {
          if (purchaseDate.toDateString() !== today.toDateString()) return false
        } else if (filterPeriod === 'MONTH') {
          if (purchaseDate.getMonth() !== filterMonth - 1 || 
              purchaseDate.getFullYear() !== filterYear) return false
        } else if (filterPeriod === 'YEAR') {
          if (purchaseDate.getFullYear() !== filterYear) return false
        }
      }

      return true
    })
  }

  const filteredPending = applyFilters(pendingPoints)
  const filteredReceived = applyFilters(receivedPoints)

  const totalPendingPoints = filteredPending.reduce((sum, p) => sum + p.totalPoints, 0)
  const totalReceivedPoints = filteredReceived.reduce((sum, p) => sum + p.totalPoints, 0)

  // Listas únicas para filtros
  const uniquePrograms = [...new Set([...pendingPoints, ...receivedPoints].map(p => p.clubAndStore))].sort()

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
        <h1 className="text-3xl font-bold">Pontos</h1>
        <p className="text-gray-600 mt-1">Gerencie pontos a receber e já creditados</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Período</label>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="TODAY">Hoje</SelectItem>
                  <SelectItem value="MONTH">Por Mês</SelectItem>
                  <SelectItem value="YEAR">Por Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filterPeriod === 'MONTH' && (
              <div>
                <label className="text-sm font-medium mb-1 block">Mês/Ano</label>
                <Select value={`${filterMonth}-${filterYear}`} onValueChange={(v) => { const [m, y] = v.split('-'); setFilterMonth(parseInt(m)); setFilterYear(parseInt(y)) }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {years.flatMap(year => months.map((month, idx) => <SelectItem key={`${idx + 1}-${year}`} value={`${idx + 1}-${year}`}>{month}/{year}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {filterPeriod === 'YEAR' && (
              <div>
                <label className="text-sm font-medium mb-1 block">Ano</label>
                <Select value={filterYear.toString()} onValueChange={(v) => setFilterYear(parseInt(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {years.map(year => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1 block">Conta</label>
              <Select value={filterAccount} onValueChange={setFilterAccount}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas</SelectItem>
                  <SelectItem value="Miri">Miri</SelectItem>
                  <SelectItem value="Vini">Vini</SelectItem>
                  <SelectItem value="Lindy">Lindy</SelectItem>
                  <SelectItem value="Milla">Milla</SelectItem>
                  <SelectItem value="Tony">Tony</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Programa/Loja</label>
              <Select value={filterProgram} onValueChange={setFilterProgram}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {uniquePrograms.map(program => (
                    <SelectItem key={program} value={program}>{program}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Nº Pedido</label>
              <Input
                placeholder="Buscar pedido..."
                value={filterOrder}
                onChange={(e) => setFilterOrder(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 font-medium">Pontos a Receber</p>
            <p className="text-3xl font-bold text-orange-600">
              {totalPendingPoints.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-gray-500 mt-1">{filteredPending.length} pedidos</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 font-medium">Pontos Recebidos</p>
            <p className="text-3xl font-bold text-green-600">
              {totalReceivedPoints.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-gray-500 mt-1">{filteredReceived.length} pedidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Pontos a Receber */}
      <Card>
        <CardHeader>
          <CardTitle>Pontos a Receber ({filteredPending.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPending.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum ponto pendente com os filtros aplicados.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Pedido</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-center">Pts/R$</TableHead>
                  <TableHead className="text-right">Total Pontos</TableHead>
                  <TableHead className="text-center">Itens</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPending.map((group, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{group.orderNumber || '-'}</TableCell>
                    <TableCell>{group.account}</TableCell>
                    <TableCell>{group.clubAndStore}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(group.totalValue)}</TableCell>
                    <TableCell className="text-center"><Badge variant="outline">{group.pointsPerReal}</Badge></TableCell>
                    <TableCell className="text-right"><span className="text-lg font-bold text-orange-600">{group.totalPoints.toLocaleString('pt-BR')}</span></TableCell>
                    <TableCell className="text-center"><Badge className="bg-blue-500">{group.purchases.length}</Badge></TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => handleMarkAsReceived(group.orderNumber)}>✓ Recebido</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pontos Recebidos */}
      <Card>
        <CardHeader>
          <CardTitle>Pontos Já Creditados ({filteredReceived.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReceived.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum ponto creditado com os filtros aplicados.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Pedido</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-center">Pts/R$</TableHead>
                  <TableHead className="text-right">Total Pontos</TableHead>
                  <TableHead className="text-center">Itens</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceived.map((group, index) => (
                  <TableRow key={index} className="bg-green-50">
                    <TableCell className="font-medium">{group.orderNumber || '-'}</TableCell>
                    <TableCell>{group.account}</TableCell>
                    <TableCell>{group.clubAndStore}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(group.totalValue)}</TableCell>
                    <TableCell className="text-center"><Badge variant="outline">{group.pointsPerReal}</Badge></TableCell>
                    <TableCell className="text-right"><span className="text-lg font-bold text-green-600">{group.totalPoints.toLocaleString('pt-BR')}</span></TableCell>
                    <TableCell className="text-center"><Badge className="bg-blue-500">{group.purchases.length}</Badge></TableCell>
                    <TableCell><Badge className="bg-green-500">✓ Creditado</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">💡 Como funciona:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Use os <strong>filtros</strong> para buscar pedidos específicos</li>
            <li>• Compras com <strong>Pts Recebido = Não</strong> aparecem em "Pontos a Receber"</li>
            <li>• Pedidos com múltiplos itens são <strong>agrupados automaticamente</strong></li>
            <li>• Clique em <strong>"✓ Recebido"</strong> quando os pontos forem creditados</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
