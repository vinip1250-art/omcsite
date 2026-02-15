'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PurchaseForm from '@/components/purchase-form'
import PurchaseTable from '@/components/purchase-table'

export default function ComprasPage() {
  const [purchases, setPurchases] = useState([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    try {
      const res = await fetch('/api/purchases')
      const data = await res.json()
      setPurchases(data)
    } catch (error) {
      console.error('Erro ao buscar compras:', error)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Compras</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nova Compra'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Compra</CardTitle>
          </CardHeader>
          <CardContent>
            <PurchaseForm onSuccess={() => {
              setShowForm(false)
              fetchPurchases()
            }} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Itens Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseTable purchases={purchases} onUpdate={fetchPurchases} />
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-700">
            💡 <strong>Dica:</strong> Gerencie as contas em{' '}
            <a href="/contas" className="text-blue-600 underline font-medium">Contas</a> antes de cadastrar compras.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
