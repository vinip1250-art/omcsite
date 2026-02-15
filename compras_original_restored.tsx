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
import { Pencil, Trash2, Check, Plus } from 'lucide-react'

export default function ComprasPage() {
  const [purchases, setPurchases] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Filtros
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [accountFilter, setAccountFilter] = useState('Todas')
  const [storeFilter, setStoreFilter] = useState('Todos')
  const [pointsFilter, setPointsFilter] = useState('Todos')

  // Formulário
  const [quantity, setQuantity] = useState(1)
  const [formData, setFormData] = useState({
    productId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    orderNumber: '',
    paidValue: '',
    freight: '0',
    advanceDiscount: '0',
    cashback: '0',
    points: '0',
    thousand: '14',
    account: 'Miri',
    clubAndStore: '',
    pointsPerReal: '14',
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

  // Calcular valores
  const paidValue = parseFloat(formData.paidValue) || 0
  const freight = parseFloat(formData.freight) || 0
  const advanceDiscount = parseFloat(formData.advanceDiscount) || 0
  const cashback = parseFloat(formData.cashback) || 0
  const points = parseFloat(formData.points) || 0
  const thousand = parseFloat(formData.thousand) || 1
  const pointsPerReal = parseFloat(formData.pointsPerReal) || 0

  const totalPaid = paidValue * quantity
  const discount = (advanceDiscount / 100) * totalPaid
  const calculatedPoints = totalPaid * pointsPerReal
  const cashbackPoints = points
  const cashbackTotal = cashback * quantity
  const pointsValue = points / thousand
  const finalUnitCost = paidValue + freight - (advanceDiscount / 100) * paidValue - cashback - pointsValue
  const finalTotalCost = finalUnitCost * quantity

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      // Criar múltiplas compras se quantidade > 1
      for (let i = 0; i < quantity; i++) {
        const res = await fetch('/api/purchases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (!res.ok) {
          const error = await res.json()
          alert('Erro: ' + error.error)
          return
        }
      }

      setShowForm(false)
      loadPurchases()
      // Reset form
      setQuantity(1)
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
        thousand: '14',
        account: 'Miri',
        clubAndStore: '',
        pointsPerReal: '14',
        pointsReceived: false
      })
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
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
    }
  }

  async function togglePointsReceived(id, currentValue) {
    try {
      await fetch(`/api/purchases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pointsReceived: !currentValue })
      })
      loadPurchases()
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  async function markAsDelivered(id) {
    try {
      await fetch(`/api/purchases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'DELIVERED',
          deliveryDate: new Date().toISOString().split('T')[0]
        })
      })
      loadPurchases()
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  // Filtrar compras
  const filteredPurchases = purchases.filter(p => {
    if (statusFilter !== 'Todos' && p.status !== statusFilter) return false
    if (accountFilter !== 'Todas' && p.account !== accountFilter) return false
    if (storeFilter !== 'Todos' && p.clubAndStore !== storeFilter) return false
    if (pointsFilter === 'Sim' && !p.pointsReceived) return false
    if (pointsFilter === 'Não' && p.pointsReceived) return false
    return true
  })

  const totalPaidValue = filteredPurchases.reduce((sum, p) => sum + (p.paidValue || 0), 0)
  const totalFinalCost = filteredPurchases.reduce((sum, p) => sum + (p.finalCost || 0), 0)
  const totalPoints = filteredPurchases.reduce((sum, p) => sum + (p.points || 0), 0)

  const uniqueStores = [...new Set(purchases.map(p => p.clubAndStore).filter(Boolean))]

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com botão Nova Compra */}
      {!showForm && (
        <div className="bg-gray-900 text-white py-3 px-8 flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Compras</h1>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-white text-gray-900 hover:bg-gray-100"
          >
            Nova Compra
          </Button>
        </div>
      )}

      <div className="container mx-auto px-8">
        {/* Formulário de Nova Compra */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Nova Compra</h2>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Linha 1 */}
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
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Quantidade *</Label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Cada unidade será cadastrada separadamente</p>
                </div>

                <div>
                  <Label>Valor Unitário *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.paidValue}
                    onChange={(e) => setFormData({...formData, paidValue: e.target.value})}
                    required
                  />
                </div>

                {/* Linha 2 */}
                <div>
                  <Label>Conta *</Label>
                  <Select
                    value={formData.account}
                    onValueChange={(value) => setFormData({...formData, account: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Miri">Miri</SelectItem>
                      <SelectItem value="Nubank">Nubank</SelectItem>
                      <SelectItem value="Itau">Itaú</SelectItem>
                      <SelectItem value="Vini">Vini</SelectItem>
                      <SelectItem value="Lindy">Lindy</SelectItem>
                      <SelectItem value="Milla">Milla</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Programa/Loja *</Label>
                  <Input
                    value={formData.clubAndStore}
                    onChange={(e) => setFormData({...formData, clubAndStore: e.target.value})}
                    placeholder="Ex: Esfera CB, Livelo Fast, Smiles ML"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Digite livremente. Ex: Esfera CB = Esfera na Casas Bahia</p>
                </div>

                <div>
                  <Label>Data da Compra *</Label>
                  <Input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                    required
                  />
                </div>

                {/* Linha 3 */}
                <div>
                  <Label>Número do Pedido</Label>
                  <Input
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
                    placeholder="Opcional"
                  />
                </div>

                <div>
                  <Label>Frete (fixo)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.freight}
                    onChange={(e) => setFormData({...formData, freight: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Desconto Antecipado</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">%</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.advanceDiscount}
                        onChange={(e) => setFormData({...formData, advanceDiscount: e.target.value})}
                        className="w-20"
                      />
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      value={discount.toFixed(2)}
                      disabled
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Linha 4 */}
                <div>
                  <Label>Pontos por R$ 1,00 *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.pointsPerReal}
                    onChange={(e) => setFormData({...formData, pointsPerReal: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label>Valor do Milheiro *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.thousand}
                    onChange={(e) => setFormData({...formData, thousand: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label>Cashback Extra (opcional)</Label>
                  <div className="flex gap-2">
                    <Select defaultValue="R$">
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="R$">R$</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.cashback}
                      onChange={(e) => setFormData({...formData, cashback: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Linha 5 */}
                <div>
                  <Label>Data Entrega</Label>
                  <Input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                    placeholder="dd/mm/aaaa"
                  />
                </div>

                <div className="flex items-end">
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
              </div>

              {/* Valores Calculados */}
              <div className="bg-gray-50 rounded p-4 mb-4">
                <h3 className="font-semibold mb-3">Valores Calculados</h3>
                <div className="grid grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Pago</p>
                    <p className="font-bold text-blue-600">R$ {totalPaid.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Desconto</p>
                    <p className="font-bold">R$ {discount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Pontos</p>
                    <p className="font-bold">{calculatedPoints.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cashback Pontos</p>
                    <p className="font-bold">R$ {(cashbackPoints / thousand).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cashback Total</p>
                    <p className="font-bold text-green-600">R$ {cashbackTotal.toFixed(2)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                  <div>
                    <p className="text-gray-600">Custo Unit. Final</p>
                    <p className="font-bold text-blue-600">R$ {finalUnitCost.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Custo Total Final</p>
                    <p className="font-bold text-lg text-blue-600">R$ {finalTotalCost.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Botão Submit */}
              <div className="bg-gray-900 text-white py-3 rounded text-center">
                <Button 
                  type="submit" 
                  className="bg-transparent hover:bg-gray-800 text-white text-lg w-full"
                >
                  Cadastrar {quantity} Compra(s)
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Compras */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Lista de Compras</h2>

          {/* Filtros */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas</SelectItem>
                  <SelectItem value="Miri">Miri</SelectItem>
                  <SelectItem value="Nubank">Nubank</SelectItem>
                  <SelectItem value="Itau">Itaú</SelectItem>
                  <SelectItem value="Vini">Vini</SelectItem>
                  <SelectItem value="Lindy">Lindy</SelectItem>
                  <SelectItem value="Milla">Milla</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Programa/Loja</Label>
              <Select value={storeFilter} onValueChange={setStoreFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {uniqueStores.map(store => (
                    <SelectItem key={store} value={store}>{store}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Pontos Recebidos</Label>
              <Select value={pointsFilter} onValueChange={setPointsFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Sim">Sim</SelectItem>
                  <SelectItem value="Não">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Período</Label>
              <Select defaultValue="Todos">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Totais */}
          <div className="grid grid-cols-3 gap-6 mb-6 p-4 bg-blue-50 rounded">
            <div>
              <p className="text-sm text-gray-600">Total Valor Pago</p>
              <p className="text-2xl font-bold text-blue-600">
                R$ {totalPaidValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Custo Final</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {totalFinalCost.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Pontos</p>
              <p className="text-2xl font-bold text-orange-600">
                {totalPoints.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-gray-600">
                  <th className="pb-2">Produto</th>
                  <th className="pb-2">Programa/Loja</th>
                  <th className="pb-2">Data Compra</th>
                  <th className="pb-2">Conta</th>
                  <th className="pb-2 text-right">Valor Pago</th>
                  <th className="pb-2 text-right">Custo Final</th>
                  <th className="pb-2 text-right">Pontos</th>
                  <th className="pb-2 text-center">Pts Recebido</th>
                  <th className="pb-2 text-center">Status</th>
                  <th className="pb-2 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{purchase.product?.name}</td>
                    <td className="py-3">{purchase.clubAndStore || '-'}</td>
                    <td className="py-3">
                      {purchase.purchaseDate ? new Date(purchase.purchaseDate).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="py-3">{purchase.account}</td>
                    <td className="py-3 text-right">
                      R$ {purchase.paidValue?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </td>
                    <td className="py-3 text-right font-medium">
                      R$ {purchase.finalCost?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </td>
                    <td className="py-3 text-right">
                      {purchase.points?.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 text-center">
                      <Checkbox
                        checked={purchase.pointsReceived}
                        onCheckedChange={() => togglePointsReceived(purchase.id, purchase.pointsReceived)}
                      />
                    </td>
                    <td className="py-3 text-center">
                      {purchase.status === 'DELIVERED' ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Vendido
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1 justify-center">
                        {purchase.status === 'PENDING' && (
                          <Button
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3"
                            onClick={() => markAsDelivered(purchase.id)}
                          >
                            Entregue
                          </Button>
                        )}
                        {purchase.status === 'DELIVERED' && (
                          <Button
                            size="sm"
                            className="bg-green-600 text-white px-3"
                            disabled
                          >
                            ✓ Entregue
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(purchase.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-gray-600 mt-4">
            Mostrando {filteredPurchases.length} de {purchases.length} compras
          </p>
        </div>
      </div>
    </div>
  )
}
