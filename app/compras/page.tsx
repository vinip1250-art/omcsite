'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PurchaseForm from '@/components/purchase-form'
import PurchaseTable from '@/components/purchase-table'

export default function ComprasPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Compras</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Fechar' : 'Nova Compra'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Compra</CardTitle>
          </CardHeader>
          <CardContent>
            <PurchaseForm onSuccess={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      <PurchaseTable />
    </div>
  )
}
