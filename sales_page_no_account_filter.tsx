'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

export default function VendasPage() {
  const [purchases, setPurchases] = useState([])
  const [sales, setSales] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedPurchases, setSelectedPurchases] = useState([])
  const [formData, setFormData] = useState({
    soldValue: '',
    saleDate: new Date().toISOString().split('T')[0],
    customer: '',
    serialNumbers: {},
    month: new Date().toLocaleDateString('pt-BR', { month: 'long' })
  })

  // Filtros
  const [filterCustomer, setFilterCustomer] = useState('ALL')
  const [filterPeriod, setFilterPeriod] = useState('ALL')
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchAvailablePurchases()
    fetchSales()
  }, [])

  const fetchAvailablePurchases = async () => {
    try {
      const res = await fetch('/api/purchases')
      const data = await res.json()

      const available = data.filter(p => p.status === 'DELIVERED')
      setPurchases(available)
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const fetchSales = async () => {
    try {
      const res = await fetch('/api/purchases')
      const data = await res.json()

      const sold = data.filter(p => p.status === 'SOLD')
      setSales(sold)
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const handleTogglePurchase = (purchaseId) => {
    setSelectedPurchases(prev => {
      if (prev.includes(purchaseId)) {
        const newSerials = {...formData.serialNumbers}
        delete newSerials[purchaseId]
        setFormData({...formData, serialNumbers: newSerials})
        return prev.filter(id => id !== purchaseId)
      } else {
        return [...prev, purchaseId]
      }
    })
  }

  const handleSerialChange = (purchaseId, serial) => {
    setFormData({
      ...formData,
      serialNumbers: {
        ...formData.serialNumbers,
        [purchaseId]: serial
      }
    })
  }

  const getTotalCost = () => {
    return selectedPurchases.reduce((sum, id) => {
      const purchase = purchases.find(p => p.id === id)
      return sum + (purchase?.finalCost || 0)
    }, 0)
  }

  const getTotalProfit = () => {
    const soldValue = parseFloat(formData.soldValue) || 0
    const totalCost = getTotalCost()
    return soldValue - totalCost
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (selectedPurchases.length === 0) {
      alert('Selecione pelo menos um produto!')
      return
    }

    const missingSerials = selectedPurchases.filter(id => !formData.serialNumbers[id])
    if (missingSerials.length > 0) {
      alert('Preencha o serial/IMEI de todos os produtos selecionados!')
      return
    }

    try {
      const soldValue = parseFloat(formData.soldValue) || 0
      const totalCost = getTotalCost()
      const profit = soldValue - totalCost

      const promises = selectedPurchases.map(purchaseId => {
        return fetch(`/api/purchases/${purchaseId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'SOLD',
            soldValue: soldValue / selectedPurchases.length,
            saleDate: formData.saleDate,
            customer: formData.customer,
            serialNumber: formData.serialNumbers[purchaseId],
            month: formData.month,
            profit: profit / selectedPurchases.length
          })
        })
      })

      const results = await Promise.all(promises)
      const allSuccess = results.every(r => r.ok)

      if (allSuccess) {
        alert(`${selectedPurchases.length} venda(s) registrada(s) com sucesso!`)
        setShowForm(false)
        setSelectedPurchases([])
        setFormData({
          soldValue: '',
          saleDate: new Date().toISOString().split('T')[0],
          customer: '',
          serialNumbers: {},
          month: new Date().toLocaleDateString('pt-BR', { month: 'long' })
        })
        fetchAvailablePurchases()
        fetchSales()
      } else {
        alert('Erro ao registrar algumas vendas')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao registrar vendas')
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

  const uniqueCustomers = [...new Set(sales.map(s => s.customer).filter(Boolean))].sort()

  const filteredSales = sales.filter(s => {
    if (filterCustomer !== 'ALL' && s.customer !== filterCustomer) return false

    if (filterPeriod !== 'ALL' && s.saleDate) {
      const saleDate = new Date(s.saleDate)
      const today = new Date()

      if (filterPeriod === 'TODAY') {
        if (saleDate.toDateString() !== today.toDateString()) return false
      } else if (filterPeriod === 'MONTH') {
        if (saleDate.getMonth() !== filterMonth - 1 || 
            saleDate.getFullYear() !== filterYear) return false
      } else if (filterPeriod === 'YEAR') {
        if (saleDate.getFullYear() !== filterYear) return false
      }
    }

    return true
  })

  const salesTotals = filteredSales.reduce((acc, s) => ({
    cost: acc.cost + (s.finalCost || 0),
    sold: acc.sold + (s.soldValue || 0),
    profit: acc.profit + (s.profit || 0)
  }), { cost: 0, sold: 0, profit: 0 })

  const currentYear = new Date().getFullYear()
  const years = Array.from({length: 5}, (_, i) => currentYear - 2 + i)
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

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
            <CardTitle>Registrar Venda - Seleção Múltipla</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                <Label className="text-lg font-semibold mb-3 block">
                  Selecione os Produtos ({selectedPurchases.length} selecionados)
                </Label>

                {purchases.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    Nenhum produto disponível para venda
                  </p>
                ) : (
                  <div className="space-y-3">
                    {purchases.map(purchase => (
                      <div key={purchase.id} className="flex items-start gap-3 p-3 border rounded-lg bg-white">
                        <Checkbox
                          checked={selectedPurchases.includes(purchase.id)}
                          onCheckedChange={() => handleTogglePurchase(purchase.id)}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{purchase.product?.name || 'N/A'}</p>
                              <p className="text-sm text-gray-600">
                                Conta: {purchase.account} | Compra: {formatDate(purchase.purchaseDate)}
                              </p>
                            </div>
                            <p className="font-semibold">{formatCurrency(purchase.finalCost)}</p>
                          </div>

                          {selectedPurchases.includes(purchase.id) && (
                            <div className="mt-2">
                              <Input
                                placeholder="Serial/IMEI *"
                                value={formData.serialNumbers[purchase.id] || ''}
                                onChange={(e) => handleSerialChange(purchase.id, e.target.value)}
                                required
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Valor Total da Venda *</Label>
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
                  <Label>Cliente *</Label>
                  <Input
                    value={formData.customer}
                    onChange={(e) => setFormData({...formData, customer: e.target.value})}
                    placeholder="Nome do cliente"
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

              {selectedPurchases.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold mb-2">Resumo da Venda</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Produtos</p>
                      <p className="text-lg font-semibold">{selectedPurchases.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Custo Total</p>
                      <p className="text-lg font-semibold">{formatCurrency(getTotalCost())}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lucro Estimado</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(getTotalProfit())}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={selectedPurchases.length === 0}>
                Registrar Venda de {selectedPurchases.length} Produto(s)
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
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Cliente</label>
              <Select value={filterCustomer} onValueChange={setFilterCustomer}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {uniqueCustomers.map(customer => (
                    <SelectItem key={customer} value={customer}>
                      {customer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Período</label>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
                <Select 
                  value={`${filterMonth}-${filterYear}`} 
                  onValueChange={(v) => {
                    const [m, y] = v.split('-')
                    setFilterMonth(parseInt(m))
                    setFilterYear(parseInt(y))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.flatMap(year => 
                      months.map((month, idx) => (
                        <SelectItem key={`${idx + 1}-${year}`} value={`${idx + 1}-${year}`}>
                          {month}/{year}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {filterPeriod === 'YEAR' && (
              <div>
                <label className="text-sm font-medium mb-1 block">Ano</label>
                <Select value={filterYear.toString()} onValueChange={(v) => setFilterYear(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Cards de Totais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-green-50 p-4 rounded-lg border-2 border-green-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Total Custo</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(salesTotals.cost)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Total Vendido</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(salesTotals.sold)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Lucro Total</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(salesTotals.profit)}</p>
            </div>
          </div>

          {/* Tabela */}
          {filteredSales.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhuma venda encontrada
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Serial/IMEI</TableHead>
                  <TableHead>Data Venda</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead className="text-right">Custo</TableHead>
                  <TableHead className="text-right">Venda</TableHead>
                  <TableHead className="text-right">Lucro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map(sale => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {sale.product?.name || 'N/A'}
                    </TableCell>
                    <TableCell>{sale.serialNumber || '-'}</TableCell>
                    <TableCell>{formatDate(sale.saleDate)}</TableCell>
                    <TableCell>{sale.customer || '-'}</TableCell>
                    <TableCell>{sale.account}</TableCell>
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

          <div className="text-sm text-gray-500">
            Mostrando {filteredSales.length} de {sales.length} vendas
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
