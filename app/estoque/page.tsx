'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CompraEntregue {
  id: string
  productId: string
  product: { id: string; name: string; model: string; storage: string; color: string }
  finalCost: number
  deliveryDate?: string
  purchaseDate: string
  account: string
  orderNumber?: string
  status: string
}

// Tipo unificado para grupos de produtos (estoque e pendentes)
interface GrupoProduto {
  produto: CompraEntregue['product']
  productId: string
  itens: CompraEntregue[]
  custoMedio: number
  diasMedio: number       // só usado em estoque
  dataRef: string         // dataEntradaMaisAntiga ou dataMaisAntiga
}

const emptyFilters = { produto: '', dataEntradaInicio: '', dataEntradaFim: '' }

export default function EstoquePage() {
  const [entregues, setEntregues] = useState<CompraEntregue[]>([])
  const [pendentes, setPendentes] = useState<CompraEntregue[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(emptyFilters)
  const [showFilters, setShowFilters] = useState(false)

  const fetch_ = async () => {
    setLoading(true)
    const [entreguesRes, pendentesRes] = await Promise.all([
      fetch('/api/purchases?status=DELIVERED').then(r => r.json()),
      fetch('/api/purchases?status=PENDING').then(r => r.json()),
    ])
    setEntregues(Array.isArray(entreguesRes) ? entreguesRes : [])
    setPendentes(Array.isArray(pendentesRes) ? pendentesRes : [])
    setLoading(false)
  }

  useEffect(() => { fetch_() }, [])

  const hoje = new Date()

  const agrupar = (lista: CompraEntregue[], usarDelivery: boolean): GrupoProduto[] => {
    const grupos: Record<string, GrupoProduto> = {}

    lista.forEach(c => {
      const dtBase = usarDelivery
        ? (c.deliveryDate ?? c.purchaseDate)
        : c.purchaseDate

      if (!grupos[c.productId]) {
        grupos[c.productId] = {
          produto: c.product, productId: c.productId,
          itens: [], custoMedio: 0, diasMedio: 0, dataRef: dtBase,
        }
      }
      grupos[c.productId].itens.push(c)
      if (new Date(dtBase) < new Date(grupos[c.productId].dataRef)) {
        grupos[c.productId].dataRef = dtBase
      }
    })

    Object.values(grupos).forEach(g => {
      g.custoMedio = g.itens.reduce((s, i) => s + i.finalCost, 0) / g.itens.length
      if (usarDelivery) {
        const diasTotal = g.itens.reduce((s, i) => {
          const dt = new Date(i.deliveryDate ?? i.purchaseDate)
          return s + Math.floor((hoje.getTime() - dt.getTime()) / 86400000)
        }, 0)
        g.diasMedio = Math.round(diasTotal / g.itens.length)
      }
    })

    return Object.values(grupos)
  }

  const gruposEstoque = useMemo(() => agrupar(entregues, true), [entregues])
  const gruposPendentes = useMemo(() => agrupar(pendentes, false), [pendentes])

  const aplicarFiltro = (grupos: GrupoProduto[]) =>
    grupos.filter(g => {
      const nome = [g.produto?.name, g.produto?.model, g.produto?.storage, g.produto?.color]
        .filter(Boolean).join(' ').toLowerCase()
      if (filters.produto && !nome.includes(filters.produto.toLowerCase())) return false
      if (filters.dataEntradaInicio && new Date(g.dataRef) < new Date(filters.dataEntradaInicio)) return false
      if (filters.dataEntradaFim && new Date(g.dataRef) > new Date(filters.dataEntradaFim)) return false
      return true
    })

  const estoquesFiltrados = useMemo(() => aplicarFiltro(gruposEstoque), [gruposEstoque, filters])
  const pendentesFiltrados = useMemo(() => aplicarFiltro(gruposPendentes), [gruposPendentes, filters])

  const totalEstoque = useMemo(() => ({
    qtd: estoquesFiltrados.reduce((s, g) => s + g.itens.length, 0),
    custo: estoquesFiltrados.reduce((s, g) => s + g.itens.reduce((ss, i) => ss + i.finalCost, 0), 0),
  }), [estoquesFiltrados])

  const totalPendente = useMemo(() => ({
    qtd: pendentesFiltrados.reduce((s, g) => s + g.itens.length, 0),
    custo: pendentesFiltrados.reduce((s, g) => s + g.itens.reduce((ss, i) => ss + i.finalCost, 0), 0),
  }), [pendentesFiltrados])

  const filtrosAtivos = Object.values(filters).some(v => v !== '')
  const setFilter = (f: string, v: string) => setFilters(p => ({ ...p, [f]: v }))
  const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  const diasColor = (d: number) => d <= 15 ? 'text-green-600' : d <= 30 ? 'text-yellow-600' : 'text-red-600'

  const nomeProduto = (p: GrupoProduto['produto']) =>
    [p?.name, p?.model, p?.storage, p?.color].filter(Boolean).join(' ')

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Estoque</h1>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors
            ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}>
          🔍 Filtros {filtrosAtivos && <span className="ml-1 bg-blue-600 text-white rounded-full px-1.5 text-xs">!</span>}
        </button>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Em Estoque</p>
            <p className="text-3xl font-bold text-blue-600">{totalEstoque.qtd}</p>
            <p className="text-xs text-gray-400">unidades disponíveis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Custo Total Estoque</p>
            <p className="text-2xl font-bold text-red-600">R$ {fmtBRL(totalEstoque.custo)}</p>
            <p className="text-xs text-gray-400">investido</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">A Caminho</p>
            <p className="text-3xl font-bold text-yellow-600">{totalPendente.qtd}</p>
            <p className="text-xs text-gray-400">unidades pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Custo A Caminho</p>
            <p className="text-2xl font-bold text-yellow-600">R$ {fmtBRL(totalPendente.custo)}</p>
            <p className="text-xs text-gray-400">a receber</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Filtros</CardTitle>
              {filtrosAtivos && (
                <button onClick={() => setFilters(emptyFilters)} className="text-xs text-red-500 hover:underline">Limpar</button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <div>
                <Label className="text-xs">Produto</Label>
                <Input className="h-9 text-sm" placeholder="Buscar produto..." value={filters.produto}
                  onChange={e => setFilter('produto', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Data Entrada — De</Label>
                <Input type="date" className="h-9 text-sm" value={filters.dataEntradaInicio}
                  onChange={e => setFilter('dataEntradaInicio', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Data Entrada — Até</Label>
                <Input type="date" className="h-9 text-sm" value={filters.dataEntradaFim}
                  onChange={e => setFilter('dataEntradaFim', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela — Em Estoque */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            Em Estoque — {estoquesFiltrados.length} produto{estoquesFiltrados.length !== 1 ? 's' : ''}
            <span className="text-gray-400 font-normal text-sm">({totalEstoque.qtd} unidades)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-center text-gray-400 py-8">Carregando...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3">Produto</th>
                    <th className="px-4 py-3 text-center">Qtd</th>
                    <th className="px-4 py-3 text-right">Custo Médio</th>
                    <th className="px-4 py-3 text-right">Custo Total</th>
                    <th className="px-4 py-3 text-center">Dias em Estoque</th>
                    <th className="px-4 py-3">Entrada mais Antiga</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {estoquesFiltrados.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-400">
                      {filtrosAtivos ? 'Nenhum produto encontrado' : 'Nenhum item em estoque'}
                    </td></tr>
                  ) : estoquesFiltrados.map(g => (
                    <tr key={g.productId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{nomeProduto(g.produto)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-2xl font-bold text-blue-600">{g.itens.length}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">R$ {fmtBRL(g.custoMedio)}</td>
                      <td className="px-4 py-3 text-right">R$ {fmtBRL(g.itens.reduce((s, i) => s + i.finalCost, 0))}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold text-lg ${diasColor(g.diasMedio)}`}>{g.diasMedio}</span>
                        <span className="text-xs text-gray-400 ml-1">dias</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(g.dataRef).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela — A Caminho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
            A Caminho — {pendentesFiltrados.length} produto{pendentesFiltrados.length !== 1 ? 's' : ''}
            <span className="text-gray-400 font-normal text-sm">({totalPendente.qtd} unidades)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-center text-gray-400 py-8">Carregando...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-yellow-50 text-left">
                    <th className="px-4 py-3">Produto</th>
                    <th className="px-4 py-3 text-center">Qtd</th>
                    <th className="px-4 py-3 text-right">Custo Médio</th>
                    <th className="px-4 py-3 text-right">Custo Total</th>
                    <th className="px-4 py-3">Compra mais Antiga</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pendentesFiltrados.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-400">
                      {filtrosAtivos ? 'Nenhum produto encontrado' : 'Nenhum item a caminho'}
                    </td></tr>
                  ) : pendentesFiltrados.map(g => (
                    <tr key={g.productId} className="hover:bg-yellow-50">
                      <td className="px-4 py-3 font-medium">{nomeProduto(g.produto)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-2xl font-bold text-yellow-600">{g.itens.length}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">R$ {fmtBRL(g.custoMedio)}</td>
                      <td className="px-4 py-3 text-right">R$ {fmtBRL(g.itens.reduce((s, i) => s + i.finalCost, 0))}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(g.dataRef).toLocaleDateString('pt-BR')}
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
