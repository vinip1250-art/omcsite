'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function SalesTable({ sales }) {
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

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data da Venda</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Conta</TableHead>
            <TableHead>Custo Final</TableHead>
            <TableHead>Valor Vendido</TableHead>
            <TableHead>Lucro</TableHead>
            <TableHead>Mês</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-gray-500">
                Nenhuma venda registrada
              </TableCell>
            </TableRow>
          ) : (
            sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{formatDate(sale.saleDate)}</TableCell>
                <TableCell className="font-medium">
                  {sale.product?.name || 'N/A'}
                </TableCell>
                <TableCell>{sale.customer}</TableCell>
                <TableCell>{sale.account}</TableCell>
                <TableCell>{formatCurrency(sale.finalCost)}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(sale.soldValue)}
                </TableCell>
                <TableCell className="font-bold text-green-600">
                  {formatCurrency(sale.profit || 0)}
                </TableCell>
                <TableCell>{sale.month}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {sales.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Total de Vendas</p>
              <p className="text-lg font-semibold">{sales.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Faturamento</p>
              <p className="text-lg font-semibold">
                {formatCurrency(sales.reduce((acc, s) => acc + (s.soldValue || 0), 0))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Lucro Total</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(sales.reduce((acc, s) => acc + (s.profit || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
