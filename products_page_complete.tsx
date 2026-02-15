'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function ProdutosPage() {
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    storage: '',
    color: ''
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products/all')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const url = editingProduct 
        ? `/api/products/${editingProduct.id}`
        : '/api/products'

      const method = editingProduct ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert(editingProduct ? 'Produto atualizado!' : 'Produto cadastrado!')
        setShowForm(false)
        setEditingProduct(null)
        setFormData({ name: '', model: '', storage: '', color: '' })
        fetchProducts()
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar produto')
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      model: product.model,
      storage: product.storage,
      color: product.color
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Confirma a exclusão do produto?')) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Produto excluído!')
        fetchProducts()
      }
    } catch (error) {
      alert('Erro ao excluir produto')
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <Button onClick={() => {
          setShowForm(!showForm)
          setEditingProduct(null)
          setFormData({ name: '', model: '', storage: '', color: '' })
        }}>
          {showForm ? 'Cancelar' : '+ Novo Produto'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProduct ? 'Editar' : 'Novo'} Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome Completo *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: iPhone 15 Pro 256GB Azul"
                    required
                  />
                </div>
                <div>
                  <Label>Modelo *</Label>
                  <Input
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    placeholder="Ex: 15 Pro"
                    required
                  />
                </div>
                <div>
                  <Label>Armazenamento *</Label>
                  <Input
                    value={formData.storage}
                    onChange={(e) => setFormData({...formData, storage: e.target.value})}
                    placeholder="Ex: 256GB"
                    required
                  />
                </div>
                <div>
                  <Label>Cor *</Label>
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    placeholder="Ex: Azul"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingProduct ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Armazenamento</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.model}</TableCell>
                  <TableCell>{product.storage}</TableCell>
                  <TableCell>{product.color}</TableCell>
                  <TableCell>
                    <Badge variant={product.active ? 'default' : 'secondary'}>
                      {product.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleEdit(product)}>
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
