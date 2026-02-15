import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function RelatoriosPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Relatorios</h1>
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Relatorios</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Página em construção...</p>
        </CardContent>
      </Card>
    </div>
  )
}
