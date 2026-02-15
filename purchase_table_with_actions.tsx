'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
        alert('Status atualizado com sucesso!')
        onUpdate()
      } else {
        alert('Erro ao atualizar status')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao atualizar status')
    } finally {
      setUpdating(null)
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
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
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
              <TableHead>Compra</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead>Valor Pago</TableHead>
              <TableHead>Custo Final</TableHead>
              <TableHead>Pontos</TableHead>
              <TableHead>Recebido</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-gray-500">
                  Nenhuma compra encontrada
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">
                    {purchase.product?.name || 'N/A'}
                  </TableCell>
                  <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                  <TableCell>{formatDate(purchase.deliveryDate)}</TableCell>
                  <TableCell>{purchase.account}</TableCell>
                  <TableCell>{formatCurrency(purchase.paidValue)}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(purchase.finalCost)}
                  </TableCell>
                  <TableCell>{purchase.points?.toLocaleString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge className={purchase.pointsReceived ? 'bg-green-500' : 'bg-gray-400'}>
                      {purchase.pointsReceived ? 'Sim' : 'Não'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[purchase.status]}>
                      {STATUS_LABELS[purchase.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {purchase.status === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(purchase.id, 'DELIVERED')}
                          disabled={updating === purchase.id}
                        >
                          {updating === purchase.id ? '...' : 'Marcar Entregue'}
                        </Button>
                      )}
                      {purchase.status === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(purchase.id, 'CANCELLED')}
                          disabled={updating === purchase.id}
                        >
                          Cancelar
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
