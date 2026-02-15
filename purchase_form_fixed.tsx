'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const ACCOUNTS = ['Miri', 'Vini', 'Lindy', 'Milla', 'Tony']
const PROGRAMS = [
  'CB/Azul', 'CB/Esfera', 'CB/Livelo', 'CB/Smiles',
  'Fast/Esfera', 'Fast/Livelo', 'Fast/Smiles',
  'Pagbank/Esfera', 'Pagbank/Livelo'
]

export function PurchaseForm({ onSuccess }) {
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    productId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    orderNumber: '',
    paidValue: '',
    account: 'Miri',
    freight: '0',
    advanceDiscountPercent: '3.67',
    pointsReceived: false, // MUDADO PARA BOOLEAN
    thousand: '14',
    program: 'CB/Azul',
    pointsPerReal: '14'
  })

  const [calculated, setCalculated] = useState({
    advanceDiscount: 0,
    points: 0,
    cashback: 0,
    finalCost: 0
  })

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
  }, [])

  useEffect(() => {
    calculate()
  }, [formData.paidValue, formData.freight, formData.advanceDiscountPercent, formData.thousand, formData.pointsPerReal])

  const calculate = () => {
    const paid = parseFloat(formData.paidValue) || 0
    const freight = parseFloat(formData.freight) || 0
    const discountPercent = parseFloat(formData.advanceDiscountPercent) || 0
    const thousand = parseFloat(formData.thousand) || 0
    const pointsPerReal = parseFloat(formData.pointsPerReal) || 0

    const advanceDiscount = paid * (discountPercent / 100)
    const points = paid * pointsPerReal
    const cashback = (points * thousand) / 1000
    const finalCost = paid + freight - advanceDiscount - cashback

    setCalculated({
      advanceDiscount: advanceDiscount.toFixed(2),
      points: points.toFixed(0),
      cashback: cashback.toFixed(2),
      finalCost: finalCost.toFixed(2)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          deliveryDate: formData.deliveryDate || null,
          orderNumber: formData.orderNumber || null,
          paidValue: parseFloat(formData.paidValue),
          freight: parseFloat(formData.freight),
          advanceDiscountPercent: parseFloat(formData.advanceDiscountPercent),
          advanceDiscount: parseFloat(calculated.advanceDiscount),
          points: parseFloat(calculated.points),
          thousand: parseFloat(formData.thousand),
          cashback: parseFloat(calculated.cashback),
          pointsPerReal: parseFloat(formData.pointsPerReal),
          finalCost: parseFloat(calculated.finalCost),
          pointsReceived: formData.pointsReceived // Já é boolean
        })
      })

      if (response.ok) {
        alert('Compra cadastrada com sucesso!')
        onSuccess()
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error || 'Erro ao cadastrar compra'}`)
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao cadastrar compra')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="productId">Produto *</Label>
          <Select value={formData.productId} onValueChange={(value) => setFormData({...formData, productId: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o produto" />
            </SelectTrigger>
            <SelectContent>
              {products.map(product => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="account">Conta *</Label>
          <Select value={formData.account} onValueChange={(value) => setFormData({...formData, account: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACCOUNTS.map(acc => (
                <SelectItem key={acc} value={acc}>{acc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="purchaseDate">Data da Compra *</Label>
          <Input
            id="purchaseDate"
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
            required
          />
        </div>

        <div>
          <Label htmlFor="deliveryDate">Data de Entrega</Label>
          <Input
            id="deliveryDate"
            type="date"
            value={formData.deliveryDate}
            onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
          />
        </div>

        <div>
          <Label htmlFor="orderNumber">Número do Pedido</Label>
          <Input
            id="orderNumber"
            value={formData.orderNumber}
            onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
          />
        </div>

        <div>
          <Label htmlFor="paidValue">Valor Pago *</Label>
          <Input
            id="paidValue"
            type="number"
            step="0.01"
            value={formData.paidValue}
            onChange={(e) => setFormData({...formData, paidValue: e.target.value})}
            required
          />
        </div>

        <div>
          <Label htmlFor="freight">Frete</Label>
          <Input
            id="freight"
            type="number"
            step="0.01"
            value={formData.freight}
            onChange={(e) => setFormData({...formData, freight: e.target.value})}
          />
        </div>

        <div>
          <Label htmlFor="advanceDiscountPercent">Desconto Antecipado (%)</Label>
          <Input
            id="advanceDiscountPercent"
            type="number"
            step="0.01"
            value={formData.advanceDiscountPercent}
            onChange={(e) => setFormData({...formData, advanceDiscountPercent: e.target.value})}
          />
        </div>

        <div>
          <Label htmlFor="program">Clube e Loja *</Label>
          <Select value={formData.program} onValueChange={(value) => setFormData({...formData, program: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROGRAMS.map(prog => (
                <SelectItem key={prog} value={prog}>{prog}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="pointsPerReal">Pontos por R$ 1,00 *</Label>
          <Input
            id="pointsPerReal"
            type="number"
            step="0.01"
            value={formData.pointsPerReal}
            onChange={(e) => setFormData({...formData, pointsPerReal: e.target.value})}
            required
          />
        </div>

        <div>
          <Label htmlFor="thousand">Valor do Milheiro *</Label>
          <Input
            id="thousand"
            type="number"
            step="0.01"
            value={formData.thousand}
            onChange={(e) => setFormData({...formData, thousand: e.target.value})}
            required
          />
        </div>

        <div>
          <Label htmlFor="pointsReceived">Pontos Recebidos</Label>
          <Select 
            value={formData.pointsReceived ? 'true' : 'false'} 
            onValueChange={(value) => setFormData({...formData, pointsReceived: value === 'true'})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Sim</SelectItem>
              <SelectItem value="false">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="font-semibold mb-2">Valores Calculados</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Desconto Antecipado</p>
            <p className="text-lg font-semibold">R$ {calculated.advanceDiscount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Pontos</p>
            <p className="text-lg font-semibold">{calculated.points}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Cashback</p>
            <p className="text-lg font-semibold">R$ {calculated.cashback}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Custo Final</p>
            <p className="text-lg font-semibold text-green-600">R$ {calculated.finalCost}</p>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full">Cadastrar Compra</Button>
    </form>
  )
}
