'use client'

import { useState } from 'react'

interface ProdutoFormProps {
  onSuccess: () => void
  produto?: {
    id: string
    name: string
    model: string
    storage: string
    color: string
  }
}

export function ProdutoForm({ onSuccess, produto }: ProdutoFormProps) {
  const [form, setForm] = useState({
    name: produto?.name ?? '',
    model: produto?.model ?? '',
    storage: produto?.storage ?? '',
    color: produto?.color ?? ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(
        produto ? `/api/produtos/${produto.id}` : '/api/produtos',
        {
          method: produto ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao salvar')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Produto *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="ex: iPhone 13"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modelo *
          </label>
          <input
            type="text"
            value={form.model}
            onChange={e => setForm({ ...form, model: e.target.value })}
            placeholder="ex: 13"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Armazenamento *
          </label>
          <select
            value={form.storage}
            onChange={e => setForm({ ...form, storage: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          >
            <option value="">Selecione...</option>
            <option value="64GB">64GB</option>
            <option value="128GB">128GB</option>
            <option value="256GB">256GB</option>
            <option value="512GB">512GB</option>
            <option value="1TB">1TB</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cor *
          </label>
          <input
            type="text"
            value={form.color}
            onChange={e => setForm({ ...form, color: e.target.value })}
            placeholder="ex: Branco"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : produto ? 'Atualizar' : 'Cadastrar'}
        </button>
      </div>
    </form>
  )
}
