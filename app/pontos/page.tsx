'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Compra {
  id: string
  productId: string
  product: { id: string; name: string; model: string; storage: string; color: string }
  purchaseDate: string
  account: string
  clubAndStore: string
  points: number
  pointsPerReal: number
  pointsReceived: boolean
  paidValue: number
  finalCost: number
  status: string
}

const emptyFilters = {
  produto: '',
  conta: '',
  loja: '',
  status: 'all', // 'all' | 'received' | 'pending'
  dataInicio: '',
  dataFim: '',
}

export default function PontosPage() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(emptyFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const fetchCompras = async () => {
    setLoading(true)
    const res = await fetch('/api/purchases')
    const data = await res.json()
    // Apenas compras que têm pontos (points > 0)
    const comPontos = (Array.isArray(data) ? data : []).filter((c: Compra) => c.points > 0)
    setCompras(comPontos)
    setLoading(false)
  }

  useEffect(() => { fetchCompras() }, [])

  const handleToggle = async (purchaseId: string, current: boolean) => {
    setToggling(purchaseId)
    try {
      const res = await fetch('/api/purchases/points', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId, pointsReceived: !current }),
      })
      if (res.ok) {
        setCompras(prev =>
          prev.map(c => c.id === purchaseId ? { ...c, pointsReceived: !current } : c)
        )
      }
    } finally {
      setToggling(null)
    }
  }

  const filtradas = useMemo(() => {
    return compras.filter(c => {
      const nomeProd = [c.product?.name, c.product?.model, c.product?.storage, c.product?.color]
        .filter(Boolean).join(' ').toLowerCase()
      if (filters.produto && !nomeProd.includes(filters.produto.toLowerCase())) return false
      if (filters.conta && !c.account.toLowerCase().includes(filters.conta.toLowerCase())) return false
      if (filters.loja && !c.clubAndStore.toLowerCase().includes(filters.loja.toLowerCase())) return false
      if (filters.status === 'received' && !c.pointsReceived) return false
      if (filters.status === 'pending' && c.pointsReceived) return false
      if (filters.dataInicio && new Date(c.purchaseDate) < new Date(filters.dataInicio)) return false
      if (filters.dataFim && new Date(c.purchaseDate) > new Date(filters.dataFim)) return false
      return true
    })
  }, [compras, filters])

  const recebidas = useMemo(() => filtradas.filter(c => c.pointsReceived), [filtradas])
  const aReceber  = useMemo(() => filtradas.filter(c => !c.pointsReceived), [filtradas])

  const totalAReceber  = useMemo(() => aReceber.reduce((s, c) => s + c.points, 0), [aReceber])
  const totalRecebidos = useMemo(() => recebidas.reduce((s, c) => s + c.points, 0), [recebidas])
  const totalGeral     = useMemo(() => filtradas.reduce((s, c) => s + c.points, 0), [filtradas])

  const filtrosAtivos = Object.entries(filters).some(([k, v]) => k === 'status' ? v !== 'all' : v !== '')
  const setFilter = (f: string, v: string) => setFilters(p => ({ ...p, [f]: v }))
  const fmtPts = (v: number) => v.toLocaleString('pt-BR')
  const nomeProduto = (p: Compra['product']) =>
    [p?.name, p?.model, p?.storage, p?.color].filter(Boolean).join(' ')

  const TabelaPontos = ({
    lista, titulo, cor, emptyMsg
  }: {
    lista: Compra[]
    titulo: string
    cor: 'yellow' | 'green'
    emptyMsg: string
  }) => {
    const total = lista.reduce((s, c) => s + c.points, 0)
    const headerBg = cor === 'yellow' ? 'bg-yellow-50' : 'bg-green-50'
    const dotBg    = cor === 'yellow' ? 'bg-yellow-400' : 'bg-green-500'
    const numColor = cor === 'yellow' ? 'text-yellow-600' : 'text-green-600'
    const hoverBg  = cor === 'yellow' ? 'hover:bg-yellow-50' : 'hover:bg-green-50'

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${dotBg} inline-block`} />
            {titulo}
            <span className="text-gray-400 font-normal text-sm">
              ({lista.length} compra{lista.length !== 1 ? 's' : ''} · {fmtPts(total)} pts)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`${headerBg} text-left`}>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Conta</th>
                  <th className="px-4 py-3">Loja / Clube</th>
                  <th className="px-4 py-3 text-center">Data Compra</th>
                  <th className="px-4 py-3 text-right">Pts/Real</th>
                  <th className="px-4 py-3 text-right font-semibold">Pontos</th>
                  <th className="px-4 py-3 text-center">Recebido</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {lista.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">{emptyMsg}</td>
                  </tr>
                ) : lista.map(c => (
                  <tr key={c.id} className={`${hoverBg} transition-colors`}>
                    <td className="px-4 py-3 font-medium">{nomeProduto(c.product)}</td>
                    <td className="px-4 py-3 text-gray-600">{c.account}</td>
                    <td className="px-4 py-3 text-gray-600">{c.clubAndStore}</td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {new Date(c.purchaseDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{c.pointsPerReal}</td>
                    <td className={`px-4 py-3 text-right font-bold text-lg ${numColor}`}>
                      {fmtPts(c.points)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(c.id, c.pointsReceived)}
                        disabled={toggling === c.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
                          ${c.pointsReceived ? 'bg-green-500' : 'bg-gray-300'}
                          ${toggling === c.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                          ${c.pointsReceived ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pontos</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors
            ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}
        >
          🔍 Filtros {filtrosAtivos && (
            <span className="ml-1 bg-blue-600 text-white rounded-full px-1.5 text-xs">!</span>
          )}
        </button>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">A Receber</p>
            <p className="text-3xl font-bold text-yellow-600">{fmtPts(totalAReceber)}</p>
            <p className="text-xs text-gray-400">{aReceber.length} compra{aReceber.length !== 1 ? 's' : ''} pendente{aReceber.length !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Recebidos</p>
            <p className="text-3xl font-bold text-green-600">{fmtPts(totalRecebidos)}</p>
            <p className="text-xs text-gray-400">{recebidas.length} compra{recebidas.length !== 1 ? 's' : ''} confirmada{recebidas.length !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Geral</p>
            <p className="text-3xl font-bold text-blue-600">{fmtPts(totalGeral)}</p>
            <p className="text-xs text-gray-400">{filtradas.length} compra{filtradas.length !== 1 ? 's' : ''} com pontos</p>
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
                <button onClick={() => setFilters(emptyFilters)} className="text-xs text-red-500 hover:underline">
                  Limpar tudo
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Produto</Label>
                <Input className="h-9 text-sm" placeholder="iPhone 15..." value={filters.produto}
                  onChange={e => setFilter('produto', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Conta</Label>
                <Input className="h-9 text-sm" placeholder="Nubank..." value={filters.conta}
                  onChange={e => setFilter('conta', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Loja / Clube</Label>
                <Input className="h-9 text-sm" placeholder="Magalu..." value={filters.loja}
                  onChange={e => setFilter('loja', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <select
                  value={filters.status}
                  onChange={e => setFilter('status', e.target.value)}
                  className="w-full h-9 text-sm border border-gray-300 rounded-md px-2 bg-white"
                >
                  <option value="all">Todos</option>
                  <option value="pending">A Receber</option>
                  <option value="received">Recebidos</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Data Compra — De</Label>
                <Input type="date" className="h-9 text-sm" value={filters.dataInicio}
                  onChange={e => setFilter('dataInicio', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Data Compra — Até</Label>
                <Input type="date" className="h-9 text-sm" value={filters.dataFim}
                  onChange={e => setFilter('dataFim', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card><CardContent className="py-16 text-center text-gray-400">Carregando pontos...</CardContent></Card>
      ) : (
        <>
          <TabelaPontos
            lista={aReceber}
            titulo="A Receber"
            cor="yellow"
            emptyMsg={filtrosAtivos ? 'Nenhuma compra encontrada' : 'Nenhum ponto pendente 🎉'}
          />
          <TabelaPontos
            lista={recebidas}
            titulo="Recebidos"
            cor="green"
            emptyMsg={filtrosAtivos ? 'Nenhuma compra encontrada' : 'Nenhum ponto recebido ainda'}
          />
        </>
      )}
    </div>
  )
}
