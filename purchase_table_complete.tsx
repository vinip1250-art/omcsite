'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const STATUS_COLORS = {
  PENDING: 'bg-yellow-500',
  DELIVERED: 'bg-blue-500',
  SOLD: 'bg-green-500',
  CANCELLED: 'bg-red-500'
}

const STATUS_LABELS = {
  PENDING: 'Pendente',
  DELIVERED: 'Entregue',
  SOLD: 'Vendido',
  CANCELLED: 'Cancelado'
}

export function PurchaseTable({ purchases, onUpdate }) {
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterAccount, setFilterAccount] = useState('ALL')
  const [filterPointsReceived, setFilterPointsReceived] = useState('ALL')
  const [filterClubAndStore, setFilterClubAndStore] = useState('ALL')
  const [filterPeriod, setFilterPeriod] = useState('ALL')
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())
  const [updating, setUpdating] = useState(null)
  const [editingPurchase, setEditingPurchase] = useState(null)
  const [editForm, setEditForm] = useState({})

  const uniqueClubAndStores = [...new Set(
    purchases
      .map(p => p.clubAndStore)
      .filter(Boolean)
  )].sort()

  const filtered = purchases.filter(p => {
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false
    if (filterAccount !== 'ALL' && p.account !== filterAccount) return false
    if (filterClubAndStore !== 'ALL' && p.clubAndStore !== filterClubAndStore) return false

    if (filterPointsReceived !== 'ALL') {
      const received = filterPointsReceived === 'true'
      if (p.pointsReceived !== received) return false
    }

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

  // Calcular totais
  const totals = filtered.reduce((acc, p) => ({
    paidValue: acc.paidValue + (p.paidValue || 0),
    finalCost: acc.finalCost + (p.finalCost || 0),
    points: acc.points + (p.points || 0)
  }), { paidValue: 0, finalCost: 0, points: 0 })

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleStatusChange = async (purchaseId, newStatus) => {
    if (!confirm(`Confirma a mudança de status para ${STATUS_LABELS[newStatus]}?`)) return

    setUpdating(purchaseId)

    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          deliveryDate: newStatus === 'DELIVERED' ? new Date().toISOString() : null
        })
      })

      if (response.ok) {
        onUpdate()
      } else {
        alert('Erro ao atualizar')
      }
    } catch (error) {
      alert('Erro ao atualizar')
    } finally {
      setUpdating(null)
    }
  }

  const handlePointsReceivedToggle = async (purchase) => {
    const newValue = !purchase.pointsReceived

    setUpdating(purchase.id)

    try {
      const response = await fetch(`/api/purchases/${purchase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pointsReceived: newValue })
      })

      if (response.ok) {
        setTimeout(() => {
          onUpdate()
          setUpdating(null)
        }, 100)
      } else {
        alert('Erro ao atualizar pontos')
        setUpdating(null)
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao atualizar pontos')
      setUpdating(null)
    }
  }

  const handleDelete = async (purchaseId) => {
    if (!confirm('Tem certeza que deseja EXCLUIR esta compra?')) return

    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Compra excluída com sucesso!')
        onUpdate()
      } else {
        alert('Erro ao excluir compra')
      }
    } catch (error) {
      alert('Erro ao excluir compra')
    }
  }

  const openEditDialog = (purchase) => {
    setEditingPurchase(purchase)
    setEditForm({
      purchaseDate: purchase.purchaseDate ? new Date(purchase.purchaseDate).toISOString().split('T')[0] : '',
      paidValue: purchase.paidValue,
      freight: purchase.freight || 0,
      advanceDiscount: purchase.advanceDiscount || 0,
      points: purchase.points || 0,
      cashback: purchase.cashback || 0,
      finalCost: purchase.finalCost || 0,
      clubAndStore: purchase.clubAndStore || '',
      account: purchase.account || 'Miri'
    })
  }

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/purchases/${editingPurchase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          paidValue: parseFloat(editForm.paidValue),
          freight: parseFloat(editForm.freight),
          advanceDiscount: parseFloat(editForm.advanceDiscount),
          points: parseFloat(editForm.points),
          cashback: parseFloat(editForm.cashback),
          finalCost: parseFloat(editForm.finalCost)
        })
      })

      if (response.ok) {
        alert('Compra atualizada!')
        setEditingPurchase(null)
        onUpdate()
      }
    } catch (error) {
      alert('Erro ao atualizar')
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({length: 5}, (_, i) => currentYear - 2 + i)
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Status</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="DELIVERED">Entregue</SelectItem>
              <SelectItem value="SOLD">Vendido</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Conta</label>
          <Select value={filterAccount} onValueChange={setFilterAccount}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
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
          <Select value={filterClubAndStore} onValueChange={setFilterClubAndStore}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {uniqueClubAndStores.map(store => (
                <SelectItem key={store} value={store}>
                  {store}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Pontos Recebidos</label>
          <Select value={filterPointsReceived} onValueChange={setFilterPointsReceived}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="true">Sim</SelectItem>
              <SelectItem value="false">Não</SelectItem>
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
          <>
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
          </>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
        <div className="text-center">
          <p className="text-sm text-gray-600 font-medium">Total Valor Pago</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totals.paidValue)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 font-medium">Total Custo Final</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.finalCost)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 font-medium">Total Pontos</p>
          <p className="text-2xl font-bold text-orange-600">{totals.points.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Programa/Loja</TableHead>
              <TableHead>Data Compra</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead className="text-right">Valor Pago</TableHead>
              <TableHead className="text-right">Custo Final</TableHead>
              <TableHead className="text-right">Pontos</TableHead>
              <TableHead>Pts Recebidos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                  Nenhuma compra encontrada
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">
                    {purchase.product?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{purchase.clubAndStore || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                  <TableCell>{purchase.account}</TableCell>
                  <TableCell className="text-right">{formatCurrency(purchase.paidValue)}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(purchase.finalCost)}
                  </TableCell>
                  <TableCell className="text-right">{purchase.points?.toLocaleString('pt-BR')}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={purchase.pointsReceived ? 'default' : 'outline'}
                      onClick={() => handlePointsReceivedToggle(purchase)}
                      disabled={updating === purchase.id}
                      className={purchase.pointsReceived ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {updating === purchase.id ? '...' : purchase.pointsReceived ? '✓ Sim' : '✗ Não'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[purchase.status]}>
                      {STATUS_LABELS[purchase.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(purchase)}>
                            Editar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Editar Compra</DialogTitle>
                          </DialogHeader>
                          {editingPurchase && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Data da Compra</Label>
                                  <Input
                                    type="date"
                                    value={editForm.purchaseDate}
                                    onChange={(e) => setEditForm({...editForm, purchaseDate: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>Valor Pago</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={editForm.paidValue}
                                    onChange={(e) => setEditForm({...editForm, paidValue: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>Programa/Loja</Label>
                                  <Input
                                    value={editForm.clubAndStore}
                                    onChange={(e) => setEditForm({...editForm, clubAndStore: e.target.value})}
                                    placeholder="Ex: Esfera CB"
                                  />
                                </div>
                                <div>
                                  <Label>Conta</Label>
                                  <Select value={editForm.account} onValueChange={(v) => setEditForm({...editForm, account: v})}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Miri">Miri</SelectItem>
                                      <SelectItem value="Vini">Vini</SelectItem>
                                      <SelectItem value="Lindy">Lindy</SelectItem>
                                      <SelectItem value="Milla">Milla</SelectItem>
                                      <SelectItem value="Tony">Tony</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Frete</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={editForm.freight}
                                    onChange={(e) => setEditForm({...editForm, freight: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>Desconto Antecipado</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={editForm.advanceDiscount}
                                    onChange={(e) => setEditForm({...editForm, advanceDiscount: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>Pontos</Label>
                                  <Input
                                    type="number"
                                    value={editForm.points}
                                    onChange={(e) => setEditForm({...editForm, points: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>Cashback</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={editForm.cashback}
                                    onChange={(e) => setEditForm({...editForm, cashback: e.target.value})}
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label>Custo Final</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={editForm.finalCost}
                                    onChange={(e) => setEditForm({...editForm, finalCost: e.target.value})}
                                  />
                                </div>
                              </div>
                              <Button onClick={handleEdit} className="w-full">
                                Salvar Alterações
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {purchase.status === 'PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(purchase.id, 'DELIVERED')}
                          disabled={updating === purchase.id}
                        >
                          {updating === purchase.id ? '...' : '✓ Entregue'}
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-500">
        Mostrando {filtered.length} de {purchases.length} compras
      </div>
    </div>
  )
}
