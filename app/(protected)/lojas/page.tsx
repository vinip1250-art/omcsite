'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LojasPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Lojas</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestão de Lojas</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Página em construção...</p>
        </CardContent>
      </Card>
    </div>
  )
}
