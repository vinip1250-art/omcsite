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
  const [updating, setUpdating] = useState(null)
  const [editingPurchase, setEditingPurchase] = useState(null)
  const [editForm, setEditForm] = useState({})

  const filtered = purchases.filter(p => {
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false
    if (filterAccount !== 'ALL' && p.account !== filterAccount) return false
    return true
  })

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
        alert('Status atualizado!')
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

  const handlePointsReceived = async (purchaseId, received) => {
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pointsReceived: received })
      })

      if (response.ok) {
        alert(received ? 'Pontos marcados como recebidos!' : 'Pontos desmarcados')
        onUpdate()
      }
    } catch (error) {
      alert('Erro ao atualizar pontos')
    }
  }

  const openEditDialog = (purchase) => {
    setEditingPurchase(purchase)
    setEditForm({
      paidValue: purchase.paidValue,
      freight: purchase.freight || 0,
      advanceDiscount: purchase.advanceDiscount || 0,
      points: purchase.points || 0,
      cashback: purchase.cashback || 0,
      clubAndStore: purchase.clubAndStore || '',
      account: purchase.account || 'Miri'
    })
  }

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/purchases/${editingPurchase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
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

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Status</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
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
            <SelectTrigger className="w-[180px]">
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
      </div>

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
                      onClick={() => handlePointsReceived(purchase.id, !purchase.pointsReceived)}
                    >
                      {purchase.pointsReceived ? '✓ Sim' : '✗ Não'}
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
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Compra</DialogTitle>
                          </DialogHeader>
                          {editingPurchase && (
                            <div className="space-y-4">
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
                                <Label>Pontos</Label>
                                <Input
                                  type="number"
                                  value={editForm.points}
                                  onChange={(e) => setEditForm({...editForm, points: e.target.value})}
                                />
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
