'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Produto { id: string; name: string; model: string; storage: string; color: string }
interface Compra {
  id: string; productId: string; product: Produto
  purchaseDate: string; deliveryDate?: string; orderNumber?: string
  paidValue: number; shipping: number; advanceDiscount: number
  cashback: number; points: number; thousand: number; finalCost: number
  account: string; clubAndStore: string; pointsPerReal: number
  pointsReceived: boolean; status: string; attachmentUrl?: string
}

const emptyForm = {
  productId: '', purchaseDate: '', orderNumber: '',
  quantity: '1', paidValue: '', shipping: '0',
  advanceDiscount: '', advanceDiscountType: 'value',
  cashback: '', cashbackType: 'value',
  points: '', thousand: '0', finalCost: '',
  account: '', clubAndStore: '', pointsPerReal: '0',
}

const emptyFilters = {
  mes: '', ano: '', dataCompraInicio: '', dataCompraFim: '',
  dataEntregaInicio: '', dataEntregaFim: '',
  conta: '', ptsRecebidos: '', status: '',
}

const statusColor: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  DELIVERED: 'bg-blue-100 text-blue-700',
  SOLD:      'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const MESES = [
  { v: '1', l: 'Janeiro' }, { v: '2', l: 'Fevereiro' }, { v: '3', l: 'Março' },
  { v: '4', l: 'Abril' }, { v: '5', l: 'Maio' }, { v: '6', l: 'Junho' },
  { v: '7', l: 'Julho' }, { v: '8', l: 'Agosto' }, { v: '9', l: 'Setembro' },
  { v: '10', l: 'Outubro' }, { v: '11', l: 'Novembro' }, { v: '12', l: 'Dezembro' },
]
const ANOS = ['2025','2026','2027','2028','2029','2030']

