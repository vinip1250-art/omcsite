'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Pencil, Trash2, Check } from 'lucide-react'

export default function ComprasPage() {
  const [purchases, setPurchases] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState(null)

  // Filtros
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [accountFilter, setAccountFilter] = useState('Todas')

  // Formulário
  const [formData, setFormData] = useState({
    productId: '',
    purchaseDate: '',
    deliveryDate: '',
    orderNumber: '',
    paidValue: '',
    freight: '0',
    advanceDiscount: '0',
    cashback: '0',
    points: '0',
    thousand: '0',
    account: '',
    clubAndStore: '',
    pointsPerReal: '0',
    pointsReceived: false
  })

  useEffect(() => {
    loadPurchases()
    loadProducts()
  }, [])

  async function loadPurchases() {
    try {
      const res = await fetch('/api/purchases')
      const data = await res.json()
      setPurchases(data)
    } catch (error) {
      console.error('Erro ao carregar compras:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadProducts() {
    try {
      const res = await fetch('/api/products/all')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }

  function openNewPurchase() {
    setEditingPurchase(null)
    setFormData({
      productId: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      orderNumber: '',
      paidValue: '',
      freight: '0',
      advanceDiscount: '0',
      cashback: '0',
      points: '0',
      thousand: '0',
      account: '',
      clubAndStore: '',
      pointsPerReal: '0',
      pointsReceived: false
    })
    setIsOpen(true)
  }

  function openEditPurchase(purchase) {
    setEditingPurchase(purchase)
    setFormData({
      productId: purchase.productId,
      purchaseDate: purchase.purchaseDate?.split('T')[0] || '',
      deliveryDate: purchase.deliveryDate?.split('T')[0] || '',
      orderNumber: purchase.orderNumber || '',
      paidValue: purchase.paidValue?.toString() || '',
      freight: purchase.shipping?.toString() || '0',
      advanceDiscount: purchase.advanceDiscount?.toString() || '0',
      cashback: purchase.cashback?.toString() || '0',
      points: purchase.points?.toString() || '0',
      thousand: purchase.thousand?.toString() || '0',
      account: purchase.account || '',
      clubAndStore: purchase.clubAndStore || '',
      pointsPerReal: purchase.pointsPerReal?.toString() || '0',
      pointsReceived: purchase.pointsReceived || false
    })
    setIsOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      const url = editingPurchase 
        ? `/api/purchases/${editingPurchase.id}`
        : '/api/purchases'

      const method = editingPurchase ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setIsOpen(false)
        loadPurchases()
      } else {
        const error = await res.json()
        alert('Erro: ' + error.error)
      }
    } catch (error) {
      console.error('Erro ao salvar compra:', error)
      alert('Erro ao salvar compra')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja excluir esta compra?')) return

    try {
      const res = await fetch(`/api/purchases/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        loadPurchases()
      } else {
        const error = await res.json()
        alert('Erro: ' + error.error)
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir compra')
    }
  }

  async function markAsDelivered(id) {
    try {
      const res = await fetch(`/api/purchases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'DELIVERED',
          deliveryDate: new Date().toISOString().split('T')[0]
        })
      })

      if (res.ok) {
        loadPurchases()
      }
    } catch (error) {
      console.error('Erro ao marcar como entregue:', error)
    }
  }

  async function togglePointsReceived(id, currentValue) {
    try {
      const res = await fetch(`/api/purchases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pointsReceived: !currentValue
        })
      })

      if (res.ok) {
        loadPurchases()
      }
    } catch (error) {
      console.error('Erro ao atualizar pontos recebidos:', error)
    }
  }

  // Filtrar compras
  const filteredPurchases = purchases.filter(p => {
    if (statusFilter !== 'Todos' && p.status !== statusFilter) return false
    if (accountFilter !== 'Todas' && p.account !== accountFilter) return false
    return true
  })

  // Calcular totais - USAR O FINALCOST DO BANCO
  const totalPaidValue = filteredPurchases.reduce((sum, p) => sum + (p.paidValue || 0), 0)
  const totalFinalCost = filteredPurchases.reduce((sum, p) => sum + (p.finalCost || 0), 0)
  const totalPoints = filteredPurchases.reduce((sum, p) => sum + (p.points || 0), 0)

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Compras</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewPurchase}>Nova Compra</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPurchase ? 'Editar Compra' : 'Nova Compra'} - {
                  editingPurchase 
                    ? products.find(p => p.id === editingPurchase.productId)?.name
                    : products.find(p => p.id === formData.productId)?.name || 'Selecione um produto'
                }
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Produto *</Label>
                  <Select
                    value={formData.productId}
                    onValueChange={(value) => setFormData({...formData, productId: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Valor Pago *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.paidValue}
                    onChange={(e) => setFormData({...formData, paidValue: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label>Frete</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.freight}
                    onChange={(e) => setFormData({...formData, freight: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Desconto Antecipado</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.advanceDiscount}
                    onChange={(e) => setFormData({...formData, advanceDiscount: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Cashback</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.cashback}
                    onChange={(e) => setFormData({...formData, cashback: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Pontos</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.points}
                    onChange={(e) => setFormData({...formData, points: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Milhar</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.thousand}
                    onChange={(e) => setFormData({...formData, thousand: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Pts por Real</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.pointsPerReal}
                    onChange={(e) => setFormData({...formData, pointsPerReal: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Conta</Label>
                  <Select
                    value={formData.account}
                    onValueChange={(value) => setFormData({...formData, account: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Miri">Miri</SelectItem>
                      <SelectItem value="Nubank">Nubank</SelectItem>
                      <SelectItem value="Itau">Itaú</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Programa/Loja</Label>
                  <Input
                    value={formData.clubAndStore}
                    onChange={(e) => setFormData({...formData, clubAndStore: e.target.value})}
                    placeholder="Ex: Esfera CB"
                  />
                </div>

                <div>
                  <Label>Nº Pedido</Label>
                  <Input
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Data Compra</Label>
                  <Input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Data Entrega</Label>
                  <Input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pointsReceived"
                    checked={formData.pointsReceived}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, pointsReceived: checked})
                    }
                  />
                  <Label htmlFor="pointsReceived" className="cursor-pointer">
                    Pontos Recebidos
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPurchase ? 'Salvar Alterações' : 'Criar Compra'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-semibold mb-3">Lista de Compras</h2>
        <div className="flex gap-4">
          <div>
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="DELIVERED">Entregue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Conta</Label>
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas</SelectItem>
                <SelectItem value="Miri">Miri</SelectItem>
                <SelectItem value="Nubank">Nubank</SelectItem>
                <SelectItem value="Itau">Itaú</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Período</Label>
            <Select defaultValue="Todos">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Totais */}
        <div className="flex gap-8 mt-6 p-4 bg-blue-50 rounded">
          <div>
            <p className="text-sm text-gray-600">Total Valor Pago</p>
            <p className="text-xl font-bold text-blue-600">
              R$ {totalPaidValue.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Custo Final</p>
            <p className="text-xl font-bold text-green-600">
              {totalFinalCost < 0 ? '-' : ''}R$ {Math.abs(totalFinalCost).toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Pontos</p>
            <p className="text-xl font-bold text-orange-600">
              {totalPoints.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Produto</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Programa/Loja</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Data Compra</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Conta</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Valor Pago</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Custo Final</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Pontos</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Pts Recebido</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPurchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{purchase.product?.name}</td>
                  <td className="px-4 py-3 text-sm">{purchase.clubAndStore || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    {purchase.purchaseDate ? new Date(purchase.purchaseDate).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">{purchase.account || '-'}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    R$ {purchase.paidValue?.toFixed(2).replace('.', ',') || '0,00'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {purchase.finalCost < 0 ? '-' : ''}R$ {Math.abs(purchase.finalCost || 0).toFixed(2).replace('.', ',')}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {purchase.points?.toLocaleString('pt-BR') || '0'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Checkbox
                      checked={purchase.pointsReceived}
                      onCheckedChange={() => togglePointsReceived(purchase.id, purchase.pointsReceived)}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {purchase.status === 'DELIVERED' ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Entregue
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditPurchase(purchase)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {purchase.status === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsDelivered(purchase.id)}
                          title="Marcar como entregue"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(purchase.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPurchases.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhuma compra encontrada
          </div>
        )}

        <div className="px-4 py-3 text-sm text-gray-600 border-t">
          Mostrando {filteredPurchases.length} de {purchases.length} compras
        </div>
      </div>
    </div>
  )
}
