'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function VendasPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Vendas</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestão de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Página em construção...</p>
        </CardContent>
      </Card>
    </div>
  )
}
