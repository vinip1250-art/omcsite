'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SaleForm } from '@/components/sale-form'
import { SalesTable } from '@/components/sales-table'

export default function VendasPage() {
  const [sales, setSales] = useState([])
  const [deliveredPurchases, setDeliveredPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [salesRes, purchasesRes] = await Promise.all([
        fetch('/api/purchases?status=SOLD'),
        fetch('/api/purchases?status=DELIVERED')
      ])

      const salesData = await salesRes.json()
      const purchasesData = await purchasesRes.json()

      setSales(salesData)
      setDeliveredPurchases(purchasesData)
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaleCreated = () => {
    setShowForm(false)
    fetchData()
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Vendas</h1>
        <Button 
          onClick={() => setShowForm(!showForm)}
          disabled={deliveredPurchases.length === 0}
        >
          {showForm ? 'Cancelar' : 'Registrar Venda'}
        </Button>
      </div>

      {deliveredPurchases.length === 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <p className="text-yellow-800">
              Não há produtos entregues disponíveis para venda.
            </p>
          </CardContent>
        </Card>
      )}

      {showForm && deliveredPurchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nova Venda</CardTitle>
          </CardHeader>
          <CardContent>
            <SaleForm 
              deliveredPurchases={deliveredPurchases}
              onSuccess={handleSaleCreated} 
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesTable sales={sales} />
        </CardContent>
      </Card>
    </div>
  )
}
