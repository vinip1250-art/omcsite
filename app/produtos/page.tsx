'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Produto {
  id: string; name: string; model: string; storage: string; color: string; active: boolean
  stock?: { inStock: number; onTheWay: number; averageCost: number }
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<Produto | null>(null)
  const [form, setForm] = useState({ name: '', model: '', storage: '', color: '' })
  const [salvando, setSalvando] = useState(false)

  const fetchProdutos = async () => {
    setLoading(true)
    const res = await fetch('/api/products')
    const data = await res.json()
    setProdutos(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchProdutos() }, [])

  const abrirForm = (p?: Produto) => {
    if (p) {
      setEditando(p)
      setForm({ name: p.name, model: p.model, storage: p.storage, color: p.color })
    } else {
      setEditando(null)
      setForm({ name: '', model: '', storage: '', color: '' })
    }
    setShowForm(true)
  }

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    await fetch(editando ? `/api/products/${editando.id}` : '/api/products', {
      method: editando ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setSalvando(false)
    setShowForm(false)
    fetchProdutos()
  }

  const excluir = async (id: string) => {
    if (!confirm('Excluir produto?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    fetchProdutos()
  }

  const toggleAtivo = async (p: Produto) => {
    await fetch(`/api/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...p, active: !p.active })
    })
    fetchProdutos()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <Button onClick={() => abrirForm()}>+ Novo Produto</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editando ? 'Editar Produto' : 'Novo Produto'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={salvar} className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="ex: iPhone" />
              </div>
              <div>
                <Label>Modelo</Label>
                <Input value={form.model} onChange={e => setForm({...form, model: e.target.value})} placeholder="ex: 15 Pro" />
              </div>
              <div>
                <Label>Armazenamento</Label>
                <select value={form.storage} onChange={e => setForm({...form, storage: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option value="">Selecione...</option>
                  {['64GB','128GB','256GB','512GB','1TB'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label>Cor</Label>
                <Input value={form.color} onChange={e => setForm({...form, color: e.target.value})} placeholder="ex: Preto Titanium" />
              </div>
              <div className="col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Produtos Cadastrados ({produtos.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-center text-gray-400 py-8">Carregando...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3">Produto</th>
                    <th className="px-4 py-3">Armazenamento</th>
                    <th className="px-4 py-3">Cor</th>
                    <th className="px-4 py-3 text-center">Em Estoque</th>
                    <th className="px-4 py-3 text-center">A Caminho</th>
                    <th className="px-4 py-3 text-right">Custo Médio</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {produtos.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-8 text-gray-400">Nenhum produto cadastrado</td></tr>
                  ) : produtos.map(p => (
                    <tr key={p.id} className={`hover:bg-gray-50 ${!p.active ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3 font-medium">{[p.name, p.model].filter(Boolean).join(' ') || '(sem nome)'}</td>
                      <td className="px-4 py-3">{p.storage || '—'}</td>
                      <td className="px-4 py-3">{p.color || '—'}</td>
                      <td className="px-4 py-3 text-center font-semibold text-green-600">{p.stock?.inStock ?? 0}</td>
                      <td className="px-4 py-3 text-center font-semibold text-yellow-600">{p.stock?.onTheWay ?? 0}</td>
                      <td className="px-4 py-3 text-right">
                        {p.stock?.averageCost ? `R$ ${p.stock.averageCost.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleAtivo(p)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.active ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-3">
                          <button onClick={() => abrirForm(p)} className="text-blue-600 hover:underline text-xs">Editar</button>
                          <button onClick={() => excluir(p.id)} className="text-red-500 hover:underline text-xs">Excluir</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
