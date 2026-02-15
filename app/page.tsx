import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bem-vindo!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{session.user?.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compras</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Gerencie suas compras</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Controle de estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Registro de vendas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
