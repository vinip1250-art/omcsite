'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function PontosPage() {
  const [pendingPoints, setPendingPoints] = useState([])
  const [receivedPoints, setReceivedPoints] = useState([])
  const [loading, setLoading] = useState(true)

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
      // Buscar todas as compras com esse número de pedido
      const res = await fetch('/api/purchases')
      const data = await res.json()
      const purchasesToUpdate = data.filter(p => p.orderNumber === orderNumber)

      // Atualizar todas
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

  const totalPendingPoints = pendingPoints.reduce((sum, p) => sum + p.totalPoints, 0)
  const totalReceivedPoints = receivedPoints.reduce((sum, p) => sum + p.totalPoints, 0)

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

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 font-medium">Pontos a Receber</p>
            <p className="text-3xl font-bold text-orange-600">
              {totalPendingPoints.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-gray-500 mt-1">{pendingPoints.length} pedidos</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 font-medium">Pontos Recebidos</p>
            <p className="text-3xl font-bold text-green-600">
              {totalReceivedPoints.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-gray-500 mt-1">{receivedPoints.length} pedidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Pontos a Receber */}
      <Card>
        <CardHeader>
          <CardTitle>Pontos a Receber ({pendingPoints.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingPoints.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum ponto pendente. Todos os pontos foram creditados! 🎉
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
                {pendingPoints.map((group, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {group.orderNumber || '-'}
                    </TableCell>
                    <TableCell>{group.account}</TableCell>
                    <TableCell>{group.clubAndStore}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(group.totalValue)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{group.pointsPerReal}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-lg font-bold text-orange-600">
                        {group.totalPoints.toLocaleString('pt-BR')}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-blue-500">
                        {group.purchases.length}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm"
                        onClick={() => handleMarkAsReceived(group.orderNumber)}
                      >
                        ✓ Recebido
                      </Button>
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
          <CardTitle>Pontos Já Creditados ({receivedPoints.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {receivedPoints.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum ponto creditado ainda.
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
                {receivedPoints.map((group, index) => (
                  <TableRow key={index} className="bg-green-50">
                    <TableCell className="font-medium">
                      {group.orderNumber || '-'}
                    </TableCell>
                    <TableCell>{group.account}</TableCell>
                    <TableCell>{group.clubAndStore}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(group.totalValue)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{group.pointsPerReal}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-lg font-bold text-green-600">
                        {group.totalPoints.toLocaleString('pt-BR')}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-blue-500">
                        {group.purchases.length}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">✓ Creditado</Badge>
                    </TableCell>
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
            <li>• Compras com <strong>Pts Recebido = Não</strong> aparecem em "Pontos a Receber"</li>
            <li>• Pedidos com múltiplos itens são <strong>agrupados automaticamente</strong></li>
            <li>• Clique em <strong>"✓ Recebido"</strong> quando os pontos forem creditados na conta</li>
            <li>• Total de pontos é calculado automaticamente (Valor × Pts/R$)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
