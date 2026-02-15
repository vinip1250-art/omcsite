'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function EstoquePage() {
  const [stockData, setStockData] = useState([])
  const [pointsData, setPointsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

      // Garantir que são arrays
      setStockData(Array.isArray(stock) ? stock : [])
      setPointsData(Array.isArray(points) ? points : [])
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
      setError('Erro ao carregar dados')
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

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    )
  }

  const totalStock = stockData.reduce((acc, item) => acc + (item.totalValue || 0), 0)
  const totalOnTheWay = stockData.reduce((acc, item) => acc + (item.onTheWay || 0), 0)
  const totalInStock = stockData.reduce((acc, item) => acc + (item.inStock || 0), 0)

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Estoque</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              A Caminho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalOnTheWay}</p>
            <p className="text-xs text-gray-500 mt-1">produtos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Em Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{totalInStock}</p>
            <p className="text-xs text-gray-500 mt-1">produtos</p>
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
              {formatCurrency(totalStock)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estoque por Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">A Caminho</TableHead>
                  <TableHead className="text-right">Custo Médio Unit.</TableHead>
                  <TableHead className="text-center">Em Estoque</TableHead>
                  <TableHead className="text-right">Custo Médio Estoque</TableHead>
                  <TableHead className="text-right">Total em Estoque</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      Nenhum produto em estoque
                    </TableCell>
                  </TableRow>
                ) : (
                  stockData.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium">
                        {item.product?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.onTheWay || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.avgCostOnTheWay)}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {item.inStock || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.avgCostInStock)}
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
          <CardTitle>Pontos a Receber por Programa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Programa</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Miri</TableHead>
                  <TableHead className="text-right">Vini</TableHead>
                  <TableHead className="text-right">Lindy</TableHead>
                  <TableHead className="text-right">Milla</TableHead>
                  <TableHead className="text-right">Tony</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pointsData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">
                      Nenhum ponto a receber
                    </TableCell>
                  </TableRow>
                ) : (
                  pointsData.map((item) => (
                    <TableRow key={item.program}>
                      <TableCell className="font-medium">{item.program}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatNumber(item.total)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(item.Miri)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(item.Vini)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(item.Lindy)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(item.Milla)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(item.Tony)}
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
