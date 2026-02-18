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
  saleDate?: string
  finalCost: number
  soldValue?: number
  profit?: number
  points: number
  pointsReceived: boolean
  account: string
  clubAndStore: string
  status: string
  month?: string
  customer?: string
}

const anoAtual = new Date().getFullYear()
const mesAtual = String(new Date().getMonth() + 1).padStart(2, '0')

const presets = [
  { label: 'Este mês',       dataInicio: `${anoAtual}-${mesAtual}-01`, dataFim: `${anoAtual}-${mesAtual}-31` },
  { label: 'Últimos 3 meses',dataInicio: (() => { const d = new Date(); d.setMonth(d.getMonth()-3); return d.toISOString().slice(0,10) })(), dataFim: `${anoAtual}-${mesAtual}-31` },
  { label: 'Este ano',       dataInicio: `${anoAtual}-01-01`, dataFim: `${anoAtual}-12-31` },
  { label: 'Tudo',           dataInicio: '', dataFim: '' },
]

export default function RelatoriosPage() {
  const [data, setData] = useState<{ compras: Compra[]; vendas: Compra[] }>({ compras: [], vendas: [] })
  const [loading, setLoading] = useState(true)
  const [dataInicio, setDataInicio] = useState(`${anoAtual}-01-01`)
  const [dataFim, setDataFim]       = useState(`${anoAtual}-12-31`)
  const [presetAtivo, setPresetAtivo] = useState('Este ano')
  const [abaAtiva, setAbaAtiva] = useState<'resumo'|'produtos'|'contas'|'mensal'|'clientes'>('resumo')

  const fetchData = async (ini: string, fim: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (ini) params.set('dataInicio', ini)
    if (fim) params.set('dataFim', fim)
    const res = await fetch(`/api/relatorios?${params}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  useEffect(() => { fetchData(dataInicio, dataFim) }, [])

  const aplicarPreset = (p: typeof presets[0]) => {
    setPresetAtivo(p.label)
    setDataInicio(p.dataInicio)
    setDataFim(p.dataFim)
    fetchData(p.dataInicio, p.dataFim)
  }

  const aplicarDatas = () => {
    setPresetAtivo('')
    fetchData(dataInicio, dataFim)
  }

  const { compras, vendas } = data

  // ── KPIs gerais ──
  const kpis = useMemo(() => {
    const totalInvestido   = compras.reduce((s, c) => s + c.finalCost, 0)
    const totalVendido     = vendas.reduce((s, c) => s + (c.soldValue ?? 0), 0)
    const totalLucro       = vendas.reduce((s, c) => s + (c.profit ?? 0), 0)
    const totalPontos      = compras.reduce((s, c) => s + c.points, 0)
    const pontosRecebidos  = compras.filter(c => c.pointsReceived).reduce((s, c) => s + c.points, 0)
    const ticketMedio      = vendas.length ? totalVendido / vendas.length : 0
    const margemMedia      = totalVendido ? (totalLucro / totalVendido) * 100 : 0
    const emEstoque        = compras.filter(c => c.status === 'DELIVERED').length
    const pendentes        = compras.filter(c => c.status === 'PENDING').length
    const giroMedio        = vendas.length && compras.length
      ? (() => {
          const diasList = vendas.map(v => {
            const dc = new Date(v.purchaseDate)
            const dv = new Date(v.saleDate!)
            return Math.max(0, Math.floor((dv.getTime() - dc.getTime()) / 86400000))
          })
          return Math.round(diasList.reduce((a, b) => a + b, 0) / diasList.length)
        })()
      : 0
    return { totalInvestido, totalVendido, totalLucro, totalPontos, pontosRecebidos,
             ticketMedio, margemMedia, emEstoque, pendentes, giroMedio,
             qtdCompras: compras.length, qtdVendas: vendas.length }
  }, [compras, vendas])

  // ── Por produto ──
  const porProduto = useMemo(() => {
    const mapa: Record<string, {
      nome: string; qtdComprada: number; qtdVendida: number;
      totalInvestido: number; totalLucro: number; totalVendido: number; margemMedia: number
    }> = {}
    compras.forEach(c => {
      const k = c.productId
      const nome = [c.product?.name, c.product?.model, c.product?.storage, c.product?.color].filter(Boolean).join(' ')
      if (!mapa[k]) mapa[k] = { nome, qtdComprada: 0, qtdVendida: 0, totalInvestido: 0, totalLucro: 0, totalVendido: 0, margemMedia: 0 }
      mapa[k].qtdComprada++
      mapa[k].totalInvestido += c.finalCost
    })
    vendas.forEach(c => {
      const k = c.productId
      if (!mapa[k]) return
      mapa[k].qtdVendida++
      mapa[k].totalLucro   += c.profit ?? 0
      mapa[k].totalVendido += c.soldValue ?? 0
    })
    Object.values(mapa).forEach(p => {
      p.margemMedia = p.totalVendido ? (p.totalLucro / p.totalVendido) * 100 : 0
    })
    return Object.values(mapa).sort((a, b) => b.qtdVendida - a.qtdVendida)
  }, [compras, vendas])

  // ── Por conta ──
  const porConta = useMemo(() => {
    const mapa: Record<string, { conta: string; qtdCompras: number; totalInvestido: number; totalPontos: number }> = {}
    compras.forEach(c => {
      if (!mapa[c.account]) mapa[c.account] = { conta: c.account, qtdCompras: 0, totalInvestido: 0, totalPontos: 0 }
      mapa[c.account].qtdCompras++
      mapa[c.account].totalInvestido += c.finalCost
      mapa[c.account].totalPontos    += c.points
    })
    return Object.values(mapa).sort((a, b) => b.totalInvestido - a.totalInvestido)
  }, [compras])

  // ── Por mês ──
  const porMes = useMemo(() => {
    const mapa: Record<string, { mes: string; qtdVendas: number; totalVendido: number; totalLucro: number }> = {}
    vendas.forEach(c => {
      const mes = c.month ?? new Date(c.saleDate!).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).toUpperCase().replace('.','')
      if (!mapa[mes]) mapa[mes] = { mes, qtdVendas: 0, totalVendido: 0, totalLucro: 0 }
      mapa[mes].qtdVendas++
      mapa[mes].totalVendido += c.soldValue ?? 0
      mapa[mes].totalLucro   += c.profit ?? 0
    })
    return Object.values(mapa)
  }, [vendas])

  // ── Por cliente ──
  const porCliente = useMemo(() => {
    const mapa: Record<string, { cliente: string; qtd: number; totalVendido: number; totalLucro: number }> = {}
    vendas.forEach(c => {
      const cli = c.customer || 'Não informado'
      if (!mapa[cli]) mapa[cli] = { cliente: cli, qtd: 0, totalVendido: 0, totalLucro: 0 }
      mapa[cli].qtd++
      mapa[cli].totalVendido += c.soldValue ?? 0
      mapa[cli].totalLucro   += c.profit ?? 0
    })
    return Object.values(mapa).sort((a, b) => b.qtd - a.qtd)
  }, [vendas])

  const fmtBRL = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  const fmtPct = (v: number) => `${v.toFixed(1)}%`

  const abas: { key: typeof abaAtiva; label: string }[] = [
    { key: 'resumo',   label: '📊 Resumo'   },
    { key: 'produtos', label: '📦 Produtos'  },
    { key: 'mensal',   label: '📅 Mensal'    },
    { key: 'contas',   label: '💳 Contas'    },
    { key: 'clientes', label: '👤 Clientes'  },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Relatórios</h1>

      {/* Filtro de período */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label className="text-xs">De</Label>
              <Input type="date" className="h-9 text-sm w-40" value={dataInicio}
                onChange={e => setDataInicio(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Até</Label>
              <Input type="date" className="h-9 text-sm w-40" value={dataFim}
                onChange={e => setDataFim(e.target.value)} />
            </div>
            <button onClick={aplicarDatas}
              className="h-9 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
              Aplicar
            </button>
            <div className="flex gap-2 flex-wrap">
              {presets.map(p => (
                <button key={p.label} onClick={() => aplicarPreset(p)}
                  className={`h-9 px-3 rounded-md text-sm border font-medium transition-colors
                    ${presetAtivo === p.label
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abas */}
      <div className="flex gap-1 border-b overflow-x-auto scrollbar-hide -mx-2 px-2">
        {abas.map(a => (
          <button key={a.key} onClick={() => setAbaAtiva(a.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors -mb-px
              ${abaAtiva === a.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {a.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Card><CardContent className="py-16 text-center text-gray-400">Carregando relatório...</CardContent></Card>
      ) : (
        <>
          {/* ── ABA RESUMO ── */}
          {abaAtiva === 'resumo' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card><CardContent className="p-4">
                  <p className="text-xs text-gray-500">Compras</p>
                  <p className="text-3xl font-bold text-blue-600">{kpis.qtdCompras}</p>
                  <p className="text-xs text-gray-400">unidades compradas</p>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                  <p className="text-xs text-gray-500">Vendas</p>
                  <p className="text-3xl font-bold text-green-600">{kpis.qtdVendas}</p>
                  <p className="text-xs text-gray-400">unidades vendidas</p>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                  <p className="text-xs text-gray-500">Em Estoque</p>
                  <p className="text-3xl font-bold text-blue-500">{kpis.emEstoque}</p>
                  <p className="text-xs text-gray-400">disponíveis</p>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                  <p className="text-xs text-gray-500">A Caminho</p>
                  <p className="text-3xl font-bold text-yellow-500">{kpis.pendentes}</p>
                  <p className="text-xs text-gray-400">pendentes</p>
                </CardContent></Card>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card><CardContent className="p-4">
                  <p className="text-xs text-gray-500">Total Investido</p>
                  <p className="text-xl font-bold text-red-600">{fmtBRL(kpis.totalInvestido)}</p>
                  <p className="text-xs text-gray-400">em compras</p>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                  <p className="text-xs text-gray-500">Total Vendido</p>
                  <p className="text-xl font-bold text-green-600">{fmtBRL(kpis.totalVendido)}</p>
                  <p className="text-xs text-gray-400">em vendas</p>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                  <p className="text-xs text-gray-500">Lucro Total</p>
                  <p className={`text-xl font-bold ${kpis.totalLucro >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {fmtBRL(kpis.totalLucro)}
                  </p>
                  <p className="text-xs text-gray-400">margem {fmtPct(kpis.margemMedia)}</p>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                  <p className="text-xs text-gray-500">Ticket Médio</p>
                  <p className="text-xl font-bold text-blue-600">{fmtBRL(kpis.ticketMedio)}</p>
                  <p className="text-xs text-gray-400">por venda</p>
                </CardContent></Card>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card><CardContent className="p-4">
                  <p className="text-xs text-gray-500">Giro Médio</p>
                  <p className="text-2xl font-bold text-purple-600">{kpis.giroMedio} dias</p>
                  <p className="text-xs text-gray-400">entre compra e venda</p>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                  <p className="text-xs text-gray-500">Pontos Gerados</p>
                  <p className="text-2xl font-bold text-yellow-600">{kpis.totalPontos.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-gray-400">em compras</p>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                  <p className="text-xs text-gray-500">Pontos Recebidos</p>
                  <p className="text-2xl font-bold text-green-600">{kpis.pontosRecebidos.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-gray-400">
                    {kpis.totalPontos ? fmtPct((kpis.pontosRecebidos / kpis.totalPontos) * 100) : '0%'} do total
                  </p>
                </CardContent></Card>
              </div>
            </div>
          )}

          {/* ── ABA PRODUTOS ── */}
          {abaAtiva === 'produtos' && (
            <Card>
              <CardHeader>
                <CardTitle>Produtos — Desempenho por Item</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-4 py-3">Produto</th>
                        <th className="px-4 py-3 text-center">Comprado</th>
                        <th className="px-4 py-3 text-center">Vendido</th>
                        <th className="px-4 py-3 text-center">Em Estoque</th>
                        <th className="px-4 py-3 text-right">Total Investido</th>
                        <th className="px-4 py-3 text-right">Total Vendido</th>
                        <th className="px-4 py-3 text-right">Lucro</th>
                        <th className="px-4 py-3 text-right">Margem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {porProduto.length === 0 ? (
                        <tr><td colSpan={8} className="text-center py-8 text-gray-400">Nenhum dado</td></tr>
                      ) : porProduto.map((p, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{p.nome}</td>
                          <td className="px-4 py-3 text-center">{p.qtdComprada}</td>
                          <td className="px-4 py-3 text-center font-bold text-green-600">{p.qtdVendida}</td>
                          <td className="px-4 py-3 text-center text-blue-600">{p.qtdComprada - p.qtdVendida}</td>
                          <td className="px-4 py-3 text-right">{fmtBRL(p.totalInvestido)}</td>
                          <td className="px-4 py-3 text-right">{fmtBRL(p.totalVendido)}</td>
                          <td className={`px-4 py-3 text-right font-semibold ${p.totalLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {fmtBRL(p.totalLucro)}
                          </td>
                          <td className={`px-4 py-3 text-right ${p.margemMedia >= 10 ? 'text-green-600' : p.margemMedia >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {fmtPct(p.margemMedia)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── ABA MENSAL ── */}
          {abaAtiva === 'mensal' && (
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-4 py-3">Mês</th>
                        <th className="px-4 py-3 text-center">Qtd Vendas</th>
                        <th className="px-4 py-3 text-right">Total Vendido</th>
                        <th className="px-4 py-3 text-right">Lucro</th>
                        <th className="px-4 py-3 text-right">Margem</th>
                        <th className="px-4 py-3 text-right">Ticket Médio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {porMes.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-8 text-gray-400">Nenhuma venda no período</td></tr>
                      ) : porMes.map((m, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-semibold">{m.mes}</td>
                          <td className="px-4 py-3 text-center">{m.qtdVendas}</td>
                          <td className="px-4 py-3 text-right">{fmtBRL(m.totalVendido)}</td>
                          <td className={`px-4 py-3 text-right font-semibold ${m.totalLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {fmtBRL(m.totalLucro)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {fmtPct(m.totalVendido ? (m.totalLucro / m.totalVendido) * 100 : 0)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {fmtBRL(m.qtdVendas ? m.totalVendido / m.qtdVendas : 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── ABA CONTAS ── */}
          {abaAtiva === 'contas' && (
            <Card>
              <CardHeader>
                <CardTitle>Gastos e Pontos por Conta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-4 py-3">Conta</th>
                        <th className="px-4 py-3 text-center">Compras</th>
                        <th className="px-4 py-3 text-right">Total Investido</th>
                        <th className="px-4 py-3 text-right">Pontos Gerados</th>
                        <th className="px-4 py-3 text-right">% do Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {porConta.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum dado</td></tr>
                      ) : porConta.map((c, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{c.conta}</td>
                          <td className="px-4 py-3 text-center">{c.qtdCompras}</td>
                          <td className="px-4 py-3 text-right">{fmtBRL(c.totalInvestido)}</td>
                          <td className="px-4 py-3 text-right text-yellow-600 font-semibold">
                            {c.totalPontos.toLocaleString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {fmtPct(kpis.totalInvestido ? (c.totalInvestido / kpis.totalInvestido) * 100 : 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── ABA CLIENTES ── */}
          {abaAtiva === 'clientes' && (
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-4 py-3">Cliente</th>
                        <th className="px-4 py-3 text-center">Compras</th>
                        <th className="px-4 py-3 text-right">Total Gasto</th>
                        <th className="px-4 py-3 text-right">Lucro Gerado</th>
                        <th className="px-4 py-3 text-right">Ticket Médio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {porCliente.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhuma venda no período</td></tr>
                      ) : porCliente.map((c, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{c.cliente}</td>
                          <td className="px-4 py-3 text-center font-bold text-blue-600">{c.qtd}</td>
                          <td className="px-4 py-3 text-right">{fmtBRL(c.totalVendido)}</td>
                          <td className={`px-4 py-3 text-right font-semibold ${c.totalLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {fmtBRL(c.totalLucro)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {fmtBRL(c.qtd ? c.totalVendido / c.qtd : 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
