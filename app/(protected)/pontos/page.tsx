'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PontosPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pontos</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestão de Pontos</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Página de pontos em construção...</p>
        </CardContent>
      </Card>
    </div>
  )
}
