'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function PurchaseForm({ onSuccess }) {
  const [products, setProducts] = useState([])
  const [programs, setPrograms] = useState([])
  const [formData, setFormData] = useState({
    productId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    orderNumber: '',
    paidValue: '',
    account: 'Miri',
    freight: '0',
    advanceDiscountPercent: '3.67',
    advanceDiscountValue: '0',
    discountType: 'percent', // percent ou value
    thousand: '14',
    program: '',
    pointsPerReal: '14',
    cashbackValue: '0',
    cashbackPercent: '0',
    cashbackType: 'value' // value ou percent
  })

  const [calculated, setCalculated] = useState({
    advanceDiscount: 0,
    points: 0,
    cashback: 0,
    finalCost: 0
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/programs').then(res => res.json())
    ]).then(([prods, progs]) => {
      setProducts(prods)
      setPrograms(progs)
    })
  }, [])

  useEffect(() => {
    calculate()
  }, [
    formData.paidValue, 
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
    const paid = parseFloat(formData.paidValue) || 0
    const freight = parseFloat(formData.freight) || 0
    const thousand = parseFloat(formData.thousand) || 0
    const pointsPerReal = parseFloat(formData.pointsPerReal) || 0

    // Desconto antecipado
    let advanceDiscount = 0
    if (formData.discountType === 'percent') {
      const discountPercent = parseFloat(formData.advanceDiscountPercent) || 0
      advanceDiscount = paid * (discountPercent / 100)
    } else {
      advanceDiscount = parseFloat(formData.advanceDiscountValue) || 0
    }

    // Pontos
    const points = paid * pointsPerReal

    // Cashback
    let cashback = 0
    if (formData.cashbackType === 'value') {
      cashback = parseFloat(formData.cashbackValue) || 0
    } else {
      const cashbackPercent = parseFloat(formData.cashbackPercent) || 0
      cashback = paid * (cashbackPercent / 100)
    }

    // Se cashback for 0, usar cálculo por pontos
    if (cashback === 0) {
      cashback = (points * thousand) / 1000
    }

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
          advanceDiscount: parseFloat(calculated.advanceDiscount),
          points: parseFloat(calculated.points),
          thousand: parseFloat(formData.thousand),
          cashback: parseFloat(calculated.cashback),
          pointsPerReal: parseFloat(formData.pointsPerReal),
          finalCost: parseFloat(calculated.finalCost),
          pointsReceived: false
        })
      })

      if (response.ok) {
        alert('Compra cadastrada com sucesso!')
        onSuccess()
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error || 'Erro ao cadastrar'}`)
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
          <Label htmlFor="productId">Produto *</Label>
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
          <a href="/produtos" className="text-xs text-blue-600 hover:underline">+ Cadastrar novo</a>
        </div>

        <div>
          <Label htmlFor="account">Conta *</Label>
          <Select value={formData.account} onValueChange={(value) => setFormData({...formData, account: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Miri">Miri</SelectItem>
              <SelectItem value="Vini">Vini</SelectItem>
              <SelectItem value="Lindy">Lindy</SelectItem>
              <SelectItem value="Milla">Milla</SelectItem>
              <SelectItem value="Tony">Tony</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="program">Programa/Loja *</Label>
          <Select value={formData.program} onValueChange={(value) => setFormData({...formData, program: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {programs.map(prog => (
                <SelectItem key={prog.id} value={prog.name}>
                  {prog.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <a href="/programas" className="text-xs text-blue-600 hover:underline">+ Cadastrar novo</a>
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
          />
        </div>

        <div>
          <Label>Valor Pago *</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.paidValue}
            onChange={(e) => setFormData({...formData, paidValue: e.target.value})}
            required
          />
        </div>

        <div>
          <Label>Frete</Label>
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
              <SelectTrigger className="w-24">
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
          <Label>Cashback</Label>
          <div className="flex gap-2">
            <Select value={formData.cashbackType} onValueChange={(value) => setFormData({...formData, cashbackType: value})}>
              <SelectTrigger className="w-24">
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
      </div>

      <div className="border-t pt-4 mt-4 bg-gray-50 p-4 rounded-md">
        <h3 className="font-semibold mb-3">Valores Calculados</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Desconto Antecipado</p>
            <p className="text-lg font-semibold">R$ {calculated.advanceDiscount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pontos</p>
            <p className="text-lg font-semibold">{calculated.points}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cashback</p>
            <p className="text-lg font-semibold">R$ {calculated.cashback}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Custo Final</p>
            <p className="text-2xl font-bold text-green-600">R$ {calculated.finalCost}</p>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full">Cadastrar Compra</Button>
    </form>
  )
}
