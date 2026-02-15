'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function VendasPage() {
  const [purchases, setPurchases] = useState([])
  const [sales, setSales] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState(null)
  const [formData, setFormData] = useState({
    purchaseId: '',
    soldValue: '',
    saleDate: new Date().toISOString().split('T')[0],
    customer: '',
    serialNumber: '',
    month: new Date().toLocaleDateString('pt-BR', { month: 'long' })
  })

  useEffect(() => {
    fetchAvailablePurchases()
    fetchSales()
  }, [])

  const fetchAvailablePurchases = async () => {
    try {
      const res = await fetch('/api/purchases')
      const data = await res.json()

      // Filtrar apenas produtos ENTREGUES e NÃO VENDIDOS
      const available = data.filter(p => 
        p.status === 'DELIVERED'
      )

      setPurchases(available)
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const fetchSales = async () => {
    try {
      const res = await fetch('/api/purchases')
      const data = await res.json()

      // Filtrar apenas produtos VENDIDOS
      const sold = data.filter(p => p.status === 'SOLD')

      setSales(sold)
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const handleSelectPurchase = (purchaseId) => {
    const purchase = purchases.find(p => p.id === purchaseId)
    setSelectedPurchase(purchase)
    setFormData({
      ...formData,
      purchaseId: purchaseId,
      soldValue: purchase?.finalCost || ''
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Atualizar a compra para status SOLD
      const response = await fetch(`/api/purchases/${formData.purchaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'SOLD',
          soldValue: parseFloat(formData.soldValue),
          saleDate: formData.saleDate,
          customer: formData.customer,
          serialNumber: formData.serialNumber,
          month: formData.month,
          profit: parseFloat(formData.soldValue) - (selectedPurchase?.finalCost || 0)
        })
      })

      if (response.ok) {
        alert('Venda registrada com sucesso!')
        setShowForm(false)
        setSelectedPurchase(null)
        setFormData({
          purchaseId: '',
          soldValue: '',
          saleDate: new Date().toISOString().split('T')[0],
          customer: '',
          serialNumber: '',
          month: new Date().toLocaleDateString('pt-BR', { month: 'long' })
        })
        fetchAvailablePurchases()
        fetchSales()
      } else {
        alert('Erro ao registrar venda')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao registrar venda')
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

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vendas</h1>
          <p className="text-gray-600 mt-1">Registre vendas de produtos entregues</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nova Venda'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Venda</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Produto Disponível *</Label>
                  <Select value={formData.purchaseId} onValueChange={handleSelectPurchase}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {purchases.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Nenhum produto disponível para venda
                        </SelectItem>
                      ) : (
                        purchases.map(purchase => (
                          <SelectItem key={purchase.id} value={purchase.id}>
                            {purchase.product?.name || 'N/A'} - Custo: {formatCurrency(purchase.finalCost)}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Apenas produtos com status "Entregue"
                  </p>
                </div>

                <div>
                  <Label>Valor de Venda *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.soldValue}
                    onChange={(e) => setFormData({...formData, soldValue: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label>Data da Venda *</Label>
                  <Input
                    type="date"
                    value={formData.saleDate}
                    onChange={(e) => setFormData({...formData, saleDate: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label>Cliente</Label>
                  <Input
                    value={formData.customer}
                    onChange={(e) => setFormData({...formData, customer: e.target.value})}
                    placeholder="Nome do cliente (opcional)"
                  />
                </div>

                <div className="col-span-2">
                  <Label>Serial/IMEI *</Label>
                  <Input
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                    placeholder="IMEI ou número de série do produto"
                    required
                  />
                </div>

                <div>
                  <Label>Mês de Referência</Label>
                  <Input
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: e.target.value})}
                    placeholder="Ex: janeiro"
                  />
                </div>
              </div>

              {selectedPurchase && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold mb-2">Resumo da Venda</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Custo do Produto</p>
                      <p className="text-lg font-semibold">{formatCurrency(selectedPurchase.finalCost)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lucro Estimado</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(parseFloat(formData.soldValue || 0) - selectedPurchase.finalCost)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={!selectedPurchase}>
                Registrar Venda
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Produtos Disponíveis para Venda ({purchases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum produto disponível. Marque produtos como "Entregue" em Compras.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Data Compra</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead className="text-right">Custo Final</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map(purchase => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">
                      {purchase.product?.name || 'N/A'}
                    </TableCell>
                    <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                    <TableCell>{purchase.account}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(purchase.finalCost)}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-500">Entregue</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendas Realizadas ({sales.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhuma venda registrada ainda
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Serial/IMEI</TableHead>
                  <TableHead>Data Venda</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Custo</TableHead>
                  <TableHead className="text-right">Venda</TableHead>
                  <TableHead className="text-right">Lucro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map(sale => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {sale.product?.name || 'N/A'}
                    </TableCell>
                    <TableCell>{sale.serialNumber || '-'}</TableCell>
                    <TableCell>{formatDate(sale.saleDate)}</TableCell>
                    <TableCell>{sale.customer || '-'}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(sale.finalCost)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(sale.soldValue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={sale.profit >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        {formatCurrency(sale.profit)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
