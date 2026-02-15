'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function EstoquePage() {
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStock()
  }, [])

  const fetchStock = async () => {
    try {
      const res = await fetch('/api/purchases')
      const data = await res.json()

      // Filtrar apenas DELIVERED (em estoque)
      const delivered = data.filter(p => p.status === 'DELIVERED')

      // Agrupar por produto
      const stockByProduct = {}

      delivered.forEach(purchase => {
        const productId = purchase.productId
        const productName = purchase.product?.name || 'N/A'

        if (!stockByProduct[productId]) {
          stockByProduct[productId] = {
            productId,
            productName,
            quantity: 0,
            totalCost: 0,
            purchases: []
          }
        }

        stockByProduct[productId].quantity += 1
        stockByProduct[productId].totalCost += purchase.finalCost || 0
        stockByProduct[productId].purchases.push(purchase)
      })

      // Calcular valor médio e dias em estoque
      const stockArray = Object.values(stockByProduct).map(item => {
        const avgCost = item.totalCost / item.quantity

        // Calcular dias médios em estoque
        const today = new Date()
        const daysInStock = item.purchases.map(p => {
          const deliveryDate = p.deliveryDate ? new Date(p.deliveryDate) : new Date(p.purchaseDate)
          const diffTime = today - deliveryDate
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
          return diffDays
        })

        const avgDays = Math.floor(daysInStock.reduce((a, b) => a + b, 0) / daysInStock.length)

        return {
          ...item,
          avgCost,
          avgDays,
          oldestDate: item.purchases[0].deliveryDate || item.purchases[0].purchaseDate
        }
      })

      // Ordenar por quantidade (maior primeiro)
      stockArray.sort((a, b) => b.quantity - a.quantity)

      setStock(stockArray)
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

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  // Totais gerais
  const totals = stock.reduce((acc, item) => ({
    quantity: acc.quantity + item.quantity,
    value: acc.value + item.totalCost
  }), { quantity: 0, value: 0 })

  const avgCostTotal = totals.quantity > 0 ? totals.value / totals.quantity : 0

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center">Carregando estoque...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Estoque</h1>
        <p className="text-gray-600 mt-1">Produtos entregues e disponíveis para venda</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 font-medium">Total de Itens</p>
            <p className="text-3xl font-bold text-blue-600">{totals.quantity}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 font-medium">Valor Total</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totals.value)}</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 font-medium">Valor Médio/Item</p>
            <p className="text-3xl font-bold text-orange-600">{formatCurrency(avgCostTotal)}</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 font-medium">Tipos de Produtos</p>
            <p className="text-3xl font-bold text-purple-600">{stock.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Estoque */}
      <Card>
        <CardHeader>
          <CardTitle>Estoque por Produto</CardTitle>
        </CardHeader>
        <CardContent>
          {stock.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum produto em estoque. Marque compras como "Entregue" para aparecerem aqui.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">Quantidade</TableHead>
                  <TableHead className="text-right">Valor Médio</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-center">Dias Médios</TableHead>
                  <TableHead>Mais Antigo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stock.map((item, index) => (
                  <TableRow key={item.productId}>
                    <TableCell className="font-medium">
                      {item.productName}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-blue-500 text-lg px-3 py-1">
                        {item.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(item.avgCost)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      {formatCurrency(item.totalCost)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={item.avgDays > 30 ? 'destructive' : item.avgDays > 15 ? 'default' : 'secondary'}
                      >
                        {item.avgDays} dias
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(item.oldestDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">💡 Como funciona o estoque:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Produtos com status <strong>"Entregue"</strong> entram automaticamente no estoque</li>
            <li>• Produtos iguais são agrupados e somados</li>
            <li>• <strong>Valor Médio</strong>: Média do custo de todos os itens do mesmo produto</li>
            <li>• <strong>Dias em Estoque</strong>: Tempo médio desde a entrega</li>
            <li>• <strong>Cores</strong>: Verde (&lt;15 dias), Azul (15-30 dias), Vermelho (&gt;30 dias)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
