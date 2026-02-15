'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'DELETE'
      })

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

  const filteredPurchases = purchases.filter(p => {
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false
    if (filterAccount !== 'ALL' && p.account !== filterAccount) return false

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

  const totals = filteredPurchases.reduce((acc, p) => ({
    paidValue: acc.paidValue + (p.paidValue || 0),
    finalCost: acc.finalCost + (p.finalCost || 0),
    points: acc.points + (p.points || 0)
  }), { paidValue: 0, finalCost: 0, points: 0 })

  // Anos de 2025 até 2030
  const years = [2025, 2026, 2027, 2028, 2029, 2030]
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <TableCell className="font-medium">
                {purchase.product?.name || 'N/A'}
              </TableCell>
              <TableCell>{purchase.clubAndStore}</TableCell>
              <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
              <TableCell>{purchase.account}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(purchase.paidValue)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(purchase.finalCost)}
              </TableCell>
              <TableCell className="text-right">
                {purchase.points?.toLocaleString('pt-BR')}
              </TableCell>
              <TableCell>
                <Badge variant={purchase.pointsReceived ? 'default' : 'secondary'}>
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
                      onClick={() => handleStatusChange(purchase.id, 'DELIVERED')}
                      disabled={updating === purchase.id}
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="text-sm text-gray-500">
        Mostrando {filteredPurchases.length} de {purchases.length} compras
      </div>
    </div>
  )
}
