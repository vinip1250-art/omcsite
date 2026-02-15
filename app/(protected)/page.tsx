import Link from "next/link"
import { ShoppingCart, TrendingUp, Package, Plane } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            OMC Prod
          </h1>
          <p className="text-xl text-gray-600">
            Sistema de Gestão de Revenda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Link href="/compras" className="group">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Compras</h3>
              <p className="text-sm text-gray-600">
                Registre e gerencie suas compras de produtos
              </p>
            </div>
          </Link>

          <Link href="/vendas" className="group">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Vendas</h3>
              <p className="text-sm text-gray-600">
                Controle suas vendas e calcule lucros
              </p>
            </div>
          </Link>

          <Link href="/estoque" className="group">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Estoque</h3>
              <p className="text-sm text-gray-600">
                Monitore seu estoque em tempo real
              </p>
            </div>
          </Link>

          <Link href="/pontos" className="group">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                <Plane className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pontos</h3>
              <p className="text-sm text-gray-600">
                Gerencie pontos e milhas acumulados
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-16 max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Bem-vindo ao Sistema OMC Prod! 🚀
          </h2>
          <div className="space-y-4 text-gray-600">
            <p>
              Este é o seu sistema completo de gestão de revenda, desenvolvido para substituir
              planilhas e otimizar seus processos.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Controle Total</h4>
                  <p className="text-sm">Gerencie compras, vendas e estoque em um só lugar</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Cálculos Automáticos</h4>
                  <p className="text-sm">Lucro, custos e deságio calculados automaticamente</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Relatórios Mensais</h4>
                  <p className="text-sm">Análises e gráficos para tomada de decisão</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Gestão de Pontos</h4>
                  <p className="text-sm">Controle completo de programas de fidelidade</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Desenvolvido com Next.js 15, TypeScript, Prisma e PostgreSQL</p>
        </div>
      </div>
    </div>
  )
}
