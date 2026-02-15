'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function EstoquePage() {
  const [stockData, setStockData] = useState([])
  const [pointsData, setPointsData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [stockRes, pointsRes] = await Promise.all([
        fetch('/api/stock'),
        fetch('/api/stock/points-to-receive')
      ])

      const stock = await stockRes.json()
      const points = await pointsRes.json()

      // Filtrar apenas produtos com estoque > 0
      const stockWithItems = Array.isArray(stock) 
        ? stock.filter(item => item.inStock > 0)
        : []

      setStockData(stockWithItems)
      setPointsData(Array.isArray(points) ? points : [])
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  const formatNumber = (value) => {
    return (value || 0).toLocaleString('pt-BR')
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Carregando...</div>
      </div>
    )
  }

  const totalInStock = stockData.reduce((acc, item) => acc + (item.inStock || 0), 0)
  const totalValue = stockData.reduce((acc, item) => acc + (item.totalValue || 0), 0)
  const totalPointsToReceive = pointsData.reduce((acc, item) => acc + (item.total || 0), 0)

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Estoque</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Produtos em Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{totalInStock}</p>
            <p className="text-xs text-gray-500 mt-1">unidades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Valor Total em Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(totalValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pontos a Receber
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              {formatNumber(totalPointsToReceive)}
            </p>
            <p className="text-xs text-gray-500 mt-1">pontos/milhas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produtos Disponíveis para Venda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">Quantidade</TableHead>
                  <TableHead className="text-right">Custo Médio Unit.</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                      Nenhum produto em estoque
                    </TableCell>
                  </TableRow>
                ) : (
                  stockData.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium">
                        {item.product?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-center font-bold text-blue-600">
                        {item.inStock}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.averageStockCost)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(item.totalValue)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pontos a Receber (Não creditados)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Programa/Loja</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead className="text-right">Pontos</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Data Compra</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pointsData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                      Todos os pontos foram creditados
                    </TableCell>
                  </TableRow>
                ) : (
                  pointsData.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {item.clubAndStore || 'N/A'}
                      </TableCell>
                      <TableCell>{item.account}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatNumber(item.points)}
                      </TableCell>
                      <TableCell>{item.product?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
