'use client'

import { useState } from 'react'
import { ProdutoForm } from './ProdutoForm'

interface Produto {
  id: string
  name: string
  model: string
  storage: string
  color: string
  active: boolean
  stock?: { inStock: number; onTheWay: number; averageCost: number }
  _count?: { purchases: number }
}

interface ProdutoTableProps {
  produtos: Produto[]
  onRefresh: () => void
}

export function ProdutoTable({ produtos, onRefresh }: ProdutoTableProps) {
  const [editando, setEditando] = useState<Produto | null>(null)
  const [deletando, setDeletando] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return
    setDeletando(id)
    try {
      await fetch(`/api/produtos/${id}`, { method: 'DELETE' })
      onRefresh()
    } finally {
      setDeletando(null)
    }
  }

  const handleToggleActive = async (produto: Produto) => {
    await fetch(`/api/produtos/${produto.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...produto, active: !produto.active })
    })
    onRefresh()
  }

  if (editando) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4">Editar Produto</h3>
        <ProdutoForm
          produto={editando}
          onSuccess={() => { setEditando(null); onRefresh() }}
        />
        <button
          onClick={() => setEditando(null)}
          className="mt-3 text-sm text-gray-500 hover:underline"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-left">
            <th className="px-4 py-3 rounded-l-lg">Produto</th>
            <th className="px-4 py-3">Armazenamento</th>
            <th className="px-4 py-3">Cor</th>
            <th className="px-4 py-3 text-center">Em Estoque</th>
            <th className="px-4 py-3 text-center">A Caminho</th>
            <th className="px-4 py-3 text-right">Custo Médio</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3 rounded-r-lg text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {produtos.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center py-10 text-gray-400">
                Nenhum produto cadastrado
              </td>
            </tr>
          )}
          {produtos.map(p => (
            <tr key={p.id} className={`hover:bg-gray-50 ${!p.active ? 'opacity-50' : ''}`}>
              <td className="px-4 py-3 font-medium">{p.name} {p.model}</td>
              <td className="px-4 py-3">{p.storage}</td>
              <td className="px-4 py-3">{p.color}</td>
              <td className="px-4 py-3 text-center">
                <span className={`font-semibold ${(p.stock?.inStock ?? 0) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  {p.stock?.inStock ?? 0}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`font-semibold ${(p.stock?.onTheWay ?? 0) > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                  {p.stock?.onTheWay ?? 0}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {p.stock?.averageCost
                  ? `R$ ${p.stock.averageCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  : '—'}
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => handleToggleActive(p)}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    p.active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {p.active ? 'Ativo' : 'Inativo'}
                </button>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setEditando(p)}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletando === p.id}
                    className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
