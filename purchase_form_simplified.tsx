'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const ACCOUNTS = ['Miri', 'Vini', 'Lindy', 'Milla', 'Tony']

export function PurchaseForm({ onSuccess }) {
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '1',
    purchaseDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    orderNumber: '',
    paidValue: '',
    account: 'Miri',
    freight: '0',
    advanceDiscountPercent: '3.67',
    advanceDiscountValue: '0',
    discountType: 'percent',
    thousand: '14',
    clubAndStore: '', // DIGITÁVEL: Ex: "Esfera CB"
    pointsPerReal: '14',
    cashbackValue: '0',
    cashbackPercent: '0',
    cashbackType: 'value'
  })

  const [calculated, setCalculated] = useState({
    totalPaid: 0,
    advanceDiscount: 0,
    points: 0,
    cashbackFromPoints: 0,
    cashbackExtra: 0,
    cashbackTotal: 0,
    finalCostUnit: 0,
    finalCostTotal: 0
  })

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(prods => setProducts(prods))
  }, [])

  useEffect(() => {
    calculate()
  }, [
    formData.paidValue,
    formData.quantity, 
    formData.freight, 
    formData.advanceDiscountPercent,
    formData.advanceDiscountValue,
    formData.discountType,
    formData.thousand, 
    formData.pointsPerReal,
    formData.cashbackValue,
    formData.cashbackPercent,
    formData.cashbackType
  ])

  const calculate = () => {
    const paidUnit = parseFloat(formData.paidValue) || 0
    const quantity = parseFloat(formData.quantity) || 1
    const freight = parseFloat(formData.freight) || 0
    const thousand = parseFloat(formData.thousand) || 0
    const pointsPerReal = parseFloat(formData.pointsPerReal) || 0

    const totalPaid = paidUnit * quantity

    let advanceDiscount = 0
    if (formData.discountType === 'percent') {
      const discountPercent = parseFloat(formData.advanceDiscountPercent) || 0
      advanceDiscount = totalPaid * (discountPercent / 100)
    } else {
      advanceDiscount = parseFloat(formData.advanceDiscountValue) || 0
    }

    const points = totalPaid * pointsPerReal
    const cashbackFromPoints = (points * thousand) / 1000

    let cashbackExtra = 0
    if (formData.cashbackType === 'value') {
      cashbackExtra = parseFloat(formData.cashbackValue) || 0
    } else {
      const cashbackPercent = parseFloat(formData.cashbackPercent) || 0
      cashbackExtra = totalPaid * (cashbackPercent / 100)
    }

    const cashbackTotal = cashbackFromPoints + cashbackExtra
    const finalCostTotal = totalPaid + freight - advanceDiscount - cashbackTotal
    const finalCostUnit = finalCostTotal / quantity

    setCalculated({
      totalPaid: totalPaid.toFixed(2),
      advanceDiscount: advanceDiscount.toFixed(2),
      points: points.toFixed(0),
      cashbackFromPoints: cashbackFromPoints.toFixed(2),
      cashbackExtra: cashbackExtra.toFixed(2),
      cashbackTotal: cashbackTotal.toFixed(2),
      finalCostUnit: finalCostUnit.toFixed(2),
      finalCostTotal: finalCostTotal.toFixed(2)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.clubAndStore.trim()) {
      alert('Informe o Programa/Loja (ex: Esfera CB)')
      return
    }

    const quantity = parseFloat(formData.quantity) || 1

    try {
      const promises = []

      for (let i = 0; i < quantity; i++) {
        promises.push(
          fetch('/api/purchases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: formData.productId,
              purchaseDate: formData.purchaseDate,
              deliveryDate: formData.deliveryDate || null,
              orderNumber: formData.orderNumber || null,
              paidValue: parseFloat(formData.paidValue),
              account: formData.account,
              freight: i === 0 ? parseFloat(formData.freight) : 0,
              advanceDiscount: parseFloat(calculated.advanceDiscount) / quantity,
              points: parseFloat(calculated.points) / quantity,
              thousand: parseFloat(formData.thousand),
              cashback: parseFloat(calculated.cashbackTotal) / quantity,
              clubAndStore: formData.clubAndStore.trim(),
              pointsPerReal: parseFloat(formData.pointsPerReal),
              finalCost: parseFloat(calculated.finalCostUnit),
              pointsReceived: false,
              status: 'PENDING'
            })
          })
        )
      }

      const results = await Promise.all(promises)
      const allSuccess = results.every(r => r.ok)

      if (allSuccess) {
        alert(`${quantity} compra(s) cadastrada(s) com sucesso!`)
        // Limpar form
        setFormData({
          ...formData,
          productId: '',
          quantity: '1',
          paidValue: '',
          orderNumber: '',
          clubAndStore: '',
          freight: '0',
          cashbackValue: '0'
        })
        onSuccess()
      } else {
        alert('Erro ao cadastrar algumas compras')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao cadastrar compra')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Produto *</Label>
          <Select value={formData.productId} onValueChange={(value) => setFormData({...formData, productId: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {products.map(product => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <a href="/produtos" target="_blank" className="text-xs text-blue-600 hover:underline">+ Cadastrar novo</a>
        </div>

        <div>
          <Label>Quantidade *</Label>
          <Input
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Cada unidade será cadastrada separadamente</p>
        </div>

        <div>
          <Label>Valor Unitário *</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.paidValue}
            onChange={(e) => setFormData({...formData, paidValue: e.target.value})}
            required
          />
        </div>

        <div>
          <Label>Conta *</Label>
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
          <Label>Programa/Loja *</Label>
          <Input
            value={formData.clubAndStore}
            onChange={(e) => setFormData({...formData, clubAndStore: e.target.value})}
            placeholder="Ex: Esfera CB, Livelo Fast, Smiles ML"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Digite livremente. Ex: Esfera CB = Esfera na Casas Bahia</p>
        </div>

        <div>
          <Label>Data da Compra *</Label>
          <Input
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
            required
          />
        </div>

        <div>
          <Label>Número do Pedido</Label>
          <Input
            value={formData.orderNumber}
            onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
            placeholder="Opcional"
          />
        </div>

        <div>
          <Label>Frete (fixo)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.freight}
            onChange={(e) => setFormData({...formData, freight: e.target.value})}
          />
        </div>

        <div>
          <Label>Desconto Antecipado</Label>
          <div className="flex gap-2">
            <Select value={formData.discountType} onValueChange={(value) => setFormData({...formData, discountType: value})}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">%</SelectItem>
                <SelectItem value="value">R$</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              step="0.01"
              value={formData.discountType === 'percent' ? formData.advanceDiscountPercent : formData.advanceDiscountValue}
              onChange={(e) => setFormData({
                ...formData, 
                [formData.discountType === 'percent' ? 'advanceDiscountPercent' : 'advanceDiscountValue']: e.target.value
              })}
            />
          </div>
        </div>

        <div>
          <Label>Pontos por R$ 1,00 *</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.pointsPerReal}
            onChange={(e) => setFormData({...formData, pointsPerReal: e.target.value})}
            required
          />
        </div>

        <div>
          <Label>Valor do Milheiro *</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.thousand}
            onChange={(e) => setFormData({...formData, thousand: e.target.value})}
            required
          />
        </div>

        <div>
          <Label>Cashback Extra (opcional)</Label>
          <div className="flex gap-2">
            <Select value={formData.cashbackType} onValueChange={(value) => setFormData({...formData, cashbackType: value})}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="value">R$</SelectItem>
                <SelectItem value="percent">%</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              step="0.01"
              value={formData.cashbackType === 'value' ? formData.cashbackValue : formData.cashbackPercent}
              onChange={(e) => setFormData({
                ...formData,
                [formData.cashbackType === 'value' ? 'cashbackValue' : 'cashbackPercent']: e.target.value
              })}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4 mt-4 bg-gray-50 p-4 rounded-md">
        <h3 className="font-semibold mb-3">Valores Calculados</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Pago</p>
            <p className="text-lg font-semibold">R$ {calculated.totalPaid}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Desconto</p>
            <p className="text-lg font-semibold">R$ {calculated.advanceDiscount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pontos</p>
            <p className="text-lg font-semibold">{calculated.points}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cashback Pontos</p>
            <p className="text-lg font-semibold">R$ {calculated.cashbackFromPoints}</p>
          </div>
          {parseFloat(calculated.cashbackExtra) > 0 && (
            <div>
              <p className="text-sm text-gray-600">Cashback Extra</p>
              <p className="text-lg font-semibold text-green-600">R$ {calculated.cashbackExtra}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">Cashback Total</p>
            <p className="text-lg font-bold text-green-600">R$ {calculated.cashbackTotal}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Custo Unit. Final</p>
            <p className="text-xl font-bold text-blue-600">R$ {calculated.finalCostUnit}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Custo Total Final</p>
            <p className="text-2xl font-bold text-blue-600">R$ {calculated.finalCostTotal}</p>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg">
        Cadastrar {formData.quantity} Compra(s)
      </Button>
    </form>
  )
}
