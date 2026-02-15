'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const STATUS_LABELS = {
  'PENDING': 'Pendente',
  'DELIVERED': 'Entregue',
  'SOLD': 'Vendido'
}

const STATUS_COLORS = {
  'PENDING': 'bg-yellow-500',
  'DELIVERED': 'bg-blue-500',
  'SOLD': 'bg-green-500'
}

export default function PurchaseTable({ purchases, onUpdate }) {
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterAccount, setFilterAccount] = useState('ALL')
  const [filterPeriod, setFilterPeriod] = useState('ALL')
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())
  const [updating, setUpdating] = useState(null)

  // Estado para modal de edição
  const [editingPurchase, setEditingPurchase] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [editModalOpen, setEditModalOpen] = useState(false)

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const formatDateForInput = (date) => {
    if (!date) return ''
    return new Date(date).toISOString().split('T')[0]
  }

  const handleStatusChange = async (purchaseId, newStatus) => {
    if (!confirm(`Confirma a mudança de status para ${STATUS_LABELS[newStatus]}?`)) return
    setUpdating(purchaseId)
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
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

  const handleDelete = async (purchaseId) => {
    if (!confirm('Confirma a exclusão desta compra?')) return
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, { method: 'DELETE' })
      if (response.ok) {
        alert('Compra excluída!')
        onUpdate()
      } else {
        alert('Erro ao excluir')
      }
    } catch (error) {
      alert('Erro ao excluir')
    }
  }

  const handleTogglePoints = async (purchaseId, currentValue) => {
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pointsReceived: !currentValue })
      })
      if (response.ok) {
        onUpdate()
      } else {
        alert('Erro ao atualizar')
      }
    } catch (error) {
      alert('Erro ao atualizar')
    }
  }

  const handleEditClick = (purchase) => {
    setEditingPurchase(purchase)
    setEditFormData({
      paidValue: purchase.paidValue || 0,
      shipping: purchase.shipping || 0,
      advanceDiscount: purchase.advanceDiscount || 0,
      cashback: purchase.cashback || 0,
      points: purchase.points || 0,
      thousand: purchase.thousand || 0,
      pointsPerReal: purchase.pointsPerReal || 0,
      clubAndStore: purchase.clubAndStore || '',
      orderNumber: purchase.orderNumber || '',
      purchaseDate: formatDateForInput(purchase.purchaseDate),
      deliveryDate: formatDateForInput(purchase.deliveryDate),
      account: purchase.account || 'Miri'
    })
    setEditModalOpen(true)
  }

  const handleEditSave = async () => {
    if (!editingPurchase) return

    try {
      const finalCost = parseFloat(editFormData.paidValue) + 
                       parseFloat(editFormData.shipping || 0) - 
                       parseFloat(editFormData.advanceDiscount || 0) - 
                       parseFloat(editFormData.cashback || 0) - 
                       (parseFloat(editFormData.points || 0) / parseFloat(editFormData.thousand || 1))

      const response = await fetch(`/api/purchases/${editingPurchase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editFormData,
          paidValue: parseFloat(editFormData.paidValue),
          shipping: parseFloat(editFormData.shipping || 0),
          advanceDiscount: parseFloat(editFormData.advanceDiscount || 0),
          cashback: parseFloat(editFormData.cashback || 0),
          points: parseFloat(editFormData.points || 0),
          thousand: parseFloat(editFormData.thousand || 0),
          pointsPerReal: parseFloat(editFormData.pointsPerReal || 0),
          finalCost
        })
      })

      if (response.ok) {
        alert('Compra atualizada com sucesso!')
        setEditModalOpen(false)
        onUpdate()
      } else {
        alert('Erro ao atualizar')
      }
    } catch (error) {
      alert('Erro ao atualizar')
    }
  }

  const filteredPurchases = purchases.filter(p => {
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false
    if (filterAccount !== 'ALL' && p.account !== filterAccount) return false
    if (filterPeriod !== 'ALL' && p.purchaseDate) {
      const purchaseDate = new Date(p.purchaseDate)
      const today = new Date()
      if (filterPeriod === 'TODAY') {
        if (purchaseDate.toDateString() !== today.toDateString()) return false
      } else if (filterPeriod === 'MONTH') {
        if (purchaseDate.getMonth() !== filterMonth - 1 || purchaseDate.getFullYear() !== filterYear) return false
      } else if (filterPeriod === 'YEAR') {
        if (purchaseDate.getFullYear() !== filterYear) return false
      }
    }
    return true
  })

  const totals = filteredPurchases.reduce((acc, p) => ({
    paidValue: acc.paidValue + (p.paidValue || 0),
    finalCost: acc.finalCost + (p.finalCost || 0),
    points: acc.points + (p.points || 0)
  }), { paidValue: 0, finalCost: 0, points: 0 })

  const years = [2025, 2026, 2027, 2028, 2029, 2030]
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="DELIVERED">Entregue</SelectItem>
                <SelectItem value="SOLD">Vendido</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
        </div>
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
              <TableHead>Pts Recebido</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPurchases.map(purchase => (
              <TableRow key={purchase.id}>
                <TableCell className="font-medium">{purchase.product?.name || 'N/A'}</TableCell>
                <TableCell>{purchase.clubAndStore}</TableCell>
                <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                <TableCell>{purchase.account}</TableCell>
                <TableCell className="text-right">{formatCurrency(purchase.paidValue)}</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(purchase.finalCost)}</TableCell>
                <TableCell className="text-right">{purchase.points?.toLocaleString('pt-BR')}</TableCell>
                <TableCell>
                  <Badge 
                    variant={purchase.pointsReceived ? 'default' : 'secondary'}
                    className="cursor-pointer hover:opacity-80"
                    onClick={() => handleTogglePoints(purchase.id, purchase.pointsReceived)}
                  >
                    {purchase.pointsReceived ? 'Sim' : 'Não'}
                  </Badge>
                </TableCell>
                <TableCell><Badge className={STATUS_COLORS[purchase.status]}>{STATUS_LABELS[purchase.status]}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditClick(purchase)}>✏️ Editar</Button>
                    {purchase.status === 'PENDING' && <Button size="sm" onClick={() => handleStatusChange(purchase.id, 'DELIVERED')} disabled={updating === purchase.id}>✓ Entregue</Button>}
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(purchase.id)}>Excluir</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="text-sm text-gray-500">Mostrando {filteredPurchases.length} de {purchases.length} compras</div>
      </div>

      {/* Modal de Edição */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Compra - {editingPurchase?.product?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label>Valor Pago *</Label>
              <Input type="number" step="0.01" value={editFormData.paidValue || ''} onChange={(e) => setEditFormData({...editFormData, paidValue: e.target.value})} />
            </div>
            <div>
              <Label>Frete</Label>
              <Input type="number" step="0.01" value={editFormData.shipping || ''} onChange={(e) => setEditFormData({...editFormData, shipping: e.target.value})} />
            </div>
            <div>
              <Label>Desconto Antecipado</Label>
              <Input type="number" step="0.01" value={editFormData.advanceDiscount || ''} onChange={(e) => setEditFormData({...editFormData, advanceDiscount: e.target.value})} />
            </div>
            <div>
              <Label>Cashback</Label>
              <Input type="number" step="0.01" value={editFormData.cashback || ''} onChange={(e) => setEditFormData({...editFormData, cashback: e.target.value})} />
            </div>
            <div>
              <Label>Pontos</Label>
              <Input type="number" value={editFormData.points || ''} onChange={(e) => setEditFormData({...editFormData, points: e.target.value})} />
            </div>
            <div>
              <Label>Milhar</Label>
              <Input type="number" value={editFormData.thousand || ''} onChange={(e) => setEditFormData({...editFormData, thousand: e.target.value})} />
            </div>
            <div>
              <Label>Pts por Real</Label>
              <Input type="number" step="0.01" value={editFormData.pointsPerReal || ''} onChange={(e) => setEditFormData({...editFormData, pointsPerReal: e.target.value})} />
            </div>
            <div>
              <Label>Conta</Label>
              <Select value={editFormData.account} onValueChange={(v) => setEditFormData({...editFormData, account: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Label>Programa/Loja</Label>
              <Input value={editFormData.clubAndStore || ''} onChange={(e) => setEditFormData({...editFormData, clubAndStore: e.target.value})} />
            </div>
            <div>
              <Label>Nº Pedido</Label>
              <Input value={editFormData.orderNumber || ''} onChange={(e) => setEditFormData({...editFormData, orderNumber: e.target.value})} />
            </div>
            <div>
              <Label>Data Compra</Label>
              <Input type="date" value={editFormData.purchaseDate || ''} onChange={(e) => setEditFormData({...editFormData, purchaseDate: e.target.value})} />
            </div>
            <div>
              <Label>Data Entrega</Label>
              <Input type="date" value={editFormData.deliveryDate || ''} onChange={(e) => setEditFormData({...editFormData, deliveryDate: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditSave}>Salvar Alterações</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
