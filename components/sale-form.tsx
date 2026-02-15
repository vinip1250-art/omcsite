'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function SaleForm({ deliveredPurchases, onSuccess }) {
  const [formData, setFormData] = useState({
    purchaseId: '',
    soldValue: '',
    saleDate: new Date().toISOString().split('T')[0],
    customer: ''
  })

  const [selectedPurchase, setSelectedPurchase] = useState(null)
  const [calculatedProfit, setCalculatedProfit] = useState(0)

  useEffect(() => {
    if (formData.purchaseId) {
      const purchase = deliveredPurchases.find(p => p.id === formData.purchaseId)
      setSelectedPurchase(purchase)
    }
  }, [formData.purchaseId, deliveredPurchases])

  useEffect(() => {
    if (selectedPurchase && formData.soldValue) {
      const profit = Math.max(0, parseFloat(formData.soldValue) - selectedPurchase.finalCost)
      setCalculatedProfit(profit)
    }
  }, [formData.soldValue, selectedPurchase])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          soldValue: parseFloat(formData.soldValue),
          profit: calculatedProfit
        })
      })

      if (response.ok) {
        alert('Venda registrada com sucesso!')
        onSuccess()
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error || 'Erro ao registrar venda'}`)
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao registrar venda')
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="purchaseId">Produto *</Label>
          <Select 
            value={formData.purchaseId} 
            onValueChange={(value) => setFormData({...formData, purchaseId: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o produto" />
            </SelectTrigger>
            <SelectContent>
              {deliveredPurchases.map(purchase => (
                <SelectItem key={purchase.id} value={purchase.id}>
                  {purchase.product?.name || 'N/A'} - {purchase.account} - Custo: {formatCurrency(purchase.finalCost)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPurchase && (
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-semibold mb-2">Detalhes da Compra</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600">Produto:</p>
                <p className="font-medium">{selectedPurchase.product?.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Conta:</p>
                <p className="font-medium">{selectedPurchase.account}</p>
              </div>
              <div>
                <p className="text-gray-600">Valor Pago:</p>
                <p className="font-medium">{formatCurrency(selectedPurchase.paidValue)}</p>
              </div>
              <div>
                <p className="text-gray-600">Custo Final:</p>
                <p className="font-medium text-blue-600">{formatCurrency(selectedPurchase.finalCost)}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="soldValue">Valor de Venda *</Label>
          <Input
            id="soldValue"
            type="number"
            step="0.01"
            value={formData.soldValue}
            onChange={(e) => setFormData({...formData, soldValue: e.target.value})}
            required
          />
        </div>

        <div>
          <Label htmlFor="saleDate">Data da Venda *</Label>
          <Input
            id="saleDate"
            type="date"
            value={formData.saleDate}
            onChange={(e) => setFormData({...formData, saleDate: e.target.value})}
            required
          />
        </div>

        <div>
          <Label htmlFor="customer">Cliente *</Label>
          <Input
            id="customer"
            value={formData.customer}
            onChange={(e) => setFormData({...formData, customer: e.target.value})}
            placeholder="Nome do cliente"
            required
          />
        </div>
      </div>

      {selectedPurchase && formData.soldValue && (
        <div className="border-t pt-4 mt-4">
          <div className="bg-green-50 p-4 rounded-md">
            <h4 className="font-semibold mb-2">Lucro Calculado</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Custo Final</p>
                <p className="text-lg font-semibold">{formatCurrency(selectedPurchase.finalCost)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valor de Venda</p>
                <p className="text-lg font-semibold">{formatCurrency(parseFloat(formData.soldValue))}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lucro</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(calculatedProfit)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={!selectedPurchase}>
        Registrar Venda
      </Button>
    </form>
  )
}
