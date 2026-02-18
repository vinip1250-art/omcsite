import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function getDashboardData(userId: string) {
  const hoje = new Date()
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const inicioMesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
  const fimMesPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0, 23, 59, 59)

  const [
    todasCompras,
    vendasMes,
    vendasMesPassado,
    comprasMes,
    estoque,
    pendentes,
    ultimasVendas,
    ultimasCompras,
    pontosAReceber,
  ] = await Promise.all([
    prisma.purchase.findMany({ where: { userId }, include: { product: true } }),
    prisma.purchase.findMany({
      where: { userId, status: 'SOLD', saleDate: { gte: inicioMes } },
      include: { product: true },
    }),
    prisma.purchase.findMany({
      where: { userId, status: 'SOLD', saleDate: { gte: inicioMesPassado, lte: fimMesPassado } },
      include: { product: true },
    }),
    prisma.purchase.findMany({
      where: { userId, purchaseDate: { gte: inicioMes } },
    }),
    prisma.purchase.findMany({
      where: { userId, status: 'DELIVERED' },
      include: { product: true },
    }),
    prisma.purchase.findMany({
      where: { userId, status: 'PENDING' },
      include: { product: true },
    }),
    prisma.purchase.findMany({
      where: { userId, status: 'SOLD' },
      include: { product: true },
      orderBy: { saleDate: 'desc' },
      take: 5,
    }),
    prisma.purchase.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { purchaseDate: 'desc' },
      take: 5,
    }),
    prisma.purchase.findMany({
      where: { userId, pointsReceived: false, points: { gt: 0 } },
    }),
  ])

  // KPIs mês atual
  const lucroMes       = vendasMes.reduce((s, v) => s + (v.profit ?? 0), 0)
  const faturamentoMes = vendasMes.reduce((s, v) => s + (v.soldValue ?? 0), 0)
  const lucroMesPass   = vendasMesPassado.reduce((s, v) => s + (v.profit ?? 0), 0)
  const varLucro       = lucroMesPass > 0 ? ((lucroMes - lucroMesPass) / lucroMesPass) * 100 : null

  // Estoque
  const custoEstoque   = estoque.reduce((s, c) => s + c.finalCost, 0)
  const custoPendentes = pendentes.reduce((s, c) => s + c.finalCost, 0)

  // Pontos
  const totalPontosAReceber = pontosAReceber.reduce((s, c) => s + c.points, 0)

  // Produto mais vendido (histórico)
  const contaProd: Record<string, { nome: string; qtd: number; lucro: number }> = {}
  todasCompras.filter(c => c.status === 'SOLD').forEach(c => {
    const k = c.productId
    const nome = [c.product?.name, c.product?.model, c.product?.storage, c.product?.color].filter(Boolean).join(' ')
    if (!contaProd[k]) contaProd[k] = { nome, qtd: 0, lucro: 0 }
    contaProd[k].qtd++
    contaProd[k].lucro += c.profit ?? 0
  })
  const topProdutos = Object.values(contaProd).sort((a, b) => b.qtd - a.qtd).slice(0, 5)

  // Giro médio
  const diasGiro = todasCompras
    .filter(c => c.status === 'SOLD' && c.saleDate)
    .map(c => Math.max(0, Math.floor((new Date(c.saleDate!).getTime() - new Date(c.purchaseDate).getTime()) / 86400000)))
  const giroMedio = diasGiro.length ? Math.round(diasGiro.reduce((a, b) => a + b, 0) / diasGiro.length) : 0

  // Margem média histórica
  const vendasAll = todasCompras.filter(c => c.status === 'SOLD')
  const margemMedia = vendasAll.length
    ? (vendasAll.reduce((s, c) => s + (c.profit ?? 0), 0) / vendasAll.reduce((s, c) => s + (c.soldValue ?? 1), 0)) * 100
    : 0

  return {
    vendasMes: vendasMes.length,
    faturamentoMes,
    lucroMes,
    varLucro,
    comprasMes: comprasMes.length,
    estoqueQtd: estoque.length,
    custoEstoque,
    pendentesQtd: pendentes.length,
    custoPendentes,
    totalPontosAReceber,
    topProdutos,
    giroMedio,
    margemMedia,
    ultimasVendas,
    ultimasCompras,
    totalVendas: vendasAll.length,
  }
}

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')

  const d = await getDashboardData(session.user.id)

  const fmtBRL = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  const fmtPts = (v: number) => v.toLocaleString('pt-BR')
  const nomeProduto = (p: any) =>
    [p?.name, p?.model, p?.storage, p?.color].filter(Boolean).join(' ')

  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="container mx-auto p-6 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1 capitalize">{mesAtual}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Bem-vindo,</p>
          <p className="text-lg font-semibold text-blue-600">{session.user?.name}</p>
        </div>
      </div>

      {/* KPIs do mês */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Este mês</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">Vendas</p>
              <p className="text-3xl font-bold text-green-600">{d.vendasMes}</p>
              <p className="text-xs text-gray-400">unidades vendidas</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">Faturamento</p>
              <p className="text-xl font-bold text-blue-600">{fmtBRL(d.faturamentoMes)}</p>
              <p className="text-xs text-gray-400">receita bruta</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">Lucro</p>
              <p className={`text-xl font-bold ${d.lucroMes >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {fmtBRL(d.lucroMes)}
              </p>
              {d.varLucro !== null && (
                <p className={`text-xs font-medium ${d.varLucro >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {d.varLucro >= 0 ? '▲' : '▼'} {Math.abs(d.varLucro).toFixed(1)}% vs mês passado
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-400">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">Compras</p>
              <p className="text-3xl font-bold text-orange-500">{d.comprasMes}</p>
              <p className="text-xs text-gray-400">unidades compradas</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Métricas gerais + Estoque */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Métricas históricas */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Histórico Geral</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-500">Total Vendas</p>
                <p className="text-2xl font-bold text-gray-800">{d.totalVendas}</p>
                <p className="text-xs text-gray-400">desde o início</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-500">Margem Média</p>
                <p className={`text-2xl font-bold ${d.margemMedia >= 10 ? 'text-green-600' : d.margemMedia >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {d.margemMedia.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400">sobre vendas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-500">Giro Médio</p>
                <p className="text-2xl font-bold text-purple-600">{d.giroMedio} dias</p>
                <p className="text-xs text-gray-400">compra → venda</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-500">Pontos a Receber</p>
                <p className="text-2xl font-bold text-yellow-600">{fmtPts(d.totalPontosAReceber)}</p>
                <p className="text-xs text-gray-400">pts pendentes</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Estoque */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Estoque</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-l-4 border-l-blue-400">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500">Em Estoque</p>
                <p className="text-2xl font-bold text-blue-600">{d.estoqueQtd}</p>
                <p className="text-xs text-gray-400">{fmtBRL(d.custoEstoque)} investido</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-400">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500">A Caminho</p>
                <p className="text-2xl font-bold text-yellow-600">{d.pendentesQtd}</p>
                <p className="text-xs text-gray-400">{fmtBRL(d.custoPendentes)} em trânsito</p>
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 mb-1">Capital Total Alocado</p>
                <p className="text-2xl font-bold text-gray-800">
                  {fmtBRL(d.custoEstoque + d.custoPendentes)}
                </p>
                <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${d.custoEstoque + d.custoPendentes > 0
                        ? (d.custoEstoque / (d.custoEstoque + d.custoPendentes)) * 100
                        : 0}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>🔵 Estoque {d.custoEstoque + d.custoPendentes > 0 ? ((d.custoEstoque / (d.custoEstoque + d.custoPendentes)) * 100).toFixed(0) : 0}%</span>
                  <span>🟡 A caminho {d.custoEstoque + d.custoPendentes > 0 ? ((d.custoPendentes / (d.custoEstoque + d.custoPendentes)) * 100).toFixed(0) : 0}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Top Produtos + Atividade Recente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Top produtos */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">🏆 Produtos Mais Vendidos</CardTitle>
              <Link href="/relatorios" className="text-xs text-blue-500 hover:underline">Ver relatório →</Link>
            </div>
          </CardHeader>
          <CardContent>
            {d.topProdutos.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Nenhuma venda registrada</p>
            ) : (
              <div className="space-y-3">
                {d.topProdutos.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`text-sm font-bold w-5 text-center ${
                      i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-gray-300'
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.nome}</p>
                      <p className="text-xs text-gray-400">{p.qtd} vendas · lucro {fmtBRL(p.lucro)}</p>
                    </div>
                    <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(p.qtd / d.topProdutos[0].qtd) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Últimas vendas */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">🛒 Últimas Vendas</CardTitle>
              <Link href="/vendas" className="text-xs text-blue-500 hover:underline">Ver todas →</Link>
            </div>
          </CardHeader>
          <CardContent>
            {d.ultimasVendas.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Nenhuma venda registrada</p>
            ) : (
              <div className="space-y-3">
                {d.ultimasVendas.map((v) => (
                  <div key={v.id} className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{nomeProduto(v.product)}</p>
                      <p className="text-xs text-gray-400">
                        {v.customer || 'Cliente não informado'} · {v.saleDate ? new Date(v.saleDate).toLocaleDateString('pt-BR') : '—'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">{fmtBRL(v.soldValue ?? 0)}</p>
                      <p className={`text-xs font-medium ${(v.profit ?? 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {(v.profit ?? 0) >= 0 ? '+' : ''}{fmtBRL(v.profit ?? 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Últimas compras */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">📦 Últimas Compras</CardTitle>
            <Link href="/compras" className="text-xs text-blue-500 hover:underline">Ver todas →</Link>
          </div>
        </CardHeader>
        <CardContent>
          {d.ultimasCompras.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Nenhuma compra registrada</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2 text-xs text-gray-400 font-medium">Produto</th>
                    <th className="pb-2 text-xs text-gray-400 font-medium">Conta</th>
                    <th className="pb-2 text-xs text-gray-400 font-medium text-center">Status</th>
                    <th className="pb-2 text-xs text-gray-400 font-medium text-right">Custo</th>
                    <th className="pb-2 text-xs text-gray-400 font-medium text-center">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {d.ultimasCompras.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="py-2 font-medium max-w-[180px] truncate">{nomeProduto((c as any).product)}</td>
                      <td className="py-2 text-gray-500">{c.account}</td>
                      <td className="py-2 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          c.status === 'SOLD'      ? 'bg-green-100 text-green-700' :
                          c.status === 'DELIVERED' ? 'bg-blue-100 text-blue-700'  :
                                                     'bg-yellow-100 text-yellow-700'
                        }`}>
                          {c.status === 'SOLD' ? 'Vendido' : c.status === 'DELIVERED' ? 'Em estoque' : 'A caminho'}
                        </span>
                      </td>
                      <td className="py-2 text-right font-semibold">{fmtBRL(c.finalCost)}</td>
                      <td className="py-2 text-center text-gray-400">
                        {new Date(c.purchaseDate).toLocaleDateString('pt-BR')}
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
