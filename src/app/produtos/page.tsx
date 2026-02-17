'use client'

import { useEffect, useState } from 'react'
import { ProdutoForm } from '@/components/produtos/ProdutoForm'
import { ProdutoTable } from '@/components/produtos/ProdutoTable'

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchProdutos = async () => {
    setLoading(true)
    const res = await fetch('/api/produtos')
    const data = await res.json()
    setProdutos(data)
    setLoading(false)
  }

  useEffect(() => { fetchProdutos() }, [])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {produtos.length} produto(s) cadastrado(s)
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : '+ Novo Produto'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Novo Produto</h2>
          <ProdutoForm onSuccess={() => { setShowForm(false); fetchProdutos() }} />
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-xl border">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Carregando...</div>
        ) : (
          <ProdutoTable produtos={produtos} onRefresh={fetchProdutos} />
        )}
      </div>

    </div>
  )
}
