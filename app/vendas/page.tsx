'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Produto { id: string; name: string; model: string; storage: string; color: string }
interface CompraDisponivel {
  id: string; productId: string; product: Produto
  finalCost: number; deliveryDate: string; account: string; orderNumber?: string
}
interface Venda {
  id: string; product: Produto; productId: string
  soldValue: number; finalCost: number; profit: number
  saleDate: string; customer?: string; serialNumber?: string
  account: string; orderNumber?: string; status: string; month?: string
}

const emptyForm = {
  productId: '', purchaseIds: [] as string[],
  soldValue: '', saleDate: '', customer: '', serialNumber: '',
}

const emptyEditForm = {
  soldValue: '', saleDate: '', customer: '', serialNumber: '',
}

const emptyFilters = {
  mes: '', ano: '', dataVendaInicio: '', dataVendaFim: '',
  produto: '', cliente: '',
}

const MESES = [
  { v: '1', l: 'Janeiro' }, { v: '2', l: 'Fevereiro' }, { v: '3', l: 'Março' },
  { v: '4', l: 'Abril' }, { v: '5', l: 'Maio' }, { v: '6', l: 'Junho' },
  { v: '7', l: 'Julho' }, { v: '8', l: 'Agosto' }, { v: '9', l: 'Setembro' },
  { v: '10', l: 'Outubro' }, { v: '11', l: 'Novembro' }, { v: '12', l: 'Dezembro' },
]
const ANOS = ['2025','2026','2027','2028','2029','2030']

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [disponiveis, setDisponiveis] = useState<CompraDisponivel[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [filters, setFilters] = useState(emptyFilters)
  const [salvando, setSalvando] = useState(false)

  // Estados para edição/cancelamento/exclusão
  const [editando, setEditando] = useState<Venda | null>(null)
  const [editForm, setEditForm] = useState(emptyEditForm)
  const [confirmando, setConfirmando] = useState<{ tipo: 'cancelar' | 'excluir'; venda: Venda } | null>(null)
  const [processando, setProcessando] = useState<string | null>(null)

  const fetch_ = async () => {
    setLoading(true)
    const [v, d] = await Promise.all([
      fetch('/api/sales').then(r => r.json()),
      fetch('/api/purchases?status=DELIVERED').then(r => r.json()),
    ])
    setVendas(Array.isArray(v) ? v : [])
    setDisponiveis(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  useEffect(() => { fetch_() }, [])

  const itensDisponiveis = useMemo(() =>
    disponiveis.filter(d => d.productId === form.productId),
    [disponiveis, form.productId]
  )

  const custoMedio = useMemo(() => {
    if (itensDisponiveis.length === 0) return 0
    return itensDisponiveis.reduce((s, i) => s + i.finalCost, 0) / itensDisponiveis.length
  }, [itensDisponiveis])

  const produtosDisponiveis = useMemo(() => {
    const map = new Map<string, { produto: Produto; qtd: number; custoMedio: number }>()
    disponiveis.forEach(d => {
      if (!map.has(d.productId)) map.set(d.productId, { produto: d.product, qtd: 0, custoMedio: 0 })
      map.get(d.productId)!.qtd++
    })
    disponiveis.forEach(d => {
      const entry = map.get(d.productId)!
      entry.custoMedio += d.finalCost / entry.qtd
    })
    return Array.from(map.values())
  }, [disponiveis])

  const lucroEstimado = useMemo(() => {
    const vl = parseFloat(form.soldValue) || 0
    const qty = form.purchaseIds.length || 1
    return (vl * qty) - (custoMedio * qty)
  }, [form.soldValue, form.purchaseIds, custoMedio])

  const handleProdutoChange = (productId: string) => {
    setForm(f => ({ ...f, productId, purchaseIds: [] }))
  }

  const togglePurchaseId = (id: string) => {
    setForm(f => ({
      ...f,
      purchaseIds: f.purchaseIds.includes(id)
        ? f.purchaseIds.filter(x => x !== id)
        : [...f.purchaseIds, id]
    }))
  }

  const selecionarTodos = () => {
    setForm(f => ({
      ...f,
      purchaseIds: f.purchaseIds.length === itensDisponiveis.length
        ? []
        : itensDisponiveis.map(i => i.id)
    }))
  }

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.purchaseIds.length === 0) { alert('Selecione ao menos um item'); return }
    setSalvando(true)
    const soldValue = parseFloat(form.soldValue)
    await Promise.all(form.purchaseIds.map(purchaseId =>
      fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseId, soldValue,
          saleDate: form.saleDate,
          customer: form.customer || null,
          serialNumber: form.serialNumber || null,
          profit: soldValue - custoMedio,
        })
      })
    ))
    setSalvando(false)
    setShowForm(false)
    setForm(emptyForm)
    fetch_()
  }

  // ── Editar venda ──
  const abrirEdicao = (v: Venda) => {
    setEditando(v)
    setEditForm({
      soldValue: String(v.soldValue ?? ''),
      saleDate: v.saleDate ? new Date(v.saleDate).toISOString().slice(0, 10) : '',
      customer: v.customer ?? '',
      serialNumber: v.serialNumber ?? '',
    })
  }

  const salvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editando) return
    setProcessando(editando.id)
    const res = await fetch(`/api/sales/${editando.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        soldValue: parseFloat(editForm.soldValue),
        saleDate: editForm.saleDate,
        customer: editForm.customer || null,
        serialNumber: editForm.serialNumber || null,
        profit: parseFloat(editForm.soldValue) - (editando.finalCost ?? 0),
      })
    })
    if (res.ok) {
      const updated = await res.json()
      setVendas(prev => prev.map(v => v.id === updated.id ? updated : v))
    }
    setProcessando(null)
    setEditando(null)
  }

  // ── Cancelar venda (volta ao estoque) ──
  const cancelarVenda = async (venda: Venda) => {
    setProcessando(venda.id)
    const res = await fetch(`/api/sales/${venda.id}`, { method: 'PATCH' })
    if (res.ok) {
      setVendas(prev => prev.filter(v => v.id !== venda.id))
      await fetch_() // recarrega disponiveis também
    }
    setProcessando(null)
    setConfirmando(null)
  }

  // ── Excluir venda ──
  const excluirVenda = async (venda: Venda) => {
    setProcessando(venda.id)
    const res = await fetch(`/api/sales/${venda.id}`, { method: 'DELETE' })
    if (res.ok) {
      setVendas(prev => prev.filter(v => v.id !== venda.id))
      await fetch_()
    }
    setProcessando(null)
    setConfirmando(null)
  }

  const vendasFiltradas = useMemo(() => {
    return vendas.filter(v => {
      const dtVenda = v.saleDate ? new Date(v.saleDate) : null
      if (filters.mes && dtVenda && dtVenda.getMonth() + 1 !== parseInt(filters.mes)) return false
      if (filters.ano && dtVenda && dtVenda.getFullYear() !== parseInt(filters.ano)) return false
      if (filters.dataVendaInicio && dtVenda && dtVenda < new Date(filters.dataVendaInicio)) return false
      if (filters.dataVendaFim && dtVenda && dtVenda > new Date(filters.dataVendaFim)) return false
      if (filters.produto) {
        const nome = [v.product?.name, v.product?.model, v.product?.storage, v.product?.color]
          .filter(Boolean).join(' ').toLowerCase()
        if (!nome.includes(filters.produto.toLowerCase())) return false
      }
      if (filters.cliente && !v.customer?.toLowerCase().includes(filters.cliente.toLowerCase())) return false
      return true
    })
  }, [vendas, filters])

  const totais = useMemo(() => ({
    venda: vendasFiltradas.reduce((s, v) => s + (v.soldValue ?? 0), 0),
    custo: vendasFiltradas.reduce((s, v) => s + (v.finalCost ?? 0), 0),
    lucro: vendasFiltradas.reduce((s, v) => s + (v.profit ?? 0), 0),
  }), [vendasFiltradas])

  const filtrosAtivos = Object.values(filters).some(v => v !== '')
  const setFilter = (f: string, v: string) => setFilters(p => ({ ...p, [f]: v }))
  const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  const nomeProd = (p: Produto) => [p?.name, p?.model, p?.storage, p?.color].filter(Boolean).join(' ')

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vendas</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}>
            🔍 Filtros {filtrosAtivos && <span className="ml-1 bg-blue-600 text-white rounded-full px-1.5 text-xs">!</span>}
          </button>
          <Button onClick={() => { setForm(emptyForm); setShowForm(!showForm) }}>
            {showForm ? 'Cancelar' : '+ Nova Venda'}
          </Button>
        </div>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Disponível p/ Venda</p>
          <p className="text-3xl font-bold text-green-600">{disponiveis.length}</p>
          <p className="text-xs text-gray-400">unidades em estoque</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Vendas {filtrosAtivos ? '(filtradas)' : 'Total'}</p>
          <p className="text-3xl font-bold text-blue-600">{vendasFiltradas.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Receita {filtrosAtivos ? '(filtrada)' : ''}</p>
          <p className="text-xl font-bold text-gray-700">R$ {fmtBRL(totais.venda)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Lucro {filtrosAtivos ? '(filtrado)' : ''}</p>
          <p className={`text-xl font-bold ${totais.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {fmtBRL(totais.lucro)}
          </p>
        </CardContent></Card>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Filtros</CardTitle>
              {filtrosAtivos && <button onClick={() => setFilters(emptyFilters)} className="text-xs text-red-500 hover:underline">Limpar</button>}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div>
                <Label className="text-xs">Mês</Label>
                <select value={filters.mes} onChange={e => setFilter('mes', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm">
                  <option value="">Todos</option>
                  {MESES.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs">Ano</Label>
                <select value={filters.ano} onChange={e => setFilter('ano', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm">
                  <option value="">Todos</option>
                  {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs">Data Venda — De</Label>
                <Input type="date" className="h-9 text-sm" value={filters.dataVendaInicio}
                  onChange={e => setFilter('dataVendaInicio', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Data Venda — Até</Label>
                <Input type="date" className="h-9 text-sm" value={filters.dataVendaFim}
                  onChange={e => setFilter('dataVendaFim', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Produto</Label>
                <Input className="h-9 text-sm" placeholder="Buscar..." value={filters.produto}
                  onChange={e => setFilter('produto', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Cliente / Loja</Label>
                <Input className="h-9 text-sm" placeholder="Buscar..." value={filters.cliente}
                  onChange={e => setFilter('cliente', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form nova venda */}
      {showForm && (
        <Card>
          <CardHeader><CardTitle>Nova Venda</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={salvar} className="space-y-4">
              <div>
                <Label>Produto *</Label>
                <select value={form.productId} onChange={e => handleProdutoChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" required>
                  <option value="">Selecione o produto...</option>
                  {produtosDisponiveis.map(({ produto, qtd, custoMedio: cm }) => (
                    <option key={produto.id} value={produto.id}>
                      {nomeProd(produto)} — {qtd} un. | Custo médio: R$ {fmtBRL(cm)}
                    </option>
                  ))}
                </select>
              </div>
              {form.productId && itensDisponiveis.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Selecione as unidades a vender *</Label>
                    <button type="button" onClick={selecionarTodos} className="text-xs text-blue-600 hover:underline">
                      {form.purchaseIds.length === itensDisponiveis.length ? 'Desmarcar todos' : 'Selecionar todos'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {itensDisponiveis.map(item => (
                      <label key={item.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" checked={form.purchaseIds.includes(item.id)}
                          onChange={() => togglePurchaseId(item.id)} className="w-4 h-4 accent-blue-600" />
                        <span className="text-sm">
                          Custo: <strong>R$ {fmtBRL(item.finalCost)}</strong>
                          {item.deliveryDate && <span className="text-gray-400 ml-2">Entrou: {new Date(item.deliveryDate).toLocaleDateString('pt-BR')}</span>}
                          {item.account && <span className="text-gray-400 ml-2">({item.account})</span>}
                          {item.orderNumber && <span className="text-gray-400 ml-2">Pedido: {item.orderNumber}</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {form.purchaseIds.length} unidade{form.purchaseIds.length !== 1 ? 's' : ''} selecionada{form.purchaseIds.length !== 1 ? 's' : ''}
                    {' | '}Custo médio: R$ {fmtBRL(custoMedio)}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div>
                  <Label>Valor de Venda Unit. (R$) *</Label>
                  <Input type="number" step="0.01" value={form.soldValue}
                    onChange={e => setForm(f => ({ ...f, soldValue: e.target.value }))} placeholder="0,00" required />
                  {form.purchaseIds.length > 1 && parseFloat(form.soldValue) > 0 && (
                    <p className="text-xs text-blue-500 mt-1">Total: R$ {fmtBRL(parseFloat(form.soldValue) * form.purchaseIds.length)}</p>
                  )}
                </div>
                <div>
                  <Label>Data da Venda *</Label>
                  <Input type="date" value={form.saleDate}
                    onChange={e => setForm(f => ({ ...f, saleDate: e.target.value }))} required />
                </div>
                <div>
                  <Label>Cliente / Loja</Label>
                  <Input value={form.customer} onChange={e => setForm(f => ({ ...f, customer: e.target.value }))}
                    placeholder="Nome do cliente ou loja" />
                </div>
                <div>
                  <Label>IMEI / Série (opcional)</Label>
                  <Input value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))}
                    placeholder="ex: 354689..." />
                </div>
                {form.purchaseIds.length > 0 && parseFloat(form.soldValue) > 0 && (
                  <div className={`rounded-lg p-3 col-span-2 ${lucroEstimado >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <Label>Lucro Estimado</Label>
                    <p className={`text-2xl font-bold mt-1 ${lucroEstimado >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      R$ {fmtBRL(lucroEstimado)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {form.purchaseIds.length} un. × R$ {fmtBRL(parseFloat(form.soldValue) || 0)}
                      {' − '}custo R$ {fmtBRL(custoMedio * form.purchaseIds.length)}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setForm(emptyForm) }}>Cancelar</Button>
                <Button type="submit" disabled={salvando || form.purchaseIds.length === 0}>
                  {salvando ? 'Salvando...' : `Registrar Venda${form.purchaseIds.length > 1 ? ` (${form.purchaseIds.length} un.)` : ''}`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Modal Editar Venda */}
      {editando && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Editar Venda</CardTitle>
              <p className="text-sm text-gray-500">{nomeProd(editando.product)}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={salvarEdicao} className="space-y-3">
                <div>
                  <Label>Valor de Venda (R$) *</Label>
                  <Input type="number" step="0.01" value={editForm.soldValue}
                    onChange={e => setEditForm(f => ({ ...f, soldValue: e.target.value }))} required />
                </div>
                <div>
                  <Label>Data da Venda *</Label>
                  <Input type="date" value={editForm.saleDate}
                    onChange={e => setEditForm(f => ({ ...f, saleDate: e.target.value }))} required />
                </div>
                <div>
                  <Label>Cliente / Loja</Label>
                  <Input value={editForm.customer}
                    onChange={e => setEditForm(f => ({ ...f, customer: e.target.value }))} />
                </div>
                <div>
                  <Label>IMEI / Série</Label>
                  <Input value={editForm.serialNumber}
                    onChange={e => setEditForm(f => ({ ...f, serialNumber: e.target.value }))} />
                </div>
                {editForm.soldValue && (
                  <div className={`rounded-lg p-3 ${parseFloat(editForm.soldValue) - editando.finalCost >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className="text-xs text-gray-500">Lucro atualizado</p>
                    <p className={`text-xl font-bold ${parseFloat(editForm.soldValue) - editando.finalCost >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      R$ {fmtBRL(parseFloat(editForm.soldValue) - editando.finalCost)}
                    </p>
                  </div>
                )}
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setEditando(null)}>Cancelar</Button>
                  <Button type="submit" disabled={processando === editando.id}>
                    {processando === editando.id ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Confirmar Cancelar/Excluir */}
      {confirmando && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className={confirmando.tipo === 'excluir' ? 'text-red-600' : 'text-yellow-600'}>
                {confirmando.tipo === 'excluir' ? '🗑️ Excluir Venda' : '↩️ Cancelar Venda'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                <strong>{nomeProd(confirmando.venda.product)}</strong>
              </p>
              <p className="text-sm text-gray-500">
                {confirmando.tipo === 'excluir'
                  ? 'O registro será excluído permanentemente e o item voltará ao estoque.'
                  : 'A venda será cancelada e o item voltará ao estoque como disponível.'}
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setConfirmando(null)}>Voltar</Button>
                <Button
                  variant={confirmando.tipo === 'excluir' ? 'destructive' : 'outline'}
                  className={confirmando.tipo === 'cancelar' ? 'border-yellow-400 text-yellow-700 hover:bg-yellow-50' : ''}
                  disabled={processando === confirmando.venda.id}
                  onClick={() => confirmando.tipo === 'excluir'
                    ? excluirVenda(confirmando.venda)
                    : cancelarVenda(confirmando.venda)
                  }
                >
                  {processando === confirmando.venda.id ? 'Processando...' :
                    confirmando.tipo === 'excluir' ? 'Excluir' : 'Cancelar Venda'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabela de vendas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>
              Vendas Registradas ({vendasFiltradas.length}
              {filtrosAtivos && vendasFiltradas.length !== vendas.length ? ` de ${vendas.length}` : ''})
            </CardTitle>
            {vendasFiltradas.length > 0 && (
              <div className="flex gap-4 text-sm flex-wrap">
                <span>Receita: <strong className="text-blue-600">R$ {fmtBRL(totais.venda)}</strong></span>
                <span>Custo: <strong className="text-gray-600">R$ {fmtBRL(totais.custo)}</strong></span>
                <span>Lucro: <strong className={totais.lucro >= 0 ? 'text-green-600' : 'text-red-600'}>R$ {fmtBRL(totais.lucro)}</strong></span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-center text-gray-400 py-8">Carregando...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-3 py-3">Produto</th>
                    <th className="px-3 py-3">Data Venda</th>
                    <th className="px-3 py-3">Cliente / Loja</th>
                    <th className="px-3 py-3">IMEI / Série</th>
                    <th className="px-3 py-3 text-right">Vl. Venda</th>
                    <th className="px-3 py-3 text-right">Custo</th>
                    <th className="px-3 py-3 text-right">Lucro</th>
                    <th className="px-3 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {vendasFiltradas.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-8 text-gray-400">
                      {filtrosAtivos ? 'Nenhuma venda encontrada com esses filtros' : 'Nenhuma venda registrada'}
                    </td></tr>
                  ) : vendasFiltradas.map(v => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 font-medium">
                        {nomeProd(v.product)}
                        {v.orderNumber && <span className="block text-xs text-gray-400">Pedido: {v.orderNumber}</span>}
                      </td>
                      <td className="px-3 py-3">{v.saleDate ? new Date(v.saleDate).toLocaleDateString('pt-BR') : '—'}</td>
                      <td className="px-3 py-3">{v.customer ?? '—'}</td>
                      <td className="px-3 py-3 font-mono text-xs">{v.serialNumber ?? '—'}</td>
                      <td className="px-3 py-3 text-right font-semibold">R$ {fmtBRL(v.soldValue ?? 0)}</td>
                      <td className="px-3 py-3 text-right text-gray-500">R$ {fmtBRL(v.finalCost ?? 0)}</td>
                      <td className="px-3 py-3 text-right font-semibold">
                        <span className={(v.profit ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                          R$ {fmtBRL(v.profit ?? 0)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => abrirEdicao(v)}
                            className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors" title="Editar">
                            ✏️
                          </button>
                          <button onClick={() => setConfirmando({ tipo: 'cancelar', venda: v })}
                            className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600 transition-colors" title="Cancelar venda (volta ao estoque)">
                            ↩️
                          </button>
                          <button onClick={() => setConfirmando({ tipo: 'excluir', venda: v })}
                            className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors" title="Excluir">
                            🗑️
                          </button>
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