export default function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [editando, setEditando] = useState<Compra | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [filters, setFilters] = useState(emptyFilters)
  const [salvando, setSalvando] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [anexoModal, setAnexoModal] = useState<Compra | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetch_ = async () => {
    setLoading(true)
    const [c, p] = await Promise.all([
      fetch('/api/purchases').then(r => r.json()),
      fetch('/api/products/all').then(r => r.json())
    ])
    setCompras(Array.isArray(c) ? c : [])
    setProdutos(Array.isArray(p) ? p : [])
    setLoading(false)
  }

  useEffect(() => { fetch_() }, [])

  // ── Cálculos ──
  const qty = () => Math.max(1, parseInt(form.quantity) || 1)
  const getPagoUnitario  = () => parseFloat(form.paidValue) || 0
  const getPagoTotal     = () => getPagoUnitario() * qty()
  const getFreteTotal    = () => parseFloat(form.shipping) || 0
  const getDescValor     = () => {
    const v = parseFloat(form.advanceDiscount) || 0
    return form.advanceDiscountType === 'percent' ? getPagoTotal() * v / 100 : v
  }
  const getCashbackValor = () => {
    const v = parseFloat(form.cashback) || 0
    return form.cashbackType === 'percent' ? getPagoTotal() * v / 100 : v
  }
  const getPontosUnitario   = () => getPagoUnitario() * (parseFloat(form.pointsPerReal) || 0)
  const getPontosTotal      = () => getPontosUnitario() * qty()
  const getCashbackPontos   = () => (getPontosTotal() * (parseFloat(form.thousand) || 0)) / 1000
  const getCashbackTotal    = () => getCashbackValor() + getDescValor() + getCashbackPontos()
  const getCustoTotal       = () => getPagoTotal() + getFreteTotal() - getCashbackTotal()
  const getCustoUnitario    = () => getCustoTotal() / qty()

  const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  const fmtPts = (v: number) => (v || 0).toLocaleString('pt-BR')

  const handleChange = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const ToggleBtn = ({ field }: { field: 'advanceDiscountType' | 'cashbackType' }) => (
    <button type="button" onClick={() => handleChange(field, form[field] === 'value' ? 'percent' : 'value')}
      className="text-xs px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600">
      {form[field] === 'value' ? 'R$' : '%'}
    </button>
  )

  const patch = async (id: string, data: Record<string, any>) => {
    await fetch(`/api/purchases`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data })
    })
    setCompras(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
  }

  const abrirEditar = (c: Compra) => {
    setEditando(c)
    setForm({
      productId: c.productId, purchaseDate: c.purchaseDate?.split('T')[0] ?? '',
      orderNumber: c.orderNumber ?? '', quantity: '1',
      paidValue: String(c.paidValue), shipping: String(c.shipping),
      advanceDiscount: String(c.advanceDiscount), advanceDiscountType: 'value',
      cashback: String(c.cashback), cashbackType: 'value',
      points: String(c.points), thousand: String(c.thousand),
      finalCost: String(c.finalCost), account: c.account,
      clubAndStore: c.clubAndStore, pointsPerReal: String(c.pointsPerReal),
    })
    setShowForm(true)
  }

  const excluir = async (id: string) => {
    if (!confirm('Excluir esta compra?')) return
    await fetch(`/api/purchases/${id}`, { method: 'DELETE' })
    fetch_()
  }

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    const soldValue = parseFloat(form.paidValue)
    const iterations = editando ? 1 : qty()

    for (let i = 0; i < iterations; i++) {
      await fetch(editando ? `/api/purchases/${editando.id}` : '/api/purchases', {
        method: editando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId:       form.productId,
          purchaseDate:    form.purchaseDate,
          orderNumber:     form.orderNumber || null,
          account:         form.account,
          clubAndStore:    form.clubAndStore,
          pointsPerReal:   parseFloat(form.pointsPerReal) || 0,
          paidValue:       getPagoUnitario(),
          shipping:        getFreteTotal() / qty(),
          advanceDiscount: getDescValor() / qty(),
          cashback:        getCashbackValor() / qty(),
          points:          getPontosUnitario(),
          thousand:        parseFloat(form.thousand) || 0,
          finalCost:       getCustoUnitario(),
        })
      })
    }
    setSalvando(false)
    setShowForm(false)
    setEditando(null)
    setForm(emptyForm)
    fetch_()
  }

  // ── Upload de anexo ──
  const handleAnexo = async (compraId: string, file: File) => {
    setUploadingId(compraId)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'compras')
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const json = await res.json()
    if (json.url) {
      await fetch(`/api/purchases/${compraId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachmentUrl: json.url })
      })
      setCompras(prev => prev.map(c => c.id === compraId ? { ...c, attachmentUrl: json.url } : c))
    }
    setUploadingId(null)
  }

  // ── Exportar Excel ──
  const exportarExcel = async () => {
    const XLSX = await import('xlsx')
    const dados = comprasFiltradas.map(c => ({
      Produto:        [c.product?.name, c.product?.model, c.product?.storage, c.product?.color].filter(Boolean).join(' '),
      'Data Compra':  new Date(c.purchaseDate).toLocaleDateString('pt-BR'),
      'Data Entrega': c.deliveryDate ? new Date(c.deliveryDate).toLocaleDateString('pt-BR') : '',
      'Nº Pedido':    c.orderNumber ?? '',
      Conta:          c.account,
      'Clube/Loja':   c.clubAndStore,
      'Vl. Pago':     c.paidValue,
      Frete:          c.shipping,
      'Custo Final':  c.finalCost,
      Pontos:         c.points,
      'Pts Recebidos': c.pointsReceived ? 'Sim' : 'Não',
      Status:         c.status,
    }))
    const ws = XLSX.utils.json_to_sheet(dados)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Compras')
    XLSX.writeFile(wb, `compras-${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  // ── Filtros ──
  const comprasFiltradas = useMemo(() => {
    return compras.filter(c => {
      const dtCompra  = new Date(c.purchaseDate)
      const dtEntrega = c.deliveryDate ? new Date(c.deliveryDate) : null
      if (filters.mes && dtCompra.getMonth() + 1 !== parseInt(filters.mes)) return false
      if (filters.ano && dtCompra.getFullYear() !== parseInt(filters.ano)) return false
      if (filters.dataCompraInicio && dtCompra < new Date(filters.dataCompraInicio)) return false
      if (filters.dataCompraFim   && dtCompra > new Date(filters.dataCompraFim))   return false
      if (filters.dataEntregaInicio) { if (!dtEntrega || dtEntrega < new Date(filters.dataEntregaInicio)) return false }
      if (filters.dataEntregaFim)   { if (!dtEntrega || dtEntrega > new Date(filters.dataEntregaFim))   return false }
      if (filters.conta) {
        const b = filters.conta.toLowerCase()
        if (!c.account?.toLowerCase().includes(b) && !c.clubAndStore?.toLowerCase().includes(b)) return false
      }
      if (filters.ptsRecebidos === 'sim' && !c.pointsReceived) return false
      if (filters.ptsRecebidos === 'nao' &&  c.pointsReceived) return false
      if (filters.status && c.status !== filters.status) return false
      return true
    })
  }, [compras, filters])

  const totalFiltrado = useMemo(() => ({
    pago:  comprasFiltradas.reduce((s, c) => s + c.paidValue, 0),
    custo: comprasFiltradas.reduce((s, c) => s + c.finalCost, 0),
    pontos: comprasFiltradas.reduce((s, c) => s + c.points, 0),
  }), [comprasFiltradas])

  const filtrosAtivos = Object.values(filters).some(v => v !== '')
  const setFilter = (f: string, v: string) => setFilters(p => ({ ...p, [f]: v }))

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-3xl font-bold">Compras</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportarExcel}
            className="px-4 py-2 rounded-lg border text-sm font-medium bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
            📥 Exportar Excel
          </button>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}>
            🔍 Filtros {filtrosAtivos && <span className="ml-1 bg-blue-600 text-white rounded-full px-1.5 text-xs">!</span>}
          </button>
          <Button onClick={() => { setForm(emptyForm); setEditando(null); setShowForm(!showForm) }}>
            {showForm && !editando ? 'Cancelar' : '+ Nova Compra'}
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Filtros</CardTitle>
              {filtrosAtivos && <button onClick={() => setFilters(emptyFilters)} className="text-xs text-red-500 hover:underline">Limpar filtros</button>}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div><Label className="text-xs">Mês</Label>
                <select value={filters.mes} onChange={e => setFilter('mes', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm">
                  <option value="">Todos</option>
                  {MESES.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                </select>
              </div>
              <div><Label className="text-xs">Ano</Label>
                <select value={filters.ano} onChange={e => setFilter('ano', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm">
                  <option value="">Todos</option>
                  {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div><Label className="text-xs">Data Compra — De</Label>
                <Input type="date" className="h-9 text-sm" value={filters.dataCompraInicio} onChange={e => setFilter('dataCompraInicio', e.target.value)} />
              </div>
              <div><Label className="text-xs">Data Compra — Até</Label>
                <Input type="date" className="h-9 text-sm" value={filters.dataCompraFim} onChange={e => setFilter('dataCompraFim', e.target.value)} />
              </div>
              <div><Label className="text-xs">Data Entrega — De</Label>
                <Input type="date" className="h-9 text-sm" value={filters.dataEntregaInicio} onChange={e => setFilter('dataEntregaInicio', e.target.value)} />
              </div>
              <div><Label className="text-xs">Data Entrega — Até</Label>
                <Input type="date" className="h-9 text-sm" value={filters.dataEntregaFim} onChange={e => setFilter('dataEntregaFim', e.target.value)} />
              </div>
              <div><Label className="text-xs">Conta / Clube</Label>
                <Input className="h-9 text-sm" placeholder="Buscar..." value={filters.conta} onChange={e => setFilter('conta', e.target.value)} />
              </div>
              <div><Label className="text-xs">Status</Label>
                <select value={filters.status} onChange={e => setFilter('status', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm">
                  <option value="">Todos</option>
                  <option value="PENDING">Pendente</option>
                  <option value="DELIVERED">Entregue</option>
                  <option value="SOLD">Vendido</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>
              <div><Label className="text-xs">Pts Recebidos</Label>
                <select value={filters.ptsRecebidos} onChange={e => setFilter('ptsRecebidos', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm">
                  <option value="">Todos</option>
                  <option value="sim">Recebidos</option>
                  <option value="nao">Não recebidos</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editando ? 'Editar Compra' : 'Nova Compra'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={salvar} className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div className="col-span-2">
                <Label>Produto *</Label>
                <select value={form.productId} onChange={e => handleChange('productId', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" required>
                  <option value="">Selecione o produto...</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>{p.name} {p.model} {p.storage} {p.color}</option>
                  ))}
                </select>
              </div>
              <div><Label>Quantidade</Label>
                <Input type="number" min="1" value={form.quantity} onChange={e => handleChange('quantity', e.target.value)} />
              </div>
              <div><Label>Data Compra *</Label>
                <Input type="date" value={form.purchaseDate} onChange={e => handleChange('purchaseDate', e.target.value)} required />
              </div>
              <div><Label>Nº Pedido</Label>
                <Input value={form.orderNumber} onChange={e => handleChange('orderNumber', e.target.value)} placeholder="ex: 460235660" />
              </div>
              <div><Label>Conta *</Label>
                <Input value={form.account} onChange={e => handleChange('account', e.target.value)} placeholder="ex: Miri" required />
              </div>
              <div><Label>Clube/Loja *</Label>
                <Input value={form.clubAndStore} onChange={e => handleChange('clubAndStore', e.target.value)} placeholder="ex: CB/Azul" required />
              </div>
              <div><Label>Pontos x1,00</Label>
                <Input type="number" step="0.01" value={form.pointsPerReal} onChange={e => handleChange('pointsPerReal', e.target.value)} placeholder="ex: 14" />
              </div>
              <div><Label>Valor Unitário (R$) *</Label>
                <Input type="number" step="0.01" value={form.paidValue} onChange={e => handleChange('paidValue', e.target.value)} placeholder="0,00" required />
                {qty() > 1 && <p className="text-xs text-blue-500 mt-1 font-medium">Total: R$ {fmtBRL(getPagoTotal())}</p>}
              </div>
              <div><Label>Frete Total (R$)</Label>
                <Input type="number" step="0.01" value={form.shipping} onChange={e => handleChange('shipping', e.target.value)} />
              </div>
              <div><Label>Milheiro (R$/1000pts)</Label>
                <Input type="number" step="0.01" value={form.thousand} onChange={e => handleChange('thousand', e.target.value)} placeholder="ex: 14" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Desc. Antecipado</Label><ToggleBtn field="advanceDiscountType" />
                </div>
                <Input type="number" step="0.01" value={form.advanceDiscount} onChange={e => handleChange('advanceDiscount', e.target.value)} />
                {form.advanceDiscount && <p className="text-xs text-gray-400 mt-1">= R$ {fmtBRL(getDescValor())}</p>}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Cashback</Label><ToggleBtn field="cashbackType" />
                </div>
                <Input type="number" step="0.01" value={form.cashback} onChange={e => handleChange('cashback', e.target.value)} />
                {form.cashback && <p className="text-xs text-gray-400 mt-1">= R$ {fmtBRL(getCashbackValor())}</p>}
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <Label>Pontos</Label>
                <p className="text-xl font-bold text-gray-700 mt-1">{fmtPts(getPontosTotal())}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <Label>Cashback Total</Label>
                <p className="text-xl font-bold text-green-700 mt-1">R$ {fmtBRL(getCashbackTotal())}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <Label>Custo Final</Label>
                <p className="text-2xl font-bold text-blue-700 mt-1">R$ {fmtBRL(getCustoTotal())}</p>
                {qty() > 1 && <p className="text-sm font-semibold text-blue-600 mt-1">Unit.: R$ {fmtBRL(getCustoUnitario())}</p>}
              </div>
              <div className="col-span-2 md:col-span-3 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditando(null) }}>Cancelar</Button>
                <Button type="submit" disabled={salvando}>
                  {salvando ? 'Salvando...' : editando ? 'Salvar' : qty() > 1 ? `Salvar ${qty()} unidades` : 'Salvar Compra'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Modal visualizar anexo */}
      {anexoModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setAnexoModal(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full p-4 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Anexo da Compra</h3>
              <button onClick={() => setAnexoModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            {anexoModal.attachmentUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(anexoModal.attachmentUrl) ? (
              <img src={anexoModal.attachmentUrl} alt="Anexo" className="w-full rounded-lg object-contain max-h-[60vh]" />
            ) : (
              <a href={anexoModal.attachmentUrl} target="_blank" rel="noopener noreferrer"
                className="block text-center py-8 text-blue-600 hover:underline text-lg">
                📎 Abrir arquivo
              </a>
            )}
            <div className="flex gap-2 justify-end">
              <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                {uploadingId === anexoModal.id ? 'Enviando...' : '🔄 Trocar arquivo'}
                <input type="file" className="hidden" accept="image/*,.pdf"
                  onChange={e => { const f = e.target.files?.[0]; if (f) { handleAnexo(anexoModal.id, f); setAnexoModal(null) } }} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>
              Compras Registradas ({comprasFiltradas.length}
              {filtrosAtivos && comprasFiltradas.length !== compras.length && ` de ${compras.length}`})
            </CardTitle>
            {comprasFiltradas.length > 0 && (
              <div className="flex gap-4 text-sm">
                <span className="text-gray-500">Vl. pago: <strong>R$ {fmtBRL(totalFiltrado.pago)}</strong></span>
                <span className="text-blue-600">Custo: <strong>R$ {fmtBRL(totalFiltrado.custo)}</strong></span>
                <span className="text-gray-500">Pts: <strong>{fmtPts(totalFiltrado.pontos)}</strong></span>
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
                    <th className="px-3 py-3">Data Compra</th>
                    <th className="px-3 py-3">Entrega</th>
                    <th className="px-3 py-3">Conta / Clube</th>
                    <th className="px-3 py-3 text-right">Vl. Unit.</th>
                    <th className="px-3 py-3 text-right">Custo Unit.</th>
                    <th className="px-3 py-3 text-center">Pts Unit.</th>
                    <th className="px-3 py-3 text-center">Pts Rec.</th>
                    <th className="px-3 py-3 text-center">Anexo</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-3 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {comprasFiltradas.length === 0 ? (
                    <tr><td colSpan={11} className="text-center py-8 text-gray-400">
                      {filtrosAtivos ? 'Nenhuma compra encontrada com esses filtros' : 'Nenhuma compra registrada'}
                    </td></tr>
                  ) : comprasFiltradas.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 font-medium">
                        <span>{[c.product?.name, c.product?.model, c.product?.storage, c.product?.color].filter(Boolean).join(' ')}</span>
                        {c.orderNumber && <span className="block text-xs text-gray-400">Pedido: {c.orderNumber}</span>}
                      </td>
                      <td className="px-3 py-3">{new Date(c.purchaseDate).toLocaleDateString('pt-BR')}</td>
                      <td className="px-3 py-3">
                        <input type="date" defaultValue={c.deliveryDate?.split('T')[0] ?? ''}
                          onBlur={e => { if (e.target.value) patch(c.id, { deliveryDate: e.target.value, status: 'DELIVERED' }) }}
                          className="border rounded px-2 py-1 text-xs w-32" />
                      </td>
                      <td className="px-3 py-3">
                        <span className="block">{c.account}</span>
                        <span className="text-gray-400 text-xs">{c.clubAndStore}</span>
                      </td>
                      <td className="px-3 py-3 text-right">R$ {fmtBRL(c.paidValue)}</td>
                      <td className="px-3 py-3 text-right font-semibold text-blue-700">R$ {fmtBRL(c.finalCost)}</td>
                      <td className="px-3 py-3 text-center">{fmtPts(c.points ?? 0)}</td>
                      <td className="px-3 py-3 text-center">
                        <input type="checkbox" checked={!!c.pointsReceived}
                          onChange={() => patch(c.id, { pointsReceived: !c.pointsReceived })}
                          className="w-4 h-4 cursor-pointer accent-blue-600" />
                      </td>
                      <td className="px-3 py-3 text-center">
                        {c.attachmentUrl ? (
                          <button onClick={() => setAnexoModal(c)}
                            className="text-blue-600 hover:text-blue-800 text-lg" title="Ver anexo">📎</button>
                        ) : (
                          <label className="cursor-pointer text-gray-300 hover:text-gray-500 text-lg" title="Anexar print">
                            {uploadingId === c.id ? '⏳' : '📎'}
                            <input type="file" className="hidden" accept="image/*,.pdf"
                              onChange={e => { const f = e.target.files?.[0]; if (f) handleAnexo(c.id, f) }} />
                          </label>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <select value={c.status} onChange={e => patch(c.id, { status: e.target.value })}
                          className={`rounded-full px-2 py-1 text-xs font-medium border-0 cursor-pointer ${statusColor[c.status] ?? 'bg-gray-100'}`}>
                          <option value="PENDING">Pendente</option>
                          <option value="DELIVERED">Entregue</option>
                          <option value="SOLD">Vendido</option>
                          <option value="CANCELLED">Cancelado</option>
                        </select>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => abrirEditar(c)} className="text-blue-600 hover:underline text-xs">Editar</button>
                          <button onClick={() => excluir(c.id)} className="text-red-500 hover:underline text-xs">Excluir</button>
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
